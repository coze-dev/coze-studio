package entity

import (
	"github.com/cloudwego/eino/schema"
)

type RetrieveStrategy struct {
	UseRerank  bool
	UseRewrite bool
}

type RetrieveFilter struct {
	KnowledgeIDs []int64
}

type RetrieveRequest struct {
	Input   *schema.Message
	History []*schema.Message

	TopK           int
	MinScore       float64
	MaxTokens      int
	SearchStrategy SearchStrategy

	Filter   RetrieveFilter
	Strategy RetrieveStrategy
}

type RetrieveResponse struct {
	Data []*schema.Document
}
