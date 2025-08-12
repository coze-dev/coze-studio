/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package service

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"unicode/utf8"

	"github.com/cloudwego/eino/components/retriever"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"golang.org/x/sync/errgroup"

	knowledgeModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/consts"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/convert"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/nl2sql"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/rerank"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/contract/messages2query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/rdb"
	sqlparsercontract "github.com/coze-dev/coze-studio/backend/infra/contract/sqlparser"
	"github.com/coze-dev/coze-studio/backend/infra/impl/sqlparser"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/sets"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (k *knowledgeSVC) Retrieve(ctx context.Context, request *RetrieveRequest) (response *RetrieveResponse, err error) {
	if request == nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is nil"))
	}
	if len(request.Query) == 0 {
		return &knowledgeModel.RetrieveResponse{}, nil
	}
	retrieveContext, err := k.newRetrieveContext(ctx, request)
	if err != nil {
		return nil, err
	}
	if len(retrieveContext.Documents) == 0 {
		return &knowledgeModel.RetrieveResponse{}, nil
	}
	chain := compose.NewChain[*RetrieveContext, []*knowledgeModel.RetrieveSlice]()
	rewriteNode := compose.InvokableLambda(k.queryRewriteNode)
	// vectorized recall
	vectorRetrieveNode := compose.InvokableLambda(k.vectorRetrieveNode)
	// ES recall
	EsRetrieveNode := compose.InvokableLambda(k.esRetrieveNode)
	// Nl2Sql recall
	Nl2SqlRetrieveNode := compose.InvokableLambda(k.nl2SqlRetrieveNode)
	// pass user query Node
	passRequestContextNode := compose.InvokableLambda(k.passRequestContext)
	// reRank Node
	reRankNode := compose.InvokableLambda(k.reRankNode)
	// Pack Result Interface
	packResult := compose.InvokableLambda(k.packResults)
	parallelNode := compose.NewParallel().
		AddLambda("vectorRetrieveNode", vectorRetrieveNode).
		AddLambda("esRetrieveNode", EsRetrieveNode).
		AddLambda("nl2SqlRetrieveNode", Nl2SqlRetrieveNode).
		AddLambda("passRequestContext", passRequestContextNode)

	r, err := chain.
		AppendLambda(rewriteNode).
		AppendParallel(parallelNode).
		AppendLambda(reRankNode).
		AppendLambda(packResult).
		Compile(ctx)
	if err != nil {
		logs.CtxErrorf(ctx, "compile chain failed: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeBuildRetrieveChainFailCode, errorx.KV("msg", err.Error()))
	}
	output, err := r.Invoke(ctx, retrieveContext)
	if err != nil {
		logs.CtxErrorf(ctx, "invoke chain failed: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeRetrieveExecFailCode, errorx.KV("msg", err.Error()))
	}
	return &RetrieveResponse{
		RetrieveSlices: output,
	}, nil
}

func (k *knowledgeSVC) newRetrieveContext(ctx context.Context, req *RetrieveRequest) (*RetrieveContext, error) {
	if req.Strategy == nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "strategy is required"))
	}
	knowledgeIDSets := sets.FromSlice(req.KnowledgeIDs)
	docIDSets := sets.FromSlice(req.DocumentIDs)
	enableDocs, enableKnowledge, err := k.prepareRAGDocuments(ctx, docIDSets.ToSlice(), knowledgeIDSets.ToSlice())
	if err != nil {
		logs.CtxErrorf(ctx, "prepare rag documents failed: %v", err)
		return nil, err
	}
	if len(enableDocs) == 0 {
		return &RetrieveContext{}, nil
	}
	knowledgeInfoMap := make(map[int64]*KnowledgeInfo)
	for _, kn := range enableKnowledge {
		if knowledgeInfoMap[kn.ID] == nil {
			knowledgeInfoMap[kn.ID] = &KnowledgeInfo{}
			knowledgeInfoMap[kn.ID].DocumentType = knowledgeModel.DocumentType(kn.FormatType)
			knowledgeInfoMap[kn.ID].DocumentIDs = []int64{}
		}
	}
	for _, doc := range enableDocs {
		info, found := knowledgeInfoMap[doc.KnowledgeID]
		if !found {
			continue
		}
		info.DocumentIDs = append(info.DocumentIDs, doc.ID)
		if info.DocumentType == knowledgeModel.DocumentTypeTable && info.TableColumns == nil && doc.TableInfo != nil {
			info.TableColumns = doc.TableInfo.Columns
		}
	}

	var cm chatmodel.BaseChatModel
	if req.ChatModelProtocol != nil && req.ChatModelConfig != nil {
		cm, err = k.modelFactory.CreateChatModel(ctx, ptr.From(req.ChatModelProtocol), req.ChatModelConfig)
		if err != nil {
			return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode,
				errorx.KV("msg", "invalid retriever chat model protocol or config"))
		}
	}

	resp := RetrieveContext{
		Ctx:              ctx,
		OriginQuery:      req.Query,
		ChatHistory:      append(req.ChatHistory, schema.UserMessage(req.Query)),
		KnowledgeIDs:     knowledgeIDSets,
		KnowledgeInfoMap: knowledgeInfoMap,
		Strategy:         req.Strategy,
		Documents:        enableDocs,
		ChatModel:        cm,
	}
	return &resp, nil
}

