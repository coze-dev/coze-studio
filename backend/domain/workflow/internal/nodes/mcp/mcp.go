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
	"time"

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
	// Check multiple possible locations for parameters
	var inputParameters []*vo.Param
	
	fmt.Printf("🔧 MCP Adapt DEBUG - Node data structure:\n")
	fmt.Printf("🔧 MCP Adapt DEBUG - n.Data != nil: %v\n", n.Data != nil)
	if n.Data != nil {
		fmt.Printf("🔧 MCP Adapt DEBUG - n.Data.Inputs != nil: %v\n", n.Data.Inputs != nil)
		if n.Data.Inputs != nil {
			fmt.Printf("🔧 MCP Adapt DEBUG - n.Data.Inputs.InputParameters != nil: %v\n", n.Data.Inputs.InputParameters != nil)
			if n.Data.Inputs.InputParameters != nil {
				fmt.Printf("🔧 MCP Adapt DEBUG - n.Data.Inputs.InputParameters length: %d\n", len(n.Data.Inputs.InputParameters))
			}
		}
	}
	
	// Try multiple locations for input parameters
	if n.Data != nil && n.Data.Inputs != nil && n.Data.Inputs.InputParameters != nil {
		inputParameters = n.Data.Inputs.InputParameters
		fmt.Printf("🔧 MCP Adapt - Using n.Data.Inputs.InputParameters: %d\n", len(inputParameters))
	} else {
		fmt.Printf("🔧 MCP Adapt - n.Data.Inputs.InputParameters not found\n")
		// Since the frontend saves MCP parameters at both levels but Go struct only supports nested level,
		// the parameters should be available through the convert function processing.
		// If they're not here, it means frontend data structure needs to be corrected.
	}

	if len(inputParameters) > 0 {
		// Log all parameters for debugging
		for i, param := range inputParameters {
			fmt.Printf("🔧 MCP Param %d: Name='%s', Type='%v', Content='%v'\n", i, param.Name, param.Input.Type, param.Input.Value.Content)
		}

		// Look for MCP configuration in input parameters (both hidden and visible)
		for _, param := range inputParameters {
			if param.Name == "__mcp_sassWorkspaceId" || param.Name == "sassWorkspaceId" {
				if workspaceID, ok := param.Input.Value.Content.(string); ok && workspaceID != "" {
					c.SassWorkspaceID = workspaceID
					fmt.Printf("🔧 MCP Found sassWorkspaceId: %s\n", workspaceID)
				}
			} else if param.Name == "__mcp_mcpId" || param.Name == "mcpId" {
				if mcpID, ok := param.Input.Value.Content.(string); ok && mcpID != "" {
					c.McpID = mcpID
					fmt.Printf("🔧 MCP Found mcpId: %s\n", mcpID)
				}
			} else if param.Name == "__mcp_toolName" || param.Name == "toolName" {
				if toolName, ok := param.Input.Value.Content.(string); ok && toolName != "" {
					c.ToolName = toolName
					fmt.Printf("🔧 MCP Found toolName: %s\n", toolName)
				}
			}
		}
	}

	// Set defaults and validate required parameters
	if c.SassWorkspaceID == "" {
		c.SassWorkspaceID = "7533521629687578624" // Default workspace ID
	}

	// For Adapt phase, allow empty configuration to support form generation
	// Validation will be done later in Invoke phase when actually running
	fmt.Printf("🔧 MCP Adapt completed - mcpId='%s', toolName='%s', sassWorkspaceId='%s'\n", c.McpID, c.ToolName, c.SassWorkspaceID)

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
	// Log all input parameters and current config
	fmt.Printf("🔧 MCP Invoke - input parameters: %+v\n", input)
	fmt.Printf("🔧 MCP Invoke - Config before extraction: sassWorkspaceId=%s, mcpId=%s, toolName=%s\n", c.SassWorkspaceID, c.McpID, c.ToolName)

	// If configuration was not set in Adapt phase (fallback), try to extract from input
	if c.SassWorkspaceID == "" {
		if wsID, ok := input["sassWorkspaceId"].(string); ok && wsID != "" {
			c.SassWorkspaceID = wsID
		} else if wsID, ok := input["__mcp_sassWorkspaceId"].(string); ok && wsID != "" {
			c.SassWorkspaceID = wsID
		} else {
			c.SassWorkspaceID = "7533521629687578624" // Default workspace ID
		}
	}
	if c.McpID == "" {
		if mcpID, ok := input["mcpId"].(string); ok && mcpID != "" {
			c.McpID = mcpID
		} else if mcpID, ok := input["__mcp_mcpId"].(string); ok && mcpID != "" {
			c.McpID = mcpID
		}
	}
	if c.ToolName == "" {
		if toolName, ok := input["toolName"].(string); ok && toolName != "" {
			c.ToolName = toolName
		} else if toolName, ok := input["__mcp_toolName"].(string); ok && toolName != "" {
			c.ToolName = toolName
		}
	}

	// Final configuration check
	fmt.Printf("🔧 MCP Invoke - Final config: sassWorkspaceId=%s, mcpId=%s, toolName=%s\n", c.SassWorkspaceID, c.McpID, c.ToolName)

	// Validate configuration at runtime
	if c.SassWorkspaceID == "" {
		return c.createErrorResponse("sassWorkspaceId is empty", "400"), nil
	}
	if c.McpID == "" {
		return c.createErrorResponse("mcpId is empty", "400"), nil
	}
	if c.ToolName == "" {
		return c.createErrorResponse("toolName is empty", "400"), nil
	}

	// Prepare tool parameters from input
	// Skip MCP configuration keys (both old and new format)
	toolParams := make(map[string]interface{})
	for key, value := range input {
		// Skip MCP configuration keys (old format and new hidden format)
		if key != "sassWorkspaceId" && key != "mcpId" && key != "toolName" && 
		   !strings.HasPrefix(key, "__mcp_") {
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

	// Validate MCP service availability before calling
	if err := c.validateMcpService(ctx); err != nil {
		return c.createErrorResponse(fmt.Sprintf("MCP service validation failed: %v", err), "503"), nil
	}

	// Call MCP service with retry mechanism
	result, err := c.callMcpServiceWithRetry(ctx, requestBody)
	if err != nil {
		return c.createErrorResponse(err.Error(), "500"), nil
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

// createErrorResponse creates a standardized error response
func (c *McpConfig) createErrorResponse(errorMsg, errorCode string) map[string]any {
	return map[string]any{
		"body": map[string]any{
			"error": errorMsg,
			"isError": true,
		},
		"header": map[string]any{
			"errorCode": errorCode,
			"errorMsg":  errorMsg,
		},
	}
}

// validateMcpService checks if the MCP service is available by calling MCP0017.do
func (c *McpConfig) validateMcpService(ctx context.Context) error {
	// Create a simple health check request to MCP0017.do (get service list)
	requestBody := map[string]interface{}{
		"body": map[string]interface{}{
			"sassWorkspaceId": c.SassWorkspaceID,
		},
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return fmt.Errorf("failed to marshal health check request: %v", err)
	}

	// Create health check request with shorter timeout
	req, err := http.NewRequestWithContext(ctx, "POST", "http://10.10.10.208:8500/aop-web/MCP0017.do", strings.NewReader(string(jsonData)))
	if err != nil {
		return fmt.Errorf("failed to create health check request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "*/*")
	req.Header.Set("Request-Origin", "SwaggerBootstrapUi")

	// Use a shorter timeout for health check
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("MCP service health check failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("MCP service health check returned HTTP %d", resp.StatusCode)
	}

	// Parse response to check if service is available
	var result map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return fmt.Errorf("failed to decode health check response: %v", err)
	}

	// Check if the response indicates service availability
	if header, hasHeader := result["header"]; hasHeader {
		if headerMap, ok := header.(map[string]any); ok {
			if errorCode, hasCode := headerMap["errorCode"]; hasCode {
				if errorCode == "-1" {
					return fmt.Errorf("MCP service is not deployed")
				}
				if errorCode != "0" && errorCode != 0 {
					errorMsg := "Unknown error"
					if msg, hasMsg := headerMap["errorMsg"]; hasMsg {
						if msgStr, ok := msg.(string); ok {
							errorMsg = msgStr
						}
					}
					return fmt.Errorf("MCP service validation error: %s", errorMsg)
				}
			}
		}
	}

	fmt.Printf("🔧 MCP Service validation passed\n")
	return nil
}

// callMcpServiceWithRetry makes the HTTP call to MCP0014.do API with retry mechanism
func (c *McpConfig) callMcpServiceWithRetry(ctx context.Context, requestBody map[string]interface{}) (map[string]any, error) {
	const maxRetries = 3
	const baseDelay = 1 * time.Second

	var lastErr error
	for attempt := 0; attempt < maxRetries; attempt++ {
		if attempt > 0 {
			// Exponential backoff
			delay := time.Duration(attempt) * baseDelay
			fmt.Printf("🔧 MCP Retry attempt %d after %v delay\n", attempt+1, delay)
			time.Sleep(delay)
		}

		result, err := c.callMcpService(ctx, requestBody)
		if err == nil {
			// Check if response indicates deployment issue
			if header, hasHeader := result["header"]; hasHeader {
				if headerMap, ok := header.(map[string]any); ok {
					if errorCode, hasCode := headerMap["errorCode"]; hasCode && errorCode == "-1" {
						if errorMsg, hasMsg := headerMap["errorMsg"]; hasMsg && errorMsg == "未部署" {
							lastErr = fmt.Errorf("MCP service not deployed (attempt %d/%d)", attempt+1, maxRetries)
							continue // Retry on deployment error
						}
					}
				}
			}
			return result, nil
		}

		lastErr = err
		fmt.Printf("🔧 MCP Service call failed (attempt %d/%d): %v\n", attempt+1, maxRetries, err)
	}

	return nil, fmt.Errorf("MCP service call failed after %d attempts: %v", maxRetries, lastErr)
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
	req.Header.Set("Request-Origin", "SwaggerBootstrapUi")

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

	// Check HTTP response status
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("HTTP %d: MCP service returned non-200 status", resp.StatusCode)
	}

	// Return in the expected format: body and header
	if header, hasHeader := result["header"]; hasHeader {
		if headerMap, ok := header.(map[string]any); ok {
			// Check for service-level errors
			if errorCode, hasCode := headerMap["errorCode"]; hasCode {
				if errorCode != "0" && errorCode != 0 {
					errorMsg := "Unknown error"
					if msg, hasMsg := headerMap["errorMsg"]; hasMsg {
						if msgStr, ok := msg.(string); ok {
							errorMsg = msgStr
						}
					}

					// Special handling for deployment error
					if errorCode == "-1" && errorMsg == "未部署" {
						return nil, fmt.Errorf("MCP service deployment error: %s", errorMsg)
					}

					fmt.Printf("🔧 MCP Service Error: Code=%v, Msg=%s\n", errorCode, errorMsg)
					return map[string]any{
						"body": map[string]any{
							"error": errorMsg,
							"isError": true,
						},
						"header": header,
					}, nil
				}
			}
		}

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
