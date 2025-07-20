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

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

const outputList = "outputList"

type RetrieveConfig struct {
	KnowledgeIDs      []int64
	RetrievalStrategy *knowledge.RetrievalStrategy
	Retriever         knowledge.KnowledgeOperator
}

type KnowledgeRetrieve struct {
	config *RetrieveConfig
}

func NewKnowledgeRetrieve(_ context.Context, cfg *RetrieveConfig) (*KnowledgeRetrieve, error) {
	if cfg == nil {
		return nil, errors.New("cfg is required")
	}

	if cfg.Retriever == nil {
		return nil, errors.New("retriever is required")
	}

	if len(cfg.KnowledgeIDs) == 0 {
		return nil, errors.New("knowledgeI ids is required")
	}

	if cfg.RetrievalStrategy == nil {
		return nil, errors.New("retrieval strategy is required")
	}

	return &KnowledgeRetrieve{
		config: cfg,
	}, nil
}

func (kr *KnowledgeRetrieve) Retrieve(ctx context.Context, input map[string]any) (map[string]any, error) {

	query, ok := input["Query"].(string)
	if !ok {
		return nil, errors.New("capital query key is required")
	}

	req := &knowledge.RetrieveRequest{
		Query:             query,
		KnowledgeIDs:      kr.config.KnowledgeIDs,
		RetrievalStrategy: kr.config.RetrievalStrategy,
	}

	response, err := kr.config.Retriever.Retrieve(ctx, req)
	if err != nil {
		return nil, err
	}
	result := make(map[string]any)
	result[outputList] = slices.Transform(response.Slices, func(m *knowledge.Slice) any {
		return map[string]any{
			"documentId": m.DocumentID,
			"output":     m.Output,
		}
	})

	return result, nil
}
