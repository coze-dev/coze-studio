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

package cardselector

import (
	"context"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

// Config is the Config type for NodeTypeCardSelector.
// Each Node Type should have its own designated Config type,
// which should implement NodeAdaptor and NodeBuilder.
type Config struct {
	FilterType string `json:"filter_type"` // 筛选类型：all, text, image, video, link
	Content    string `json:"content"`     // 输出内容模板
}

// NewConfig creates a new CardSelector config
func NewConfig() *Config {
	return &Config{}
}

// Adapt 实现NodeAdaptor接口，将前端节点配置转换为后端schema
func (c *Config) Adapt(ctx context.Context, n *vo.Node, opts ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	// 验证节点类型
	if entity.IDStrToNodeType(n.Type) != entity.NodeTypeCardSelector {
		return nil, fmt.Errorf("invalid node type: %s", n.Type)
	}

	// 创建NodeSchema基础结构
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeCardSelector,
		Name:    "",
		Configs: c, // 设置为Config实例，它实现了NodeBuilder接口
	}

	// 设置节点名称
	if n.Data != nil && n.Data.Meta != nil {
		ns.Name = n.Data.Meta.Title
	}

	// 提取筛选配置 - 从标准的CardSelector字段读取
	if n.Data != nil && n.Data.Inputs != nil && n.Data.Inputs.CardSelector != nil {
		c.FilterType = n.Data.Inputs.CardSelector.FilterType
		if c.FilterType == "" {
			c.FilterType = "all" // 默认值
		}
	} else {
		c.FilterType = "all" // 默认值
	}

	// 从Content字段读取内容模板
	if n.Data != nil && n.Data.Inputs != nil && n.Data.Inputs.Content != nil {
		if n.Data.Inputs.Content.Value != nil && n.Data.Inputs.Content.Value.Type == vo.BlockInputValueTypeLiteral {
			if content, ok := n.Data.Inputs.Content.Value.Content.(string); ok {
				c.Content = content
			}
		}
	}

	// 使用convert包设置输入输出映射（仅当Data不为nil时）
	if n.Data != nil {
		if err := convert.SetInputsForNodeSchema(n, ns); err != nil {
			return nil, err
		}

		if err := convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
			return nil, err
		}
	}

	return ns, nil
}

// Build 实现NodeBuilder接口
func (c *Config) Build(ctx context.Context, ns *schema.NodeSchema, opts ...schema.BuildOption) (any, error) {
	// 验证节点类型
	if ns.Type != entity.NodeTypeCardSelector {
		return nil, fmt.Errorf("invalid node type for CardSelector: %s", ns.Type)
	}

	// 创建CardSelector实例
	cardSelector := NewCardSelector(&CardSelectorConfig{
		FilterType: c.FilterType,
		Content:    c.Content,
	})

	return cardSelector, nil
}