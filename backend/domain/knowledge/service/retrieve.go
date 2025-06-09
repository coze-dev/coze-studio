package service

import (
	"context"
	"encoding/base64"
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

	knowledgeModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/consts"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/rerank"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/searchstore"
	"code.byted.org/flow/opencoze/backend/infra/contract/rdb"
	sqlparsercontract "code.byted.org/flow/opencoze/backend/infra/contract/sqlparser"
	"code.byted.org/flow/opencoze/backend/infra/impl/sqlparser"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/sets"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func (k *knowledgeSVC) Retrieve(ctx context.Context, request *RetrieveRequest) (response *RetrieveResponse, err error) {
	if request == nil {
		return nil, errors.New("request is null")
	}
	retrieveContext, err := k.newRetrieveContext(ctx, request)
	if err != nil {
		return nil, err
	}
	chain := compose.NewChain[*RetrieveContext, []*knowledgeModel.RetrieveSlice]()
	rewriteNode := compose.InvokableLambda(k.queryRewriteNode)
	// 向量化召回
	vectorRetrieveNode := compose.InvokableLambda(k.vectorRetrieveNode)
	// ES召回
	EsRetrieveNode := compose.InvokableLambda(k.esRetrieveNode)
	// Nl2Sql召回
	Nl2SqlRetrieveNode := compose.InvokableLambda(k.nl2SqlRetrieveNode)
	// pass user query Node
	passRequestContextNode := compose.InvokableLambda(k.passRequestContext)
	// reRank Node
	reRankNode := compose.InvokableLambda(k.reRankNode)
	// pack Result接口
	packResult := compose.InvokableLambda(k.packResults)
	parallelNode := compose.NewParallel().
		AddLambda("vectorRetrieveNode", vectorRetrieveNode).
		AddLambda("esRetrieveNode", EsRetrieveNode).
		AddLambda("nl2SqlRetrieveNode", Nl2SqlRetrieveNode).
		AddLambda("passRequestContext", passRequestContextNode)

	// TODO: 加一个对 table 类型数据回表读取操作

	r, err := chain.
		AppendLambda(rewriteNode).
		AppendParallel(parallelNode).
		AppendLambda(reRankNode).
		AppendLambda(packResult).
		Compile(ctx)
	if err != nil {
		logs.CtxErrorf(ctx, "compile chain failed: %v", err)
		return nil, err
	}
	output, err := r.Invoke(ctx, retrieveContext)
	if err != nil {
		logs.CtxErrorf(ctx, "invoke chain failed: %v", err)
		return nil, err
	}
	return &RetrieveResponse{
		RetrieveSlices: output,
	}, nil
}

