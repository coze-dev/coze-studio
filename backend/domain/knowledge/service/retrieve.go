package service

import (
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/pkg/lang/sets"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func (k *knowledgeSVC) newRetrieveContext(ctx context.Context, req *knowledge.RetrieveRequest) (*knowledge.RetrieveContext, error) {
	if req.Strategy == nil {
		return nil, errors.New("strategy is required")
	}
	knowledgeIDSets := sets.NewSetFromSlice(req.KnowledgeIDs)
	docIDSets := sets.NewSetFromSlice(req.DocumentIDs)
	enableDocs, err := k.prepareRAGDocuments(ctx, docIDSets.ToSlice(), knowledgeIDSets.ToSlice())
	if err != nil {
		logs.CtxErrorf(ctx, "prepare rag documents failed: %v", err)
		return nil, err
	}
	resp := knowledge.RetrieveContext{
		Ctx:         ctx,
		OriginQuery: req.Query,
		ChatHistory: req.ChatHistory,
		DatasetIDs:  knowledgeIDSets,
		Strategy:    req.Strategy,
		Documents:   enableDocs,
		Vs:          k.vs,
		Rewriter:    k.rewriter,
		Reranker:    k.reranker,
	}
	return &resp, nil
}

func (k *knowledgeSVC) prepareRAGDocuments(ctx context.Context, documentIDs []int64, knowledgeIDs []int64) ([]*model.KnowledgeDocument, error) {
	enableKnowledgeIDs, err := k.knowledgeRepo.FilterEnableDataset(ctx, knowledgeIDs)
	if err != nil {
		logs.CtxErrorf(ctx, "filter enable dataset failed: %v", err)
	}
	enableDocs, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
		IDs:          documentIDs,
		KnowledgeIDs: enableKnowledgeIDs,
		StatusIn:     []int32{int32(entity.DocumentStatusEnable)},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "find document by condition failed: %v", err)
		return nil, err
	}
	return enableDocs, nil
}

func queryRewriteNode(ctx context.Context, req *knowledge.RetrieveContext) (newRetrieveContext *knowledge.RetrieveContext, err error) {
	if len(req.ChatHistory) == 0 {
		// 没有上下文不需要改写
		return req, nil
	}
	if !req.Strategy.EnableQueryRewrite {
		return req, nil
	}

	return req, nil
}
func vectorRetrieveNode(ctx context.Context, req *knowledge.RetrieveContext) (retrieveResult []*knowledge.RetrieveSlice, err error) {
	return []*knowledge.RetrieveSlice{
		{Score: 1},
	}, nil
}
func esRetrieveNode(ctx context.Context, req *knowledge.RetrieveContext) (retrieveResult []*knowledge.RetrieveSlice, err error) {
	return []*knowledge.RetrieveSlice{
		{Score: 2},
	}, nil
}

func nl2SqlRetrieveNode(ctx context.Context, req *knowledge.RetrieveContext) (retrieveResult []*knowledge.RetrieveSlice, err error) {
	return []*knowledge.RetrieveSlice{
		{Score: 3},
	}, nil
}

func mergeNode(ctx context.Context, resultMap map[string]any) (retrieveResult []*knowledge.RetrieveSlice, err error) {
	return nil, nil
}

func packResultNode(ctx context.Context, resultMap []*knowledge.RetrieveSlice) (retrieveResult []*knowledge.RetrieveSlice, err error) {
	return nil, nil
}
