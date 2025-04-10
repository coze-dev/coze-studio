package knowledge

import (
	"context"
	"errors"
)

type ParseMode string

const (
	FastParseMode     = "fast_mode"
	AccurateParseMode = "accurate_mode"
)

type ParsingStrategy struct {
	ParseMode    ParseMode
	ExtractImage bool
	ExtractTable bool
	ImageOCR     bool
}

type ChunkType string

const (
	ChunkTypeDefault ChunkType = "default"
	ChunkTypeCustom  ChunkType = "custom"
	ChunkTypeLeveled ChunkType = "leveled"
)

type KnowledgeWriter interface {
	CreateDocument(ctx context.Context, document *CreateDocumentRequest) (*CreateDocumentResponse, error)
}

type ChunkingStrategy struct {
	ChunkType ChunkType
	ChunkSize int64
	Separator string
	Overlap   int64
}

type WriteConfig struct {
	KnowledgeID      int64
	ParsingStrategy  *ParsingStrategy
	ChunkingStrategy *ChunkingStrategy
	KnowledgeWriter  KnowledgeWriter
}

type KnowledgeWrite struct {
	config *WriteConfig
}

type CreateDocumentRequest struct {
	KnowledgeID      int64
	ParsingStrategy  *ParsingStrategy
	ChunkingStrategy *ChunkingStrategy
	FileURI          string
}

type CreateDocumentResponse struct {
	DocumentID int64
	FileName   string
	FileURL    string
}

func NewKnowledgeWrite(_ context.Context, cfg *WriteConfig) (*KnowledgeWrite, error) {
	if cfg.ParsingStrategy == nil {
		return nil, errors.New("parsing strategy is required")
	}
	if cfg.ChunkingStrategy == nil {
		return nil, errors.New("chunking strategy is required")
	}
	if cfg.KnowledgeWriter == nil {
		return nil, errors.New("knowledge writer is required")
	}
	return &KnowledgeWrite{
		config: cfg,
	}, nil
}

func (k *KnowledgeWrite) Write(ctx context.Context, input map[string]any) (map[string]any, error) {

	fileURL, ok := input["FileURI"].(string)
	if !ok {
		return nil, errors.New("FileURI is required")
	}

	req := &CreateDocumentRequest{
		KnowledgeID:      k.config.KnowledgeID,
		ParsingStrategy:  k.config.ParsingStrategy,
		ChunkingStrategy: k.config.ChunkingStrategy,
		FileURI:          fileURL,
	}

	response, err := k.config.KnowledgeWriter.CreateDocument(ctx, req)
	if err != nil {
		return nil, err
	}

	result := make(map[string]any)
	result["documentId"] = response.DocumentID
	result["fileName"] = response.FileName
	result["fileUrl"] = response.FileURL

	return result, nil
}
