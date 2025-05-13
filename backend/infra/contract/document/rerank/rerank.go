package rerank

import (
	"context"

	"github.com/cloudwego/eino/schema"
)

type Reranker interface {
	Rerank(ctx context.Context, req *Request) (*Response, error)
}

type Request struct {
	Query string
	Data  [][]*Data
	TopN  *int64
}

type Response struct {
	SortedData []*Data // 高分在前
	TokenUsage *int64
}

type Data struct {
	Document *schema.Document
	Score    float64
}
