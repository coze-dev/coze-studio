package knowledge

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"path/filepath"
	"strings"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
)

type IndexerConfig struct {
	KnowledgeID      int64
	ParsingStrategy  *knowledge.ParsingStrategy
	ChunkingStrategy *knowledge.ChunkingStrategy
	KnowledgeIndexer knowledge.KnowledgeOperator
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

	fileURL, ok := input["knowledge"].(string)
	if !ok {
		return nil, errors.New("knowledge is required")
	}

	fileName, ext, err := parseToFileNameAndFileExtension(fileURL)

	if err != nil {
		return nil, err
	}

	req := &knowledge.CreateDocumentRequest{
		KnowledgeID:      k.config.KnowledgeID,
		ParsingStrategy:  k.config.ParsingStrategy,
		ChunkingStrategy: k.config.ChunkingStrategy,
		FileURL:          fileURL,
		FileName:         fileName,
		FileExtension:    ext,
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

func parseToFileNameAndFileExtension(fileURL string) (string, parser.FileExtension, error) {

	u, err := url.Parse(fileURL)
	if err != nil {
		return "", "", err
	}

	fileName := u.Query().Get("x-wf-file_name")
	if len(fileName) == 0 {
		return "", "", errors.New("file name is required")
	}

	fileExt := strings.ToLower(strings.TrimPrefix(filepath.Ext(fileName), "."))

	ext, support := parser.ValidateFileExtension(fileExt)
	if !support {
		return "", "", fmt.Errorf("unsupported file type: %s", fileExt)
	}
	return fileName, ext, nil
}
