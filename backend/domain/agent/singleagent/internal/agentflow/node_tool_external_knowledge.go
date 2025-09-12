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
	"strings"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
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

// callRAGFlowAPI directly calls RAGFlow API with bot configuration parameters
func (e *externalKnowledgeInvokableTool) callRAGFlowAPI(ctx context.Context, question string) (map[string]interface{}, error) {
	// Get RAGFlow base URL from environment
	ragflowBaseURL := os.Getenv("RAGFLOW_BASE_URL")
	if ragflowBaseURL == "" {
		ragflowBaseURL = "http://10.10.10.223" // fallback
	}
	
	// Get RAGFlow API key from environment
	apiKey := os.Getenv("RAGFLOW_API_KEY")
	if apiKey == "" {
		apiKey = "Bearer ragflow-JmYzBmN2EwOGViMTExZjA4ODhhNTYxM2" // fallback
	}

	// Use bot configuration parameters
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

	// Build retrieval request body
	requestBody := map[string]interface{}{
		"question":                 question,
		"dataset_ids":             datasetIDs,
		"top_k":                   topK,
		"page":                    1,
		"page_size":               pageSize,
		"similarity_threshold":    similarityThreshold,
		"vector_similarity_weight": vectorSimilarityWeight,
		"keyword":                 true, // enable keyword search
		"highlight":               true, // enable highlight
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request
	httpReq, err := http.NewRequestWithContext(ctx, "POST", fmt.Sprintf("%s/api/v1/retrieval", ragflowBaseURL), strings.NewReader(string(jsonBody)))
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

	// Check if the request was successful
	if code, ok := result["code"].(float64); !ok || code != 0 {
		return nil, fmt.Errorf("RAGFlow API error: %v", result)
	}

	return result, nil
}