func (k *knowledgeSVC) prepareRAGDocuments(ctx context.Context, documentIDs []int64, knowledgeIDs []int64) ([]*model.KnowledgeDocument, []*model.Knowledge, error) {
	enableKnowledge, err := k.knowledgeRepo.FilterEnableKnowledge(ctx, knowledgeIDs)
	if err != nil {
		logs.CtxErrorf(ctx, "filter enable knowledge failed: %v", err)
		return nil, nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if len(enableKnowledge) == 0 {
		return nil, nil, nil
	}
	var enableKnowledgeIDs []int64
	for _, kn := range enableKnowledge {
		enableKnowledgeIDs = append(enableKnowledgeIDs, kn.ID)
	}
	enableDocs, _, err := k.documentRepo.FindDocumentByCondition(ctx, &entity.WhereDocumentOpt{
		IDs:          documentIDs,
		KnowledgeIDs: enableKnowledgeIDs,
		StatusIn:     []int32{int32(entity.DocumentStatusEnable)},
		SelectAll:    true,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "find document by condition failed: %v", err)
		return nil, nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	return enableDocs, enableKnowledge, nil
}

func (k *knowledgeSVC) queryRewriteNode(ctx context.Context, req *RetrieveContext) (newRetrieveContext *RetrieveContext, err error) {
	if len(req.ChatHistory) == 0 {
		// No context, no rewriting.
		return req, nil
	}
	if !req.Strategy.EnableQueryRewrite || k.rewriter == nil {
		// Rewrite function is not enabled, no context rewrite is required
		return req, nil
	}
	var opts []messages2query.Option
	if req.ChatModel != nil {
		opts = append(opts, messages2query.WithChatModel(req.ChatModel))
	}
	rewrittenQuery, err := k.rewriter.MessagesToQuery(ctx, req.ChatHistory, opts...)
	if err != nil {
		logs.CtxErrorf(ctx, "rewrite query failed: %v", err)
		return req, nil
	}
	// Rewrite completed
	req.RewrittenQuery = &rewrittenQuery
	return req, nil
}

func (k *knowledgeSVC) vectorRetrieveNode(ctx context.Context, req *RetrieveContext) (retrieveResult []*schema.Document, err error) {
	if req.Strategy.SearchType == knowledgeModel.SearchTypeFullText {
		return nil, nil
	}
	var manager searchstore.Manager
	for i := range k.searchStoreManagers {
		m := k.searchStoreManagers[i]
		if m != nil && m.GetType() == searchstore.TypeVectorStore {
			manager = m
			break
		}
	}
	if manager == nil {
		logs.CtxErrorf(ctx, "err:%s", errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", "未实现vectorStore")).Error())
		return nil, nil
	}

	retrieveResult, err = k.retrieveChannels(ctx, req, manager)
	if err != nil {
		logs.CtxErrorf(ctx, "retrieveChannels err:%s", err.Error())
	}
	return retrieveResult, nil
}

func (k *knowledgeSVC) esRetrieveNode(ctx context.Context, req *RetrieveContext) (retrieveResult []*schema.Document, err error) {
	if req.Strategy.SearchType == knowledgeModel.SearchTypeSemantic {
		return nil, nil
	}
	var manager searchstore.Manager
	for i := range k.searchStoreManagers {
		m := k.searchStoreManagers[i]
		if m != nil && m.GetType() == searchstore.TypeTextStore {
			manager = m
			break
		}
	}
	if manager == nil {
		logs.CtxErrorf(ctx, "err:%s", errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", "未实现esStore")).Error())
		return nil, nil
	}

	retrieveResult, err = k.retrieveChannels(ctx, req, manager)
	if err != nil {
		logs.CtxErrorf(ctx, "retrieveChannels err:%s", err.Error())
	}
	return retrieveResult, nil
}

func (k *knowledgeSVC) retrieveChannels(ctx context.Context, req *RetrieveContext, manager searchstore.Manager) (result []*schema.Document, err error) {
	query := req.OriginQuery
	if req.Strategy.EnableQueryRewrite && req.RewrittenQuery != nil {
		query = *req.RewrittenQuery
	}
	mu := sync.Mutex{}
	eg, ctx := errgroup.WithContext(ctx)
	eg.SetLimit(2)
	for knowledgeID, knowledgeInfo := range req.KnowledgeInfoMap {
		kid := knowledgeID
		info := knowledgeInfo
		collectionName := getCollectionName(kid)

		dsl := &searchstore.DSL{
			Op:    searchstore.OpIn,
			Field: "document_id",
			Value: knowledgeInfo.DocumentIDs,
		}
		partitions := make([]string, 0, len(req.Documents))
		for _, doc := range req.Documents {
			if doc.KnowledgeID == kid {
				partitions = append(partitions, strconv.FormatInt(doc.ID, 10))
			}
		}
		if len(partitions) == 0 {
			continue
		}
		opts := []retriever.Option{
			searchstore.WithRetrieverPartitionKey(fieldNameDocumentID),
			searchstore.WithPartitions(partitions),
			retriever.WithDSLInfo(dsl.DSL()),
		}
		if info.DocumentType == knowledgeModel.DocumentTypeTable && !k.enableCompactTable {
			var matchCols []string
			for _, col := range info.TableColumns {
				if col.Indexing {
					matchCols = append(matchCols, getColName(col.ID))
				}
			}
			opts = append(opts, searchstore.WithMultiMatch(matchCols, query))
		}
		eg.Go(func() error {
			ss, err := manager.GetSearchStore(ctx, collectionName)
			if err != nil {
				return errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", err.Error()))
			}
			retrievedDocs, err := ss.Retrieve(ctx, query, opts...)
			if err != nil {
				return errorx.New(errno.ErrKnowledgeRetrieveExecFailCode, errorx.KV("msg", err.Error()))
			}
			mu.Lock()
			result = append(result, retrievedDocs...)
			mu.Unlock()
			return nil
		})
	}
	if err = eg.Wait(); err != nil {
		return nil, err
	}
	return
}

func (k *knowledgeSVC) nl2SqlRetrieveNode(ctx context.Context, req *RetrieveContext) (retrieveResult []*schema.Document, err error) {
	hasTable := false
	var tableDocs []*model.KnowledgeDocument
	for _, doc := range req.Documents {
		if doc.DocumentType == int32(knowledgeModel.DocumentTypeTable) {
			hasTable = true
			tableDocs = append(tableDocs, doc)
		}
	}
	var opts []nl2sql.Option
	if req.ChatModel != nil {
		opts = append(opts, nl2sql.WithChatModel(req.ChatModel))
	}
	if hasTable && req.Strategy.EnableNL2SQL {
		mu := sync.Mutex{}
		eg, ctx := errgroup.WithContext(ctx)
		eg.SetLimit(len(tableDocs))
		res := make([]*schema.Document, 0)
		for i := range tableDocs {
			t := i
			eg.Go(func() error {
				doc := tableDocs[t]
				docs, execErr := k.nl2SqlExec(ctx, doc, req, opts)
				if execErr != nil {
					logs.CtxErrorf(ctx, "nl2sql exec failed: %v", execErr)
					return errorx.New(errno.ErrKnowledgeNL2SqlExecFailCode, errorx.KV("msg", execErr.Error()))
				}
				mu.Lock()
				res = append(res, docs...)
				mu.Unlock()
				return nil
			})
		}
		err = eg.Wait()
		if err != nil {
			logs.CtxErrorf(ctx, "nl2sql exec failed: %v", err)
			return nil, nil
		}
		return res, nil
	} else {
		return nil, nil
	}
}

func (k *knowledgeSVC) nl2SqlExec(ctx context.Context, doc *model.KnowledgeDocument, retrieveCtx *RetrieveContext, opts []nl2sql.Option) (
	retrieveResult []*schema.Document, err error) {
	sql, err := k.nl2Sql.NL2SQL(ctx, retrieveCtx.ChatHistory, []*document.TableSchema{packNL2SqlRequest(doc)}, opts...)
	if err != nil {
		logs.CtxErrorf(ctx, "nl2sql failed: %v", err)
		return nil, err
	}
	sql = addSliceIdColumn(sql)
	// Execute sql
	replaceMap := map[string]sqlparsercontract.TableColumn{}
	replaceMap[doc.Name] = sqlparsercontract.TableColumn{
		NewTableName: ptr.Of(doc.TableInfo.PhysicalTableName),
		ColumnMap: map[string]string{
			pkID: consts.RDBFieldID,
		},
	}
	for i := range doc.TableInfo.Columns {
		if doc.TableInfo.Columns[i] == nil {
			continue
		}
		if doc.TableInfo.Columns[i].Name == consts.RDBFieldID {
			continue
		}
		replaceMap[doc.Name].ColumnMap[doc.TableInfo.Columns[i].Name] = convert.ColumnIDToRDBField(doc.TableInfo.Columns[i].ID)
	}
	parsedSQL, err := sqlparser.NewSQLParser().ParseAndModifySQL(sql, replaceMap)
	if err != nil {
		logs.CtxErrorf(ctx, "parse sql failed: %v", err)
		return nil, err
	}
	// Execute sql
	resp, err := k.rdb.ExecuteSQL(ctx, &rdb.ExecuteSQLRequest{
		SQL: parsedSQL,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "execute sql failed: %v", err)
		return nil, err
	}
	for i := range resp.ResultSet.Rows {
		id, ok := resp.ResultSet.Rows[i][consts.RDBFieldID].(int64)
		if !ok {
			logs.CtxWarnf(ctx, "convert id failed, row: %v", resp.ResultSet.Rows[i])
			return nil, errors.New("convert id failed")
		}
		d := &schema.Document{
			ID:       strconv.FormatInt(id, 10),
			Content:  "",
			MetaData: map[string]any{},
		}
		d.WithScore(1)
		retrieveResult = append(retrieveResult, d)
	}
	return retrieveResult, nil
}

const pkID = "_knowledge_slice_id"

func addSliceIdColumn(originalSql string) string {
	lowerSql := strings.ToLower(originalSql)
	selectIndex := strings.Index(lowerSql, "select ")
	if selectIndex == -1 {
		return originalSql
	}
	result := originalSql[:selectIndex+len("select ")] // Keep selected part
	remainder := originalSql[selectIndex+len("select "):]

	lowerRemainder := strings.ToLower(remainder)
	fromIndex := strings.Index(lowerRemainder, " from")
	if fromIndex == -1 {
		return originalSql
	}

	columns := strings.TrimSpace(remainder[:fromIndex])
	if columns != "*" {
		columns += ", " + pkID
	}

	result += columns + remainder[fromIndex:]
	return result
}

func packNL2SqlRequest(doc *model.KnowledgeDocument) *document.TableSchema {
	res := &document.TableSchema{}
	if doc.TableInfo == nil {
		return res
	}
	res.Name = doc.TableInfo.VirtualTableName
	res.Comment = doc.TableInfo.TableDesc
	res.Columns = []*document.Column{}
	for _, column := range doc.TableInfo.Columns {
		if column.Name == consts.RDBFieldID {
			continue
		}
		res.Columns = append(res.Columns, &document.Column{
			Name:        column.Name,
			Type:        column.Type,
			Description: column.Description,
			Nullable:    !column.Indexing,
			IsPrimary:   false,
		})
	}
	return res
}

func (k *knowledgeSVC) passRequestContext(ctx context.Context, req *RetrieveContext) (context *RetrieveContext, err error) {
	return req, nil
}

func (k *knowledgeSVC) reRankNode(ctx context.Context, resultMap map[string]any) (retrieveResult []*schema.Document, err error) {
	// First retrieve the context
	retrieveCtx, ok := resultMap["passRequestContext"].(*RetrieveContext)
	if !ok {
		logs.CtxErrorf(ctx, "retrieve context is not found")
		return nil, errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", "retrieve context is not found"))
	}
	// Get the interface for the downvectorized recall
	vectorRetrieveResult, ok := resultMap["vectorRetrieveNode"].([]*schema.Document)
	if !ok {
		logs.CtxErrorf(ctx, "vector retrieve result is not found")
		vectorRetrieveResult = []*schema.Document{}
	}
	// Get the interface of the es recall.
	esRetrieveResult, ok := resultMap["esRetrieveNode"].([]*schema.Document)
	if !ok {
		logs.CtxErrorf(ctx, "es retrieve result is not found")
		esRetrieveResult = []*schema.Document{}
	}
	// Get the interface recalled under nl2sql
	nl2SqlRetrieveResult, ok := resultMap["nl2SqlRetrieveNode"].([]*schema.Document)
	if !ok {
		logs.CtxErrorf(ctx, "nl2sql retrieve result is not found")
		nl2SqlRetrieveResult = []*schema.Document{}
	}

	docs2RerankData := func(docs []*schema.Document) []*rerank.Data {
		data := make([]*rerank.Data, 0, len(docs))
		for i := range docs {
			doc := docs[i]
			data = append(data, &rerank.Data{Document: doc, Score: doc.Score()})
		}
		return data
	}

	// Obtain recall results from different channels according to the recall strategy
	var retrieveResultArr [][]*rerank.Data
	if retrieveCtx.Strategy.EnableNL2SQL {
		// Nl2sql results
		retrieveResultArr = append(retrieveResultArr, docs2RerankData(nl2SqlRetrieveResult))
	}
	switch retrieveCtx.Strategy.SearchType {
	case knowledgeModel.SearchTypeSemantic:
		retrieveResultArr = append(retrieveResultArr, docs2RerankData(vectorRetrieveResult))
	case knowledgeModel.SearchTypeFullText:
		retrieveResultArr = append(retrieveResultArr, docs2RerankData(esRetrieveResult))
	case knowledgeModel.SearchTypeHybrid:
		retrieveResultArr = append(retrieveResultArr, docs2RerankData(vectorRetrieveResult))
		retrieveResultArr = append(retrieveResultArr, docs2RerankData(esRetrieveResult))
	default:
		retrieveResultArr = append(retrieveResultArr, docs2RerankData(vectorRetrieveResult))
	}

	query := retrieveCtx.OriginQuery
	if retrieveCtx.Strategy.EnableQueryRewrite && retrieveCtx.RewrittenQuery != nil {
		query = ptr.From(retrieveCtx.RewrittenQuery)
	}

	resp, err := k.reranker.Rerank(ctx, &rerank.Request{
		Query: query,
		Data:  retrieveResultArr,
		TopN:  retrieveCtx.Strategy.TopK,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "rerank failed: %v", err)
		return nil, err
	}

	retrieveResult = make([]*schema.Document, 0, len(resp.SortedData))
	for _, item := range resp.SortedData {
		if item.Score < ptr.From(retrieveCtx.Strategy.MinScore) {
			continue
		}
		doc := item.Document
		doc.WithScore(item.Score)
		retrieveResult = append(retrieveResult, doc)
	}

	return retrieveResult, nil
}

func (k *knowledgeSVC) packResults(ctx context.Context, retrieveResult []*schema.Document) (results []*knowledgeModel.RetrieveSlice, err error) {
	if len(retrieveResult) == 0 {
		return nil, nil
	}
	sliceIDs := make(sets.Set[int64])
	docIDs := make(sets.Set[int64])
	knowledgeIDs := make(sets.Set[int64])

	documentMap := map[int64]*model.KnowledgeDocument{}
	knowledgeMap := map[int64]*model.Knowledge{}
	sliceScoreMap := map[int64]float64{}
	for _, doc := range retrieveResult {
		id, err := strconv.ParseInt(doc.ID, 10, 64)
		if err != nil {
			logs.CtxErrorf(ctx, "convert id failed: %v", err)
			return nil, errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", "convert id failed"))
		}
		sliceIDs[id] = struct{}{}
		sliceScoreMap[id] = doc.Score()
	}
	slices, err := k.sliceRepo.MGetSlices(ctx, sliceIDs.ToSlice())
	if err != nil {
		logs.CtxErrorf(ctx, "mget slices failed: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	for _, slice := range slices {
		docIDs[slice.DocumentID] = struct{}{}
		knowledgeIDs[slice.KnowledgeID] = struct{}{}
	}
	knowledgeModels, err := k.knowledgeRepo.FilterEnableKnowledge(ctx, knowledgeIDs.ToSlice())
	if err != nil {
		logs.CtxErrorf(ctx, "filter enable knowledge failed: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	for _, kn := range knowledgeModels {
		knowledgeMap[kn.ID] = kn
	}
	documents, err := k.documentRepo.MGetByID(ctx, docIDs.ToSlice())
	if err != nil {
		logs.CtxErrorf(ctx, "mget documents failed: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	for _, doc := range documents {
		documentMap[doc.ID] = doc
	}
	slicesInTable := map[int64][]*model.KnowledgeDocumentSlice{}
	for _, slice := range slices {
		if slice == nil {
			continue
		}
		if knowledgeMap[slice.KnowledgeID] == nil {
			continue
		}
		if knowledgeMap[slice.KnowledgeID].FormatType == int32(knowledgeModel.DocumentTypeTable) {
			if slicesInTable[slice.DocumentID] == nil {
				slicesInTable[slice.DocumentID] = []*model.KnowledgeDocumentSlice{}
			}
			slicesInTable[slice.DocumentID] = append(slicesInTable[slice.DocumentID], slice)
		}
	}
	var sliceMap map[int64]*entity.Slice
	for docID, slices := range slicesInTable {
		if documentMap[docID] == nil {
			continue
		}
		sliceMap, err = k.selectTableData(ctx, documentMap[docID].TableInfo, slices)
		if err != nil {
			logs.CtxErrorf(ctx, "select table data failed: %v", err)
			return nil, err
		}
	}
	results = []*knowledgeModel.RetrieveSlice{}
	for i := range slices {
		doc := documentMap[slices[i].DocumentID]
		kn := knowledgeMap[slices[i].KnowledgeID]
		sliceEntity := entity.Slice{
			Info: knowledgeModel.Info{
				ID:          slices[i].ID,
				CreatorID:   slices[i].CreatorID,
				SpaceID:     doc.SpaceID,
				AppID:       kn.AppID,
				CreatedAtMs: slices[i].CreatedAt,
				UpdatedAtMs: slices[i].UpdatedAt,
			},
			KnowledgeID:  slices[i].KnowledgeID,
			DocumentID:   slices[i].DocumentID,
			DocumentName: doc.Name,
			Sequence:     int64(slices[i].Sequence),
			ByteCount:    int64(len(slices[i].Content)),
			SliceStatus:  knowledgeModel.SliceStatus(slices[i].Status),
			CharCount:    int64(utf8.RuneCountInString(slices[i].Content)),
		}
		docUri := documentMap[slices[i].DocumentID].URI
		var docURL string
		if len(docUri) != 0 {
			docURL, err = k.storage.GetObjectUrl(ctx, docUri)
			if err != nil {
				logs.CtxErrorf(ctx, "get object url failed: %v", err)
				return nil, errorx.New(errno.ErrKnowledgeGetObjectURLFailCode, errorx.KV("msg", err.Error()))
			}
		}
		sliceEntity.Extra = map[string]string{
			consts.KnowledgeName: kn.Name,
			consts.DocumentURL:   docURL,
		}
		switch knowledgeModel.DocumentType(doc.DocumentType) {
		case knowledgeModel.DocumentTypeText:
			sliceEntity.RawContent = []*knowledgeModel.SliceContent{
				{Type: knowledgeModel.SliceContentTypeText, Text: ptr.Of(k.formatSliceContent(ctx, slices[i].Content))},
			}
		case knowledgeModel.DocumentTypeTable:
			if v, ok := sliceMap[slices[i].ID]; ok {
				sliceEntity.RawContent = v.RawContent
			}
		case knowledgeModel.DocumentTypeImage:
			img := fmt.Sprintf(`<img src="" data-tos-key="%s">`, documentMap[slices[i].DocumentID].URI)
			sliceEntity.RawContent = []*knowledgeModel.SliceContent{
				{Type: knowledgeModel.SliceContentTypeText, Text: ptr.Of(k.formatSliceContent(ctx, img+slices[i].Content))},
			}
		default:
		}

		results = append(results, &knowledgeModel.RetrieveSlice{
			Slice: &sliceEntity,
			Score: sliceScoreMap[slices[i].ID],
		})
	}
	err = k.sliceRepo.IncrementHitCount(ctx, sliceIDs.ToSlice())
	if err != nil {
		logs.CtxWarnf(ctx, "increment hit count failed: %v", err)
	}
	return results, nil
}

func (k *knowledgeSVC) formatSliceContent(ctx context.Context, sliceContent string) string {
	res := sliceContent
	imageData := k.ParseFrontEndImageContent(ctx, sliceContent)
	for _, v := range imageData {
		if v.TagsKV[DATATOSKEY] != "" {
			tosURL, err := k.storage.GetObjectUrl(ctx, v.TagsKV[DATATOSKEY])
			if err != nil {
				logs.CtxErrorf(ctx, "get object url failed: %v", err)
			} else {
				v.SetKV(SRC, tosURL)
			}
		}
		sliceContent = sliceContent[0:v.StartOffset] + v.Format() + sliceContent[v.EndOffset:]
		res = sliceContent
	}
	return res
}

type ImageContent struct {
	TagsKV      map[string]string
	TagsKList   []string
	StartOffset int64
	EndOffset   int64
}

const (
	SRC        = "src"
	DATATOSKEY = "data-tos-key"
)

func (i *ImageContent) Format() string {
	res := "<img "
	for _, v := range i.TagsKList {
		res = res + v + "=\"" + i.TagsKV[v] + "\" "
	}
	return res + ">"
}

func (i *ImageContent) SetKV(k string, v string) {
	if _, ok := i.TagsKV[k]; !ok {
		i.TagsKList = append(i.TagsKList, k)
	}
	if i.TagsKV == nil {
		i.TagsKV = make(map[string]string)
	}
	i.TagsKV[k] = v
}

func (k *knowledgeSVC) ParseFrontEndImageContent(ctx context.Context, s string) []*ImageContent {
	res := make([]*ImageContent, 0)
	imgRe := regexp.MustCompile(`<img\s+[^>]*>`)
	// Find all matches
	matches := imgRe.FindAllSubmatchIndex([]byte(s), -1)
	// Traverse matches and output the src and data-tos-key fields
	// Iterate the index of each match
	for _, match := range matches {
		// Outputs the beginning and end positions of the entire regular for each match in the text
		matchStart := match[0]
		matchEnd := match[1]
		all := s[match[0]:match[1]]

		re := regexp.MustCompile(`<img\s+([^>]+)>`)
		// Initialize map to store kv information and remove redundant information
		m := make(map[string]string)
		l := make([]string, 0)
		match := re.FindStringSubmatch(all)
		if len(match) < 2 {
			continue
		}
		attributes := match[1]
		// Defines a regular expression pattern for extracting attribute key-value pairs
		attrRe := regexp.MustCompile(`(\S+)=(?:"([^"]*)"|'([^']*)')`)

		// Find all attribute key-value pairs
		attrMatches := attrRe.FindAllStringSubmatch(attributes, -1)

		// Extract and store kv information
		for _, attrMatch := range attrMatches {
			key := attrMatch[1]
			value := attrMatch[2]
			if value == "" {
				value = attrMatch[3]
			}
			m[key] = value
			l = append(l, key)
		}
		res = append(res, &ImageContent{
			TagsKV:      m,
			TagsKList:   l,
			StartOffset: int64(matchStart),
			EndOffset:   int64(matchEnd),
		})
	}
	slices.Reverse(res)
	return res
}
