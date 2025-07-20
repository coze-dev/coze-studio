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
)

type DeleterConfig struct {
	KnowledgeID      int64
	KnowledgeDeleter knowledge.KnowledgeOperator
}

type KnowledgeDeleter struct {
	config *DeleterConfig
}

func NewKnowledgeDeleter(_ context.Context, cfg *DeleterConfig) (*KnowledgeDeleter, error) {
	if cfg.KnowledgeDeleter == nil {
		return nil, errors.New("knowledge deleter is required")
	}
	return &KnowledgeDeleter{
		config: cfg,
	}, nil
}

func (k *KnowledgeDeleter) Delete(ctx context.Context, input map[string]any) (map[string]any, error) {
	documentID, ok := input["documentID"].(string)
	if !ok {
		return nil, errors.New("documentID is required and must be a string")
	}

	req := &knowledge.DeleteDocumentRequest{
		DocumentID: documentID,
	}

	response, err := k.config.KnowledgeDeleter.Delete(ctx, req)
	if err != nil {
		return nil, err
	}

	result := make(map[string]any)
	result["isSuccess"] = response.IsSuccess

	return result, nil
}
