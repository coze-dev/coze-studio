package service

import (
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
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
	knowledgeIDSets := sets.NewSetFromSlice(req.KnowledgeIDs)
	docIDSets := sets.NewSetFromSlice(req.DocumentIDs)
	enableDocs, enableKnowledges, err := k.prepareRAGDocuments(ctx, docIDSets.ToSlice(), knowledgeIDSets.ToSlice())
	if err != nil {
		logs.CtxErrorf(ctx, "prepare rag documents failed: %v", err)
		return nil, err
	}
	knowledgeID2DocumentIDs := make(map[int64]*knowledge.KnowledgeInfo)
	for _, kn := range enableKnowledges {
		if knowledgeID2DocumentIDs[kn.ID] == nil {
			knowledgeID2DocumentIDs[kn.ID] = &knowledge.KnowledgeInfo{}
			knowledgeID2DocumentIDs[kn.ID].DocumentType = entity.DocumentType(kn.FormatType)
			knowledgeID2DocumentIDs[kn.ID].DocumentIDs = []int64{}
		}
	}
	for _, doc := range enableDocs {
		knowledgeID2DocumentIDs[doc.KnowledgeID].DocumentIDs = append(knowledgeID2DocumentIDs[doc.KnowledgeID].DocumentIDs, doc.ID)
	}
	resp := knowledge.RetrieveContext{
		Ctx:          ctx,
		OriginQuery:  req.Query,
		ChatHistory:  req.ChatHistory,
		KnowledgeIDs: knowledgeIDSets,
		Strategy:     req.Strategy,
		Documents:    enableDocs,
	}
	return &resp, nil
}

func (k *knowledgeSVC) prepareRAGDocuments(ctx context.Context, documentIDs []int64, knowledgeIDs []int64) ([]*model.KnowledgeDocument, []*model.Knowledge, error) {
	enableKnowledges, err := k.knowledgeRepo.FilterEnableKnowledge(ctx, knowledgeIDs)
	if err != nil {
		logs.CtxErrorf(ctx, "filter enable knowledge failed: %v", err)
		return nil, nil, err
	}
	enableKnowledgeIDs := []int64{}
	for _, knowledge := range enableKnowledges {
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
	return enableDocs, enableKnowledges, nil
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
		// es检索，不走向量召回
		return []*knowledge.RetrieveSlice{}, nil
	}
	var vectorStore searchstore.SearchStore
	for i := range k.searchStores {
		store := k.searchStores[i]
		if store == nil {
			continue
		}
		if store.GetType() == searchstore.TypeVikingDB {
			vectorStore = store
			break
		}
	}
	if vectorStore == nil {
		logs.CtxErrorf(ctx, "vector store is not found")
		return nil, errors.New("vector store is not found")
	}
	docID := []int64{}
	for _, doc := range req.Documents {
		docID = append(docID, doc.ID)
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
	return []*knowledge.RetrieveSlice{
		{Score: 2},
	}, nil
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
	return rrfResult.Sorted, nil
}
