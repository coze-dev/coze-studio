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

package mcp

import (
	"context"
	"testing"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestMcpConfig_Adapt_ValidParameters tests the parameter extraction logic
func TestMcpConfig_Adapt_ValidParameters(t *testing.T) {
	config := &McpConfig{}

	// Create a mock node with valid MCP parameters
	node := &vo.Node{
		ID: "test-node",
		Data: vo.NodeData{
			Meta: vo.NodeMeta{
				Title: "Test MCP Node",
			},
			Inputs: &vo.NodeInputs{
				InputParameters: []vo.NodeInputParameter{
					{
						Name: "__mcp_sassWorkspaceId",
						Input: vo.NodeInputItemData{
							Value: vo.Value{
								Content: "7533521629687578624",
							},
						},
					},
					{
						Name: "__mcp_mcpId",
						Input: vo.NodeInputItemData{
							Value: vo.Value{
								Content: "mcp-test-id",
							},
						},
					},
					{
						Name: "__mcp_toolName",
						Input: vo.NodeInputItemData{
							Value: vo.Value{
								Content: "create_directory",
							},
						},
					},
					{
						Name: "path",
						Input: vo.NodeInputItemData{
							Value: vo.Value{
								Content: "/test/path",
							},
						},
					},
				},
			},
		},
	}

	ctx := context.Background()
	schema, err := config.Adapt(ctx, node)

	require.NoError(t, err)
	assert.NotNil(t, schema)
	assert.Equal(t, "test-node", string(schema.Key))
	assert.Equal(t, entity.NodeTypeMcp, schema.Type)
	assert.Equal(t, "Test MCP Node", schema.Name)

	// Check if configuration was extracted correctly
	assert.Equal(t, "7533521629687578624", config.SassWorkspaceID)
	assert.Equal(t, "mcp-test-id", config.McpID)
	assert.Equal(t, "create_directory", config.ToolName)
}

// TestMcpConfig_Adapt_MissingRequiredParameters tests missing required parameters
func TestMcpConfig_Adapt_MissingRequiredParameters(t *testing.T) {
	testCases := []struct {
		name        string
		parameters  []vo.NodeInputParameter
		expectedErr string
	}{
		{
			name: "missing mcpId",
			parameters: []vo.NodeInputParameter{
				{
					Name: "__mcp_sassWorkspaceId",
					Input: vo.NodeInputItemData{
						Value: vo.Value{Content: "7533521629687578624"},
					},
				},
				{
					Name: "__mcp_toolName",
					Input: vo.NodeInputItemData{
						Value: vo.Value{Content: "create_directory"},
					},
				},
			},
			expectedErr: "mcpId is required for MCP node",
		},
		{
			name: "missing toolName",
			parameters: []vo.NodeInputParameter{
				{
					Name: "__mcp_sassWorkspaceId",
					Input: vo.NodeInputItemData{
						Value: vo.Value{Content: "7533521629687578624"},
					},
				},
				{
					Name: "__mcp_mcpId",
					Input: vo.NodeInputItemData{
						Value: vo.Value{Content: "mcp-test-id"},
					},
				},
			},
			expectedErr: "toolName is required for MCP node",
		},
		{
			name: "empty mcpId",
			parameters: []vo.NodeInputParameter{
				{
					Name: "__mcp_sassWorkspaceId",
					Input: vo.NodeInputItemData{
						Value: vo.Value{Content: "7533521629687578624"},
					},
				},
				{
					Name: "__mcp_mcpId",
					Input: vo.NodeInputItemData{
						Value: vo.Value{Content: ""},
					},
				},
				{
					Name: "__mcp_toolName",
					Input: vo.NodeInputItemData{
						Value: vo.Value{Content: "create_directory"},
					},
				},
			},
			expectedErr: "mcpId is required for MCP node",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			config := &McpConfig{}
			node := &vo.Node{
				ID: "test-node",
				Data: vo.NodeData{
					Meta: vo.NodeMeta{Title: "Test MCP Node"},
					Inputs: &vo.NodeInputs{
						InputParameters: tc.parameters,
					},
				},
			}

			ctx := context.Background()
			_, err := config.Adapt(ctx, node)

			require.Error(t, err)
			assert.Contains(t, err.Error(), tc.expectedErr)
		})
	}
}

// TestMcpConfig_Adapt_DefaultWorkspaceId tests default workspace ID assignment
func TestMcpConfig_Adapt_DefaultWorkspaceId(t *testing.T) {
	config := &McpConfig{}

	node := &vo.Node{
		ID: "test-node",
		Data: vo.NodeData{
			Meta: vo.NodeMeta{Title: "Test MCP Node"},
			Inputs: &vo.NodeInputs{
				InputParameters: []vo.NodeInputParameter{
					{
						Name: "__mcp_mcpId",
						Input: vo.NodeInputItemData{
							Value: vo.Value{Content: "mcp-test-id"},
						},
					},
					{
						Name: "__mcp_toolName",
						Input: vo.NodeInputItemData{
							Value: vo.Value{Content: "create_directory"},
						},
					},
				},
			},
		},
	}

	ctx := context.Background()
	_, err := config.Adapt(ctx, node)

	require.NoError(t, err)
	// Should use default workspace ID when not provided
	assert.Equal(t, "7533521629687578624", config.SassWorkspaceID)
}

