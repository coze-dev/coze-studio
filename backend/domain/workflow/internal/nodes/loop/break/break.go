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

package _break

import (
	"context"

	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/variable"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

type Break struct {
	parentIntermediateStore variable.Store
}

type Config struct{}

func (c *Config) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	return &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeBreak,
		Name:    n.Data.Meta.Title,
		Configs: c,
	}, nil
}

func (c *Config) Build(_ context.Context, _ *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	return &Break{
		parentIntermediateStore: &nodes.ParentIntermediateStore{},
	}, nil
}

const BreakKey = "$break"

func (b *Break) Invoke(ctx context.Context, _ map[string]any) (map[string]any, error) {
	err := b.parentIntermediateStore.Set(ctx, compose.FieldPath{BreakKey}, true)
	if err != nil {
		return nil, err
	}
	return map[string]any{}, nil
}
