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

package _continue

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

type Continue struct{}

type Config struct{}

func (c *Config) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	return &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeContinue,
		Name:    n.Data.Meta.Title,
		Configs: c,
	}, nil
}

func (c *Config) Build(_ context.Context, _ *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	return &Continue{}, nil
}

func (co *Continue) Invoke(_ context.Context, in map[string]any) (map[string]any, error) {
	return in, nil
}
