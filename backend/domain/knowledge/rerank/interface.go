package rerank

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
)

type Reranker interface {
	Rerank(ctx context.Context, req *Request) (*Response, error)
}

type Request struct {
	Data  [][]*knowledge.RetrieveSlice
	Query string
	TopN  *int64
}

type Response struct {
	Sorted     []*knowledge.RetrieveSlice // 正排
	TokenUsage *int64
}

// type ScoredData struct {
// 	Data  *Data
// 	Score float64
// }

// type Data struct {
// 	Query   string
// 	Content string
// 	Extra   map[string]string
// }
