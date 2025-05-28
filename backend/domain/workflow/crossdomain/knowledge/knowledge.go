package knowledge

import (
	"context"

	"code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
)

type ParseMode string

const (
	FastParseMode     = "fast_mode"
	AccurateParseMode = "accurate_mode"
)

type ChunkType string

const (
	ChunkTypeDefault ChunkType = "default"
	ChunkTypeCustom  ChunkType = "custom"
	ChunkTypeLeveled ChunkType = "leveled"
)

type ParsingStrategy struct {
	ParseMode    ParseMode
	ExtractImage bool
	ExtractTable bool
	ImageOCR     bool
}
type ChunkingStrategy struct {
	ChunkType ChunkType
	ChunkSize int64
	Separator string
	Overlap   int64
}

type CreateDocumentRequest struct {
	KnowledgeID      int64
	ParsingStrategy  *ParsingStrategy
	ChunkingStrategy *ChunkingStrategy
	FileURL          string
	FileName         string
	FileExtension    parser.FileExtension
}
type CreateDocumentResponse struct {
	DocumentID int64
	FileName   string
	FileURL    string
}

type SearchType string

const (
	SearchTypeSemantic SearchType = "semantic"  // 语义
	SearchTypeFullText SearchType = "full_text" // 全文
	SearchTypeHybrid   SearchType = "hybrid"    // 混合
)

type RetrievalStrategy struct {
	TopK       *int64
	MinScore   *float64
	SearchType SearchType

	EnableNL2SQL       bool
	EnableQueryRewrite bool
	EnableRerank       bool
	IsPersonalOnly     bool
}

type RetrieveRequest struct {
	Query             string
	KnowledgeIDs      []int64
	RetrievalStrategy *RetrievalStrategy
}

type RetrieveResponse struct {
	RetrieveData []map[string]any
}

var (
	knowledgeOperatorImpl KnowledgeOperator
)

func GetKnowledgeOperator() KnowledgeOperator {
	return knowledgeOperatorImpl
}

func SetKnowledgeOperator(k KnowledgeOperator) {
	knowledgeOperatorImpl = k
}

//go:generate  mockgen -destination knowledgemock/knowledge_mock.go --package knowledgemock -source knowledge.go
type KnowledgeOperator interface {
	Store(ctx context.Context, document *CreateDocumentRequest) (*CreateDocumentResponse, error)
	Retrieve(context.Context, *RetrieveRequest) (*RetrieveResponse, error)
}
