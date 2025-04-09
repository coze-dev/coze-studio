package rerank

import (
	"context"
)

type Reranker interface {
	Rerank(ctx context.Context, req *Request) (*Response, error)
}

type Request struct {
	Data []*Data
	TopN *int64
}

type Response struct {
	Sorted     []*ScoredData // 正排
	TokenUsage *int64
}

type ScoredData struct {
	Data  *Data
	Score float64
}

type Data struct {
	Query   string
	Content string
	Extra   map[string]string
}