func (k *knowledgeSVC) newRetrieveContext(ctx context.Context, req *RetrieveRequest) (*RetrieveContext, error) {
	if req.Strategy == nil {
		return nil, errors.New("strategy is required")
	}
	knowledgeIDSets := sets.FromSlice(req.KnowledgeIDs)
	docIDSets := sets.FromSlice(req.DocumentIDs)
	enableDocs, enableKnowledge, err := k.prepareRAGDocuments(ctx, docIDSets.ToSlice(), knowledgeIDSets.ToSlice())
	if err != nil {
		logs.CtxErrorf(ctx, "prepare rag documents failed: %v", err)
		return nil, err
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
	resp := RetrieveContext{
		Ctx:              ctx,
		OriginQuery:      req.Query,
		ChatHistory:      append(req.ChatHistory, schema.UserMessage(req.Query)),
		KnowledgeIDs:     knowledgeIDSets,
		KnowledgeInfoMap: knowledgeInfoMap,
		Strategy:         req.Strategy,
		Documents:        enableDocs,
	}
	return &resp, nil
}

func (k *knowledgeSVC) prepareRAGDocuments(ctx context.Context, documentIDs []int64, knowledgeIDs []int64) ([]*model.KnowledgeDocument, []*model.Knowledge, error) {
	enableKnowledge, err := k.knowledgeRepo.FilterEnableKnowledge(ctx, knowledgeIDs)
	if err != nil {
		logs.CtxErrorf(ctx, "filter enable knowledge failed: %v", err)
		return nil, nil, err
	}
	var enableKnowledgeIDs []int64
	for _, kn := range enableKnowledge {
		enableKnowledgeIDs = append(enableKnowledgeIDs, kn.ID)
	}
	enableDocs, _, err := k.documentRepo.FindDocumentByCondition(ctx, &entity.WhereDocumentOpt{
		IDs:          documentIDs,
		KnowledgeIDs: enableKnowledgeIDs,
		StatusIn:     []int32{int32(entity.DocumentStatusEnable)},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "find document by condition failed: %v", err)
		return nil, nil, err
	}
	return enableDocs, enableKnowledge, nil
}

func (k *knowledgeSVC) queryRewriteNode(ctx context.Context, req *RetrieveContext) (newRetrieveContext *RetrieveContext, err error) {
	if len(req.ChatHistory) == 0 {
		// 没有上下文不需要改写
		return req, nil
	}
	if !req.Strategy.EnableQueryRewrite || k.rewriter == nil {
		// 未开启rewrite功能，不需要上下文改写
		return req, nil
	}
	rewrittenQuery, err := k.rewriter.MessagesToQuery(ctx, req.ChatHistory)
	if err != nil {
		logs.CtxErrorf(ctx, "rewrite query failed: %v", err)
		return req, nil
	}
	// 改写完成
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
		logs.CtxErrorf(ctx, "vector store is not found")
		return nil, errors.New("vector store is not found")
	}

	return k.retrieveChannels(ctx, req, manager)
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
		logs.CtxErrorf(ctx, "vector store is not found")
		return nil, errors.New("vector store is not found")
	}

	return k.retrieveChannels(ctx, req, manager)
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

		// TODO: creator id 过滤
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
		opts := []retriever.Option{
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
				return err
			}
			retrievedDocs, err := ss.Retrieve(ctx, query, opts...)
			if err != nil {
				return err
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
	if hasTable && req.Strategy.EnableNL2SQL {
		wg := sync.WaitGroup{}
		mu := sync.Mutex{}
		res := make([]*schema.Document, 0)
		for i := range tableDocs {
			wg.Add(1)
			t := i
			go func() {
				doc := tableDocs[t]
				defer wg.Done()
				docs, execErr := k.nl2SqlExec(ctx, doc, req)
				if execErr != nil {
					logs.CtxErrorf(ctx, "nl2sql exec failed: %v", execErr)
					return
				}
				mu.Lock()
				res = append(res, docs...)
				mu.Unlock()
			}()
		}
		wg.Wait()
		return res, nil
	} else {
		return nil, nil
	}
}

