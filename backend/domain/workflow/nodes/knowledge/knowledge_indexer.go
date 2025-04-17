package knowledge

import (
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge"
)

type IndexerConfig struct {
	KnowledgeID      int64
	ParsingStrategy  *knowledge.ParsingStrategy
	ChunkingStrategy *knowledge.ChunkingStrategy
	KnowledgeIndexer knowledge.Indexer
}

type KnowledgeIndexer struct {
	config *IndexerConfig
}

func NewKnowledgeIndexer(_ context.Context, cfg *IndexerConfig) (*KnowledgeIndexer, error) {
	if cfg.ParsingStrategy == nil {
		return nil, errors.New("parsing strategy is required")
	}
	if cfg.ChunkingStrategy == nil {
		return nil, errors.New("chunking strategy is required")
	}
	if cfg.KnowledgeIndexer == nil {
		return nil, errors.New("knowledge indexer is required")
	}
	return &KnowledgeIndexer{
		config: cfg,
	}, nil
}

func (k *KnowledgeIndexer) Store(ctx context.Context, input map[string]any) (map[string]any, error) {

	fileURL, ok := input["FileURI"].(string)
	if !ok {
		return nil, errors.New("FileURI is required")
	}

	req := &knowledge.CreateDocumentRequest{
		KnowledgeID:      k.config.KnowledgeID,
		ParsingStrategy:  k.config.ParsingStrategy,
		ChunkingStrategy: k.config.ChunkingStrategy,
		FileURI:          fileURL,
	}

	response, err := k.config.KnowledgeIndexer.Store(ctx, req)
	if err != nil {
		return nil, err
	}

	result := make(map[string]any)
	result["documentId"] = response.DocumentID
	result["fileName"] = response.FileName
	result["fileUrl"] = response.FileURL

	return result, nil
}
