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
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

// McpConfig represents the configuration for an MCP node
type McpConfig struct {
	SassWorkspaceID string `json:"sassWorkspaceId"`
	McpID           string `json:"mcpId"`
	ToolName        string `json:"toolName"`
}

// Adapt converts the frontend node data to backend schema
func (c *McpConfig) Adapt(ctx context.Context, n *vo.Node, opts ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeMcp,
		Name:    n.Data.Meta.Title,
		Configs: c,
	}

	// Extract MCP configuration from frontend data
	// The MCP configuration is stored in mcpConfig field, not in inputParameters
	if mcpConfigData, ok := n.Data.Data["mcpConfig"]; ok {
		if mcpConfigMap, ok := mcpConfigData.(map[string]interface{}); ok {
			if sassWorkspaceId, ok := mcpConfigMap["sassWorkspaceId"].(string); ok {
				c.SassWorkspaceID = sassWorkspaceId
			}
			if mcpId, ok := mcpConfigMap["mcpId"].(string); ok {
				c.McpID = mcpId
			}
			if toolName, ok := mcpConfigMap["toolName"].(string); ok {
				c.ToolName = toolName
			}
		}
	}

	// If not found in mcpConfig, set defaults
	if c.SassWorkspaceID == "" {
		c.SassWorkspaceID = "7533521629687578624" // Default workspace ID
	}

	// Use standard input processing
	if err := convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	// Set standard output types
	if err := convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

// Invoke executes the MCP tool call
func (c *McpConfig) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	// Log all input parameters
	fmt.Printf("🔧 MCP Invoke - input parameters: %+v\n", input)
	fmt.Printf("🔧 MCP Config: sassWorkspaceId=%s, mcpId=%s, toolName=%s\n", c.SassWorkspaceID, c.McpID, c.ToolName)

	// Prepare tool parameters from input
	// Skip MCP configuration keys that were extracted in Adapt()
	toolParams := make(map[string]interface{})
	for key, value := range input {
		// Skip MCP configuration keys
		if key != "sassWorkspaceId" && key != "mcpId" && key != "toolName" {
			toolParams[key] = value
		}
	}
	
	fmt.Printf("🔧 MCP Final toolParams for API: %+v\n", toolParams)

	// Prepare the request payload for MCP0014.do
	requestBody := map[string]interface{}{
		"body": map[string]interface{}{
			"sassWorkspaceId": c.SassWorkspaceID,
			"mcpId":           c.McpID,
			"toolName":        c.ToolName,
			"toolParams":      toolParams,
		},
	}

	// Call MCP service
	result, err := c.callMcpService(ctx, requestBody)
	if err != nil {
		return map[string]any{
			"body": map[string]any{
				"error": err.Error(),
			},
			"header": map[string]any{
				"errorCode": "500",
				"errorMsg":  err.Error(),
			},
		}, nil // Return error in the standard format, don't fail the workflow
	}

	return result, nil
}

// Build implements the NodeBuilder interface
func (c *McpConfig) Build(ctx context.Context, ns *schema.NodeSchema, opts ...schema.BuildOption) (interface{}, error) {
	// Return an InvokableNode implementation
	return &McpNode{config: c}, nil
}

// McpNode is the executable node implementation
type McpNode struct {
	config *McpConfig
}

// Invoke implements the InvokableNode interface
func (n *McpNode) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	return n.config.Invoke(ctx, input)
}

// callMcpService makes the HTTP call to MCP0014.do API
func (c *McpConfig) callMcpService(ctx context.Context, requestBody map[string]interface{}) (map[string]any, error) {
	// Convert request body to JSON
	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %v", err)
	}

	// Log the actual request being made
	fmt.Printf("🔧 MCP HTTP Request URL: http://10.10.10.208:8500/aop-web/MCP0014.do\n")
	fmt.Printf("🔧 MCP HTTP Request Body: %s\n", string(jsonData))

	// Create HTTP request
	req, err := http.NewRequestWithContext(ctx, "POST", "http://10.10.10.208:8500/aop-web/MCP0014.do", strings.NewReader(string(jsonData)))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "*/*")
	req.Header.Set("Request-Origion", "SwaggerBootstrapUi")

	// Make the HTTP call
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call MCP service: %v", err)
	}
	defer resp.Body.Close()

	// Parse response
	var result map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	// Log the response
	fmt.Printf("🔧 MCP HTTP Response Status: %d\n", resp.StatusCode)
	responseData, _ := json.Marshal(result)
	fmt.Printf("🔧 MCP HTTP Response Body: %s\n", string(responseData))

	// Return in the expected format: body and header
	if header, hasHeader := result["header"]; hasHeader {
		if body, hasBody := result["body"]; hasBody {
			// Check for MCP-specific errors in body
			if bodyMap, ok := body.(map[string]any); ok {
				if isError, hasError := bodyMap["isError"]; hasError && isError == true {
					// Extract error message from content
					if contentArray, hasContent := bodyMap["content"].([]any); hasContent && len(contentArray) > 0 {
						if contentItem, ok := contentArray[0].(map[string]any); ok {
							if errorText, hasText := contentItem["text"].(string); hasText {
								fmt.Printf("🔧 MCP Tool Error: %s\n", errorText)
								return map[string]any{
									"body": map[string]any{
										"error": errorText,
										"isError": true,
									},
									"header": header,
								}, nil
							}
						}
					}
				}
			}
			
			fmt.Printf("🔧 MCP Response processed successfully\n")
			return map[string]any{
				"body":   body,
				"header": header,
			}, nil
		}
	}

	// Fallback: return the entire response as body
	return map[string]any{
		"body":   result,
		"header": map[string]any{},
	}, nil
}

// init registers the MCP node adaptor
func init() {
	nodes.RegisterNodeAdaptor(entity.NodeTypeMcp, func() nodes.NodeAdaptor {
		return &McpConfig{}
	})
}