func (k *knowledgeSVC) nl2SqlExec(ctx context.Context, doc *model.KnowledgeDocument, retrieveCtx *RetrieveContext) (retrieveResult []*schema.Document, err error) {
	sql, err := k.nl2Sql.NL2SQL(ctx, retrieveCtx.ChatHistory, []*document.TableSchema{packNL2SqlRequest(doc)})
	if err != nil {
		logs.CtxErrorf(ctx, "nl2sql failed: %v", err)
		return nil, err
	}
	sql = addSliceIdColumn(sql)
	// 执行sql
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
	// 执行sql
	resp, err := k.rdb.ExecuteSQL(ctx, &rdb.ExecuteSQLRequest{
		SQL: parsedSQL,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "execute sql failed: %v", err)
		return nil, err
	}
	for i := range resp.ResultSet.Rows {
		// TODO: 列转换
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

	result := originalSql[:selectIndex+6] // 保留 select 部分
	remainder := originalSql[selectIndex+6:]

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
	// 首先获取下retrieve上下文
	retrieveCtx, ok := resultMap["passRequestContext"].(*RetrieveContext)
	if !ok {
		return nil, errors.New("retrieve context is not found")
	}
	// 获取下向量化召回的接口
	vectorRetrieveResult, ok := resultMap["vectorRetrieveNode"].([]*schema.Document)
	if !ok {
		return nil, errors.New("vector retrieve result is not found")
	}
	// 获取下es召回的接口
	esRetrieveResult, ok := resultMap["esRetrieveNode"].([]*schema.Document)
	if !ok {
		return nil, errors.New("es retrieve result is not found")
	}
	// 获取下nl2sql召回的接口
	nl2SqlRetrieveResult, ok := resultMap["nl2SqlRetrieveNode"].([]*schema.Document)
	if !ok {
		return nil, errors.New("nl2sql retrieve result is not found")
	}

	docs2RerankData := func(docs []*schema.Document) []*rerank.Data {
		data := make([]*rerank.Data, 0, len(docs))
		for i := range docs {
			doc := docs[i]
			data = append(data, &rerank.Data{Document: doc, Score: doc.Score()})
		}
		return data
	}

	// 根据召回策略从不同渠道获取召回结果
	var retrieveResultArr [][]*rerank.Data
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
	if retrieveCtx.Strategy.EnableNL2SQL {
		// nl2sql结果
		retrieveResultArr = append(retrieveResultArr, docs2RerankData(nl2SqlRetrieveResult))
	}

	query := retrieveCtx.OriginQuery
	if retrieveCtx.Strategy.EnableQueryRewrite && retrieveCtx.RewrittenQuery != nil {
		query = *retrieveCtx.RewrittenQuery
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
			return nil, fmt.Errorf("[packResults] failed to parse document id: %v", err)
		}
		sliceIDs[id] = struct{}{}
		sliceScoreMap[id] = doc.Score()
	}
	slices, err := k.sliceRepo.MGetSlices(ctx, sliceIDs.ToSlice())
	if err != nil {
		logs.CtxErrorf(ctx, "mget slices failed: %v", err)
		return nil, err
	}
	for _, slice := range slices {
		docIDs[slice.DocumentID] = struct{}{}
		knowledgeIDs[slice.KnowledgeID] = struct{}{}
	}
	knowledgeModels, err := k.knowledgeRepo.FilterEnableKnowledge(ctx, knowledgeIDs.ToSlice())
	if err != nil {
		logs.CtxErrorf(ctx, "filter enable knowledge failed: %v", err)
		return nil, err
	}
	for _, kn := range knowledgeModels {
		knowledgeMap[kn.ID] = kn
	}
	documents, err := k.documentRepo.MGetByID(ctx, docIDs.ToSlice())
	if err != nil {
		logs.CtxErrorf(ctx, "mget documents failed: %v", err)
		return nil, err
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

		switch knowledgeModel.DocumentType(doc.DocumentType) {
		case knowledgeModel.DocumentTypeText:
			sliceEntity.RawContent = []*knowledgeModel.SliceContent{
				{Type: knowledgeModel.SliceContentTypeText, Text: ptr.Of(slices[i].Content)},
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

// todo，这个函数要精简一下
func (k *knowledgeSVC) formatSliceContent(ctx context.Context, sliceContent string) string {
	patterns := []string{".*http://www.w3.org/2000/svg.*", "^https://.*https://.*"}
	sliceContent = replaceInvalidImg(sliceContent, patterns)
	// 编译正则表达式，包含提取所需的字符串的捕获组
	re := regexp.MustCompile(`(?:<|\\u003c)img src=(\\)*['"]?(.*?)(\\)*['"]? data-tos-key=(\\)*['"]?(.*?)(\\)*['"]?\s*/?(?:>|\\u003e)`)
	replacedContent := re.ReplaceAllStringFunc(sliceContent, func(m string) string {
		matches := re.FindStringSubmatch(m)
		if len(matches) < 3 {
			return m // 如果没有足够的捕获组，返回原字符串
		}
		if len(matches) < 6 || len(matches[5]) == 0 {
			return fmt.Sprintf(`<img src="%s">`, matches[2])
		}
		// todo，获取图片或其他内容的链接
		srcReplacement, err := k.storage.GetObjectUrl(ctx, matches[5])
		if err != nil {
			logs.CtxErrorf(ctx, "get object url failed: %v", err)
			return m
		}

		// 返回替换后的字符串
		return fmt.Sprintf(`<img src="%s">`, srcReplacement)
	})
	return replacedContent
}

func replaceInvalidImg(sliceContent string, invalidUrlPatterns []string) string {
	if len(invalidUrlPatterns) == 0 {
		return sliceContent // 原样返回
	}
	rUrl := regexp.MustCompile(`(<img src="(http.*?)"\s*/?>)`)
	rBase64 := regexp.MustCompile(`(<img src="data:image/svg\+xml;base64,(.*?)"\s*/?>)`)
	replacedContent := rUrl.ReplaceAllStringFunc(sliceContent, func(m string) string {
		matches := rUrl.FindStringSubmatch(m)
		if len(matches) < 3 {
			return m
		}
		url := matches[2]
		if isInvalid(url, invalidUrlPatterns) {
			return ""
		}
		return m
	})

	replacedContent = rBase64.ReplaceAllStringFunc(replacedContent, func(m string) string {
		matches := rBase64.FindStringSubmatch(m)
		if len(matches) < 3 {
			return m
		}
		b64 := matches[2]
		urlByte, err := base64.StdEncoding.DecodeString(b64)
		if err != nil {
			return m
		}
		if isInvalid(string(urlByte), invalidUrlPatterns) {
			return ""
		}
		return m
	})
	return replacedContent
}

func isInvalid(url string, invalidUrlPatterns []string) bool {
	ret := false
	for _, pattern := range invalidUrlPatterns {
		r := regexp.MustCompile(pattern)
		if r.MatchString(url) {
			ret = true
			break
		}
	}

	return ret
}
