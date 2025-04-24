package knowledge

import (
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge"
)

const outputList = "outputList"

type RetrieveConfig struct {
	KnowledgeIDs      []int64
	RetrievalStrategy *knowledge.RetrievalStrategy
	Retriever         knowledge.KnowledgeOperator
}

type KnowledgeRetrieve struct {
	config *RetrieveConfig
}

func NewKnowledgeRetrieve(_ context.Context, cfg *RetrieveConfig) (*KnowledgeRetrieve, error) {
	if cfg == nil {
		return nil, errors.New("cfg is required")
	}

	if cfg.Retriever == nil {
		return nil, errors.New("retriever is required")
	}

	if len(cfg.KnowledgeIDs) == 0 {
		return nil, errors.New("knowledgeI ids is required")
	}

	if cfg.RetrievalStrategy == nil {
		return nil, errors.New("retrieval strategy is required")
	}

	return &KnowledgeRetrieve{
		config: cfg,
	}, nil
}

func (kr *KnowledgeRetrieve) Retrieve(ctx context.Context, input map[string]any) (map[string]any, error) {

	query, ok := input["Query"].(string)
	if !ok {
		return nil, errors.New("capital query key is required")
	}

	req := &knowledge.RetrieveRequest{
		Query:             query,
		KnowledgeIDs:      kr.config.KnowledgeIDs,
		RetrievalStrategy: kr.config.RetrievalStrategy,
	}

	response, err := kr.config.Retriever.Retrieve(ctx, req)
	if err != nil {
		return nil, err
	}
	result := make(map[string]any)
	result[outputList] = response

	return result, nil
}
