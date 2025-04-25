package service

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"unicode/utf8"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rerank"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	"code.byted.org/flow/opencoze/backend/pkg/lang/sets"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func (k *knowledgeSVC) newRetrieveContext(ctx context.Context, req *knowledge.RetrieveRequest) (*knowledge.RetrieveContext, error) {
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
	knowledgeInfoMap := make(map[int64]*knowledge.KnowledgeInfo)
	for _, kn := range enableKnowledge {
		if knowledgeInfoMap[kn.ID] == nil {
			knowledgeInfoMap[kn.ID] = &knowledge.KnowledgeInfo{}
			knowledgeInfoMap[kn.ID].DocumentType = entity.DocumentType(kn.FormatType)
			knowledgeInfoMap[kn.ID].DocumentIDs = []int64{}
		}
	}
	for _, doc := range enableDocs {
		info, found := knowledgeInfoMap[doc.KnowledgeID]
		if !found {
			continue
		}
		info.DocumentIDs = append(info.DocumentIDs, doc.ID)
		if info.DocumentType == entity.DocumentTypeTable && info.TableColumns == nil && doc.TableInfo != nil {
			info.TableColumns = doc.TableInfo.Columns
		}
	}
	resp := knowledge.RetrieveContext{
		Ctx:              ctx,
		OriginQuery:      req.Query,
		ChatHistory:      req.ChatHistory,
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
	enableKnowledgeIDs := []int64{}
	for _, knowledge := range enableKnowledge {
		enableKnowledgeIDs = append(enableKnowledgeIDs, knowledge.ID)
	}
	enableDocs, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
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

func (k *knowledgeSVC) queryRewriteNode(ctx context.Context, req *knowledge.RetrieveContext) (newRetrieveContext *knowledge.RetrieveContext, err error) {
	if len(req.ChatHistory) == 0 {
		// 没有上下文不需要改写
		return req, nil
	}
	if !req.Strategy.EnableQueryRewrite {
		// 未开启rewrite功能，不需要上下文改写
		return req, nil
	}
	rewrittenQuery, err := k.rewriter.Rewrite(ctx, req.OriginQuery, req.ChatHistory)
	if err != nil {
		logs.CtxErrorf(ctx, "rewrite query failed: %v", err)
		return req, nil
	}
	// 改写完成
	req.RewrittenQuery = &rewrittenQuery
	return req, nil
}

func (k *knowledgeSVC) vectorRetrieveNode(ctx context.Context, req *knowledge.RetrieveContext) (retrieveResult []*knowledge.RetrieveSlice, err error) {
	if req.Strategy.SearchType == entity.SearchTypeFullText {
		return []*knowledge.RetrieveSlice{}, nil
	}
	var vectorStore searchstore.SearchStore
	for i := range k.searchStores {
		store := k.searchStores[i]
		if store == nil {
			continue
		}
		if store.GetType() == searchstore.TypeVectorStore {
			vectorStore = store
			break
		}
	}
	if vectorStore == nil {
		logs.CtxErrorf(ctx, "vector store is not found")
		return nil, errors.New("vector store is not found")
	}
	query := req.OriginQuery
	if req.Strategy.EnableQueryRewrite && req.RewrittenQuery != nil {
		query = *req.RewrittenQuery
	}
	slices, err := vectorStore.Retrieve(ctx, &searchstore.RetrieveRequest{
		KnowledgeInfoMap: req.KnowledgeInfoMap,
		Query:            query,
		TopK:             req.Strategy.TopK,
		MinScore:         req.Strategy.MinScore,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "vector retrieve failed: %v", err)
		return nil, err
	}
	return slices, nil
}

func (k *knowledgeSVC) esRetrieveNode(ctx context.Context, req *knowledge.RetrieveContext) (retrieveResult []*knowledge.RetrieveSlice, err error) {
	if req.Strategy.SearchType == entity.SearchTypeSemantic {
		return []*knowledge.RetrieveSlice{}, nil
	}
	var vectorStore searchstore.SearchStore
	for i := range k.searchStores {
		store := k.searchStores[i]
		if store == nil {
			continue
		}
		if store.GetType() == searchstore.TypeTextStore {
			vectorStore = store
			break
		}
	}
	if vectorStore == nil {
		logs.CtxErrorf(ctx, "vector store is not found")
		return nil, errors.New("vector store is not found")
	}
	query := req.OriginQuery
	if req.Strategy.EnableQueryRewrite && req.RewrittenQuery != nil {
		query = *req.RewrittenQuery
	}
	slices, err := vectorStore.Retrieve(ctx, &searchstore.RetrieveRequest{
		KnowledgeInfoMap: req.KnowledgeInfoMap,
		Query:            query,
		TopK:             req.Strategy.TopK,
		MinScore:         req.Strategy.MinScore,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "vector retrieve failed: %v", err)
		return nil, err
	}
	return slices, nil
}

func (k *knowledgeSVC) nl2SqlRetrieveNode(ctx context.Context, req *knowledge.RetrieveContext) (retrieveResult []*knowledge.RetrieveSlice, err error) {
	return []*knowledge.RetrieveSlice{
		{Score: 3},
	}, nil
}

func (k *knowledgeSVC) passRequestContext(ctx context.Context, req *knowledge.RetrieveContext) (context *knowledge.RetrieveContext, err error) {
	return req, nil
}

func (k *knowledgeSVC) reRankNode(ctx context.Context, resultMap map[string]any) (retrieveResult []*knowledge.RetrieveSlice, err error) {
	// 首先获取下retrieve上下文
	retrieveCtx, ok := resultMap["passRequestContext"].(*knowledge.RetrieveContext)
	if !ok {
		return nil, errors.New("retrieve context is not found")
	}
	// 获取下向量化召回的接口
	vectorRetrieveResult, ok := resultMap["vectorRetrieveNode"].([]*knowledge.RetrieveSlice)
	if !ok {
		return nil, errors.New("vector retrieve result is not found")
	}
	// 获取下es召回的接口
	esRetrieveResult, ok := resultMap["esRetrieveNode"].([]*knowledge.RetrieveSlice)
	if !ok {
		return nil, errors.New("es retrieve result is not found")
	}
	// 获取下nl2sql召回的接口
	nl2SqlRetrieveResult, ok := resultMap["nl2SqlRetrieveNode"].([]*knowledge.RetrieveSlice)
	if !ok {
		return nil, errors.New("nl2sql retrieve result is not found")
	}
	// 根据召回策略从不同渠道获取召回结果
	retrieveResultArr := [][]*knowledge.RetrieveSlice{}
	switch retrieveCtx.Strategy.SearchType {
	case entity.SearchTypeSemantic:
		retrieveResultArr = append(retrieveResultArr, vectorRetrieveResult)
	case entity.SearchTypeFullText:
		retrieveResultArr = append(retrieveResultArr, esRetrieveResult)
	case entity.SearchTypeHybrid:
		retrieveResultArr = append(retrieveResultArr, vectorRetrieveResult)
		retrieveResultArr = append(retrieveResultArr, esRetrieveResult)
	default:
		retrieveResultArr = append(retrieveResultArr, vectorRetrieveResult)
	}
	if retrieveCtx.Strategy.EnableNL2SQL {
		// nl2sql结果
		retrieveResultArr = append(retrieveResultArr, nl2SqlRetrieveResult)
	}
	// 进行rrf
	query := retrieveCtx.OriginQuery
	if retrieveCtx.Strategy.EnableQueryRewrite && retrieveCtx.RewrittenQuery != nil {
		query = *retrieveCtx.RewrittenQuery
	}
	rrfResult, err := k.reranker.Rerank(ctx, &rerank.Request{
		Data:  retrieveResultArr,
		Query: query,
		TopN:  retrieveCtx.Strategy.TopK,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "rerank failed: %v", err)
		return nil, err
	}
	return rrfResult.Sorted, nil
}

func (k *knowledgeSVC) packResults(ctx context.Context, retrieveResult []*knowledge.RetrieveSlice) (results []*knowledge.RetrieveSlice, err error) {
	if len(retrieveResult) == 0 {
		return nil, nil
	}
	// todo ，把slice表的hit字段更新一下
	sliceIDs := []int64{}
	docIDs := []int64{}
	knowledgeIDs := []int64{}
	documentMap := map[int64]*model.KnowledgeDocument{}
	knowledgeMap := map[int64]*model.Knowledge{}
	sliceScoreMap := map[int64]float64{}
	for _, slice := range retrieveResult {
		sliceIDs = append(sliceIDs, slice.Slice.ID)
		sliceScoreMap[slice.Slice.ID] = slice.Score
	}
	slices, err := k.sliceRepo.MGetSlices(ctx, sliceIDs)
	if err != nil {
		logs.CtxErrorf(ctx, "mget slices failed: %v", err)
		return nil, err
	}
	for _, slice := range slices {
		docIDs = append(docIDs, slice.DocumentID)
		knowledgeIDs = append(knowledgeIDs, slice.KnowledgeID)
	}
	knowledgeModels, err := k.knowledgeRepo.FilterEnableKnowledge(ctx, knowledgeIDs)
	if err != nil {
		logs.CtxErrorf(ctx, "filter enable knowledge failed: %v", err)
		return nil, err
	}
	for _, kn := range knowledgeModels {
		knowledgeMap[kn.ID] = kn
	}
	documents, err := k.documentRepo.MGetByID(ctx, docIDs)
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
		if knowledgeMap[slice.KnowledgeID].FormatType == int32(entity.DocumentTypeTable) {
			if slicesInTable[slice.DocumentID] == nil {
				slicesInTable[slice.DocumentID] = []*model.KnowledgeDocumentSlice{}
			}
			slicesInTable[slice.DocumentID] = append(slicesInTable[slice.DocumentID], slice)
		}
	}
	for docID, slices := range slicesInTable {
		if documentMap[docID] == nil {
			continue
		}
		err = k.selectTableData(ctx, documentMap[docID].TableInfo, slices)
		if err != nil {
			logs.CtxErrorf(ctx, "select table data failed: %v", err)
			return nil, err
		}
	}
	results = []*knowledge.RetrieveSlice{}
	for i := range slices {
		doc := documentMap[slices[i].DocumentID]
		kn := knowledgeMap[slices[i].KnowledgeID]
		var projectID int64
		if kn.ProjectID != "" {
			projectID, err = strconv.ParseInt(kn.ProjectID, 10, 64)
			if err != nil {
				return nil, err
			}
		}
		sliceEntity := entity.Slice{
			Info: common.Info{
				ID:          slices[i].ID,
				CreatorID:   slices[i].CreatorID,
				SpaceID:     doc.SpaceID,
				ProjectID:   projectID,
				CreatedAtMs: slices[i].CreatedAt,
				UpdatedAtMs: slices[i].UpdatedAt,
			},
			DocumentID:   slices[i].DocumentID,
			DocumentName: doc.Name,
			PlainText:    k.formatSliceContent(slices[i].Content),
			Sequence:     int64(slices[i].Sequence),
			ByteCount:    int64(len(slices[i].Content)),
			CharCount:    int64(utf8.RuneCountInString(slices[i].Content)),
		}
		results = append(results, &knowledge.RetrieveSlice{
			Slice: &sliceEntity,
			Score: sliceScoreMap[slices[i].ID],
		})
	}
	return results, nil
}

// todo，这个函数要精简一下
func (k *knowledgeSVC) formatSliceContent(sliceContent string) string {
	patterns := []string{".*http://www.w3.org/2000/svg.*", "^https://.*https://.*"}
	sliceContent = ReplaceInvalidImg(sliceContent, patterns)
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
		srcReplacement := ""
		// 返回替换后的字符串
		return fmt.Sprintf(`<img src="%s">`, srcReplacement)
	})
	return replacedContent
}

func ReplaceInvalidImg(sliceContent string, invalidUrlPatterns []string) string {
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
		if IsInvalid(url, invalidUrlPatterns) {
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
		if IsInvalid(string(urlByte), invalidUrlPatterns) {
			return ""
		}
		return m
	})
	return replacedContent
}
func IsInvalid(url string, invalidUrlPatterns []string) bool {
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
