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
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

func TestConfig_Adapt(t *testing.T) {
	config := NewConfig()

	tests := []struct {
		name        string
		node        *vo.Node
		expectError bool
		expectType  string
	}{
		{
			name: "valid CardSelector node with all filter",
			node: &vo.Node{
				ID:   "test-card-selector",
				Type: entity.NodeTypeCardSelector.IDStr(),
				Data: &vo.Data{
					Meta: &vo.NodeMetaFE{
						Title: "Test CardSelector",
					},
					Inputs: &vo.Inputs{
						InputParameters: []*vo.Param{},
					},
				},
			},
			expectError: false,
			expectType:  "all",
		},
		{
			name: "valid CardSelector node with text filter",
			node: &vo.Node{
				ID:   "test-card-selector-text",
				Type: entity.NodeTypeCardSelector.IDStr(),
				Data: &vo.Data{
					Meta: &vo.NodeMetaFE{
						Title: "Test CardSelector Text",
					},
					Inputs: &vo.Inputs{
						InputParameters: []*vo.Param{},
					},
				},
			},
			expectError: false,
			expectType:  "all",
		},
		{
			name: "valid CardSelector node with image filter",
			node: &vo.Node{
				ID:   "test-card-selector-image",
				Type: entity.NodeTypeCardSelector.IDStr(),
				Data: &vo.Data{
					Meta: &vo.NodeMetaFE{
						Title: "Test CardSelector Image",
					},
					Inputs: &vo.Inputs{
						InputParameters: []*vo.Param{},
					},
				},
			},
			expectError: false,
			expectType:  "all",
		},
		{
			name: "CardSelector node with missing data (should default to 'all')",
			node: &vo.Node{
				ID:   "test-card-selector-default",
				Type: entity.NodeTypeCardSelector.IDStr(),
				Data: nil,
			},
			expectError: false,
			expectType:  "all",
		},
		{
			name: "invalid node type",
			node: &vo.Node{
				ID:   "test-invalid-node",
				Type: entity.NodeTypeLLM.IDStr(),
				Data: &vo.Data{
					Meta: &vo.NodeMetaFE{
						Title: "Test LLM",
					},
				},
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			nodeSchema, err := config.Adapt(context.Background(), tt.node)

			if tt.expectError {
				assert.Error(t, err)
				return
			}

			require.NoError(t, err)
			assert.NotNil(t, nodeSchema)
			assert.Equal(t, vo.NodeKey(tt.node.ID), nodeSchema.Key)
			assert.Equal(t, entity.NodeTypeCardSelector, nodeSchema.Type)

			// Verify that Configs is set correctly
			assert.NotNil(t, nodeSchema.Configs)
			cardSelectorConfig, ok := nodeSchema.Configs.(*Config)
			assert.True(t, ok)
			assert.Equal(t, tt.expectType, cardSelectorConfig.FilterType)
		})
	}
}

func TestConfig_Build(t *testing.T) {
	config := &Config{
		FilterType: "text",
		Content:    "Test content",
	}

	nodeSchema := &schema.NodeSchema{
		Type: entity.NodeTypeCardSelector,
	}

	// Test successful build
	executable, err := config.Build(context.Background(), nodeSchema)
	require.NoError(t, err)
	assert.NotNil(t, executable)

	cardSelector, ok := executable.(*CardSelector)
	assert.True(t, ok)
	assert.Equal(t, "text", cardSelector.config.FilterType)
	assert.Equal(t, "Test content", cardSelector.config.Content)

	// Test build with invalid node type
	invalidNodeSchema := &schema.NodeSchema{
		Type: entity.NodeTypeLLM,
	}

	_, err = config.Build(context.Background(), invalidNodeSchema)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid node type")
}