// TestMcpConfig_Invoke_ParameterValidation tests runtime parameter validation
func TestMcpConfig_Invoke_ParameterValidation(t *testing.T) {
	testCases := []struct {
		name           string
		config         *McpConfig
		expectedErrMsg string
		expectedCode   string
	}{
		{
			name: "empty sassWorkspaceId",
			config: &McpConfig{
				SassWorkspaceID: "",
				McpID:           "mcp-test-id",
				ToolName:        "create_directory",
			},
			expectedErrMsg: "sassWorkspaceId is empty",
			expectedCode:   "400",
		},
		{
			name: "empty mcpId",
			config: &McpConfig{
				SassWorkspaceID: "7533521629687578624",
				McpID:           "",
				ToolName:        "create_directory",
			},
			expectedErrMsg: "mcpId is empty",
			expectedCode:   "400",
		},
		{
			name: "empty toolName",
			config: &McpConfig{
				SassWorkspaceID: "7533521629687578624",
				McpID:           "mcp-test-id",
				ToolName:        "",
			},
			expectedErrMsg: "toolName is empty",
			expectedCode:   "400",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			ctx := context.Background()
			input := map[string]any{
				"path": "/test/path",
			}

			result, err := tc.config.Invoke(ctx, input)

			require.NoError(t, err) // Should not return error, but error response
			require.NotNil(t, result)

			// Check error response structure
			body, hasBody := result["body"]
			require.True(t, hasBody)
			bodyMap, ok := body.(map[string]any)
			require.True(t, ok)

			errorMsg, hasError := bodyMap["error"].(string)
			require.True(t, hasError)
			assert.Contains(t, errorMsg, tc.expectedErrMsg)

			header, hasHeader := result["header"]
			require.True(t, hasHeader)
			headerMap, ok := header.(map[string]any)
			require.True(t, ok)

			errorCode, hasCode := headerMap["errorCode"].(string)
			require.True(t, hasCode)
			assert.Equal(t, tc.expectedCode, errorCode)
		})
	}
}

// TestMcpConfig_createErrorResponse tests error response format
func TestMcpConfig_createErrorResponse(t *testing.T) {
	config := &McpConfig{}

	result := config.createErrorResponse("Test error message", "500")

	// Check structure
	body, hasBody := result["body"]
	require.True(t, hasBody)
	bodyMap, ok := body.(map[string]any)
	require.True(t, ok)

	assert.Equal(t, "Test error message", bodyMap["error"])
	assert.Equal(t, true, bodyMap["isError"])

	header, hasHeader := result["header"]
	require.True(t, hasHeader)
	headerMap, ok := header.(map[string]any)
	require.True(t, ok)

	assert.Equal(t, "500", headerMap["errorCode"])
	assert.Equal(t, "Test error message", headerMap["errorMsg"])
}

// TestMcpNode_Invoke tests the node invoke method
func TestMcpNode_Invoke(t *testing.T) {
	config := &McpConfig{
		SassWorkspaceID: "7533521629687578624",
		McpID:           "mcp-test-id",
		ToolName:        "create_directory",
	}

	node := &McpNode{config: config}

	ctx := context.Background()
	input := map[string]any{
		"path": "/test/path",
	}

	// This will fail due to network call, but should not panic
	result, err := node.Invoke(ctx, input)

	// Should return error response, not actual error
	require.NoError(t, err)
	require.NotNil(t, result)

	// Should have error response structure due to service call failure
	body, hasBody := result["body"]
	require.True(t, hasBody)
	bodyMap, ok := body.(map[string]any)
	require.True(t, ok)

	// Should contain error due to service unavailability in test environment
	_, hasError := bodyMap["error"]
	assert.True(t, hasError)
}

// TestMcpNodeTypeID verifies that MCP node type has the correct unique ID
func TestMcpNodeTypeID(t *testing.T) {
	// Verify that MCP node type has the correct ID (61)
	mcpMeta := entity.NodeMetaByNodeType(entity.NodeTypeMcp)
	require.NotNil(t, mcpMeta)
	assert.Equal(t, int64(61), mcpMeta.ID)
	assert.Equal(t, entity.NodeTypeMcp, mcpMeta.Key)
	assert.Equal(t, "Mcp", mcpMeta.DisplayKey)
	assert.Equal(t, "MCP工具", mcpMeta.Name)

	// Verify that Knowledge Deleter has different ID (60)
	knowledgeDeleterMeta := entity.NodeMetaByNodeType(entity.NodeTypeKnowledgeDeleter)
	require.NotNil(t, knowledgeDeleterMeta)
	assert.Equal(t, int64(60), knowledgeDeleterMeta.ID)
	assert.Equal(t, entity.NodeTypeKnowledgeDeleter, knowledgeDeleterMeta.Key)

	// Ensure they have different IDs to avoid conflicts
	assert.NotEqual(t, mcpMeta.ID, knowledgeDeleterMeta.ID, "MCP and KnowledgeDeleter nodes must have different IDs to avoid type confusion")
}
