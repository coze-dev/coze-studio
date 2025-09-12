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

package agentflow

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	external_knowledge "github.com/coze-dev/coze-studio/backend/api/model/external_knowledge"
	externalKnowledgeApp "github.com/coze-dev/coze-studio/backend/application/external_knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	domainExternalKnowledge "github.com/coze-dev/coze-studio/backend/domain/external_knowledge"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type externalKnowledgeConfig struct {
	spaceID             int64
	userID              string
	agentIdentity       *entity.AgentIdentity
	botID               string
	externalKnowledge   *bot_common.ExternalKnowledge
}

// newExternalKnowledgeTools creates external knowledge tools if dataset_ids is not empty
func newExternalKnowledgeTools(ctx context.Context, conf *externalKnowledgeConfig) ([]tool.InvokableTool, error) {
	// 如果没有配置数据集ID，则不创建工具
	if conf.externalKnowledge == nil || len(conf.externalKnowledge.DatasetIds) == 0 {
		return nil, nil
	}

	// 创建外部知识库工具
	externalKnowledgeTool := &externalKnowledgeInvokableTool{
		userID:            conf.userID,
		botID:             conf.botID,
		agentIdentity:     conf.agentIdentity,
		externalKnowledge: conf.externalKnowledge,
	}

	return []tool.InvokableTool{externalKnowledgeTool}, nil
}

type externalKnowledgeInvokableTool struct {
	userID            string
	botID             string
	agentIdentity     *entity.AgentIdentity
	externalKnowledge *bot_common.ExternalKnowledge
}

// Info returns the tool information for the external knowledge base
func (e *externalKnowledgeInvokableTool) Info(ctx context.Context) (*schema.ToolInfo, error) {
	// 定义工具的参数结构
	params := map[string]*schema.ParameterInfo{
		"question": {
			Type:     schema.String,
			Desc:     "The question to search for in the external knowledge base",
			Required: true,
		},
	}

	return &schema.ToolInfo{
		Name:        "external_knowledge_search",
		Desc:        "Search the external knowledge base for relevant information to answer questions",
		ParamsOneOf: schema.NewParamsOneOfByParams(params),
	}, nil
}

// InvokableRun executes the external knowledge search
func (e *externalKnowledgeInvokableTool) InvokableRun(ctx context.Context, argumentsInJSON string, _ ...tool.Option) (string, error) {
	// 解析输入参数
	var args struct {
		Question string `json:"question"`
	}
	if err := json.Unmarshal([]byte(argumentsInJSON), &args); err != nil {
		return "", fmt.Errorf("failed to parse arguments: %w", err)
	}

	if args.Question == "" {
		return "", fmt.Errorf("question is required")
	}

	// 直接调用RAGFlow API，使用Bot配置的参数
	result, err := e.callRAGFlowAPI(ctx, args.Question)
	if err != nil {
		return "", fmt.Errorf("failed to search external knowledge: %w", err)
	}

	// 将结果转换为JSON字符串返回
	resultJSON, err := json.Marshal(result)
	if err != nil {
		return "", fmt.Errorf("failed to marshal result: %w", err)
	}

	return string(resultJSON), nil
}

// callRAGFlowAPI directly calls RAGFlow API v2 with user's binding key and Bot configuration
func (e *externalKnowledgeInvokableTool) callRAGFlowAPI(ctx context.Context, question string) (map[string]interface{}, error) {
	// Get RAGFlow base URL from environment
	ragflowBaseURL := os.Getenv("RAGFLOW_BASE_URL")
	if ragflowBaseURL == "" {
		ragflowBaseURL = "http://10.10.10.223:9222" // fallback with port
	}

	// Get user's binding key from the application service
	if externalKnowledgeApp.ExternalKnowledgeApplicationSVC == nil {
		return nil, fmt.Errorf("external knowledge service not initialized")
	}

	// Get the user's enabled binding for RAGFlow API key
	userIDInt, err := strconv.ParseInt(e.userID, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %s", e.userID)
	}
	userIDStr := strconv.FormatInt(userIDInt, 10)

	// Get user bindings through the existing GetBindingList API
	bindingReq := &external_knowledge.GetBindingListRequest{
		Page:     ptr.Of(int32(1)),
		PageSize: ptr.Of(int32(10)),
	}
	bindingResp, err := externalKnowledgeApp.ExternalKnowledgeApplicationSVC.GetBindingList(ctx, userIDStr, bindingReq)
	if err != nil {
		return nil, fmt.Errorf("failed to get user bindings: %w", err)
	}

	if bindingResp.Code != 0 || len(bindingResp.Data) == 0 {
		return nil, fmt.Errorf("no enabled RAGFlow binding found for user %s", userIDStr)
	}

	// Find an enabled binding
	var apiKey string
	for _, binding := range bindingResp.Data {
		if binding.Status == domainExternalKnowledge.BindingStatusEnabled {
			apiKey = fmt.Sprintf("Bearer %s", binding.BindingKey)
			break
		}
	}
	if apiKey == "" {
		return nil, fmt.Errorf("no enabled binding found for user %s", userIDStr)
	}

	// Use Bot configuration parameters
	datasetIDs := e.externalKnowledge.DatasetIds
	topK := int(5) // default
	if e.externalKnowledge.TopK != nil {
		topK = int(*e.externalKnowledge.TopK)
	}
	
	pageSize := int(5) // default, use configured page_size
	if e.externalKnowledge.PageSize != nil {
		pageSize = int(*e.externalKnowledge.PageSize)
	}
	
	similarityThreshold := 0.2 // default
	if e.externalKnowledge.SimilarityThreshold != nil {
		similarityThreshold = *e.externalKnowledge.SimilarityThreshold
	}
	
	vectorSimilarityWeight := 0.3 // default
	if e.externalKnowledge.VectorSimilarityWeight != nil {
		vectorSimilarityWeight = *e.externalKnowledge.VectorSimilarityWeight
	}

	// Build retrieval request body with v2 API format and exclude_fields
	requestBody := map[string]interface{}{
		"question":                 question,
		"page":                     1,
		"page_size":                pageSize,
		"dataset_ids":              datasetIDs,
		"exclude_fields":           []string{"image_id", "positions", "content_ltks", "important_keywords"}, // 固定的exclude_fields
		"top_k":                    topK,
		"similarity_threshold":     similarityThreshold,
		"vector_similarity_weight": vectorSimilarityWeight,
		"keyword":                  true, // enable keyword search
		"highlight":                true, // enable highlight
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request for v2 API
	httpReq, err := http.NewRequestWithContext(ctx, "POST", fmt.Sprintf("%s/api/v1/retrieval_v2", ragflowBaseURL), strings.NewReader(string(jsonBody)))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", apiKey)

	// Send request
	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call RAGFlow API: %w", err)
	}
	defer resp.Body.Close()

	// Read response
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	// Log request details for debugging
	if data, ok := result["data"].(map[string]interface{}); ok {
		if chunks, ok := data["chunks"].([]interface{}); ok {
			logs.Infof("RAGFlow API v2 called with page_size=%d, returned %d chunks", pageSize, len(chunks))
		}
	}

	return result, nil
}