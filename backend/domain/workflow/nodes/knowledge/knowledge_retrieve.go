package knowledge

import (
	"context"
	"errors"
)

type SearchType string

const outputList = "outputList"
const (
	SearchTypeSemantic SearchType = "semantic"  // 语义
	SearchTypeFullText SearchType = "full_text" // 全文
	SearchTypeHybrid   SearchType = "hybrid"    // 混合
)

type Retriever interface {
	Retrieve(context.Context, *RetrieveRequest) (*RetrieveResponse, error)
}

type RetrievalStrategy struct {
	TopK       *int64
	MinScore   *float64
	SearchType SearchType

	EnableNL2SQL       bool
	EnableQueryRewrite bool
	EnableRerank       bool
	IsPersonalOnly     bool
}

type RetrieveConfig struct {
	KnowledgeIDs      []int64
	RetrievalStrategy *RetrievalStrategy
	Retriever         Retriever
}

type KnowledgeRetrieve struct {
	config *RetrieveConfig
}
type RetrieveRequest struct {
	Query             string
	KnowledgeIDs      []int64
	RetrievalStrategy *RetrievalStrategy
}

type RetrieveResponse struct {
	RetrieveData []map[string]any
}

func NewKnowledgeRetrieve(_ context.Context, cfg *RetrieveConfig) (*KnowledgeRetrieve, error) {
	if cfg == nil {
		return nil, errors.New("cfg is required")
	}

	if cfg.Retriever == nil {
		return nil, errors.New("retriever is required")
	}

	if len(cfg.KnowledgeIDs) == 0 {
		return nil, errors.New("knowledgeIDs cannot empty")
	}

	if cfg.RetrievalStrategy == nil {
		return nil, errors.New("retrieval strategy is required")
	}

	return &KnowledgeRetrieve{
		config: cfg,
	}, nil
}

func (kr *KnowledgeRetrieve) Retrieve(ctx context.Context, input map[string]any) (map[string]any, error) {

	query, ok := input["query"].(string)
	if !ok {
		return nil, errors.New("query is required")
	}

	req := &RetrieveRequest{
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
