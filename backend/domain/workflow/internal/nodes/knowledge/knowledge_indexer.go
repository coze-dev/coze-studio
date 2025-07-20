/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package knowledge

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"path/filepath"
	"strings"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
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
