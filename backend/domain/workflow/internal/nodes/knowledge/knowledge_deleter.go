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

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	crossknowledge "github.com/coze-dev/coze-studio/backend/crossdomain/contract/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

type DeleterConfig struct{}

func (d *DeleterConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeKnowledgeDeleter,
		Name:    n.Data.Meta.Title,
		Configs: d,
	}

	if err := convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err := convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (d *DeleterConfig) Build(_ context.Context, _ *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	return &Deleter{}, nil
}

type Deleter struct{}

func (k *Deleter) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	documentID, ok := input["documentID"].(string)
	if !ok {
		return nil, errors.New("documentID is required and must be a string")
	}

	req := &knowledge.DeleteDocumentRequest{
		DocumentID: documentID,
	}

	response, err := crossknowledge.DefaultSVC().Delete(ctx, req)
	if err != nil {
		return nil, err
	}

	result := make(map[string]any)
	result["isSuccess"] = response.IsSuccess

	return result, nil
}
