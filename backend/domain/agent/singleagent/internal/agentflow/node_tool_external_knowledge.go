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
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	userApp "github.com/coze-dev/coze-studio/backend/application/user"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type externalKnowledgeConfig struct {
	spaceID             int64
	userID              string
	agentIdentity       *entity.AgentIdentity
	botID               string
	externalKnowledge   *bot_common.ExternalKnowledge
	sessionCookie       string  // 用户的session cookie（废弃，改为从数据库获取）
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
		sessionCookie:     conf.sessionCookie,
	}

	return []tool.InvokableTool{externalKnowledgeTool}, nil
}

type externalKnowledgeInvokableTool struct {
	userID            string
	botID             string
	agentIdentity     *entity.AgentIdentity
	externalKnowledge *bot_common.ExternalKnowledge
	sessionCookie     string  // 废弃，改为从数据库获取
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

// callRAGFlowAPI directly calls RAGFlow API with user's session key from database
func (e *externalKnowledgeInvokableTool) callRAGFlowAPI(ctx context.Context, question string) (map[string]interface{}, error) {
	// 获取当前用户ID
	userIDPtr := ctxutil.GetUIDFromCtx(ctx)
	if userIDPtr == nil {
		return nil, fmt.Errorf("user not authenticated")
	}
	userID := *userIDPtr

	// 从数据库获取用户信息，包括session_key
	userInfo, err := userApp.UserApplicationSVC.DomainSVC.GetUserInfo(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}

	if userInfo.SessionKey == "" {
		return nil, fmt.Errorf("user session key is empty")
	}

	logs.CtxInfof(ctx, "[ExternalKnowledge] Using session_key from database for user %d", userID)

	// Get RAGFlow API URL from environment
	ragflowAPIURL := os.Getenv("RAGFLOW_API_URL")
	if ragflowAPIURL == "" {
		ragflowAPIURL = "https://ynetflow-agent.finmall.com" // fallback to production URL
	}

	// Use Bot configuration parameters
	datasetIDs := e.externalKnowledge.DatasetIds
	if len(datasetIDs) == 0 {
		return nil, fmt.Errorf("no dataset IDs configured")
	}

	// 取第一个数据集ID作为kb_id
	kbID := datasetIDs[0]

	topK := int(1024) // default to 1024 like in curl
	if e.externalKnowledge.TopK != nil {
		topK = int(*e.externalKnowledge.TopK)
	}

	pageSize := int(10) // default page size
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

	// Build retrieval request body matching the curl command format
	requestBody := map[string]interface{}{
		"similarity_threshold":       similarityThreshold,
		"vector_similarity_weight":   vectorSimilarityWeight,
		"top_k":                     topK,
		"use_kg":                    false,
		"question":                  question,
		"kb_id":                     kbID,
		"page":                      1,
		"size":                      pageSize,
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request to RAGFlow API
	httpReq, err := http.NewRequestWithContext(ctx, "POST", fmt.Sprintf("%s/v1/chunk/retrieval_test", ragflowAPIURL), strings.NewReader(string(jsonBody)))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers matching the curl command
	httpReq.Header.Set("Accept", "application/json")
	httpReq.Header.Set("Accept-Language", "zh-CN,zh;q=0.9")
	httpReq.Header.Set("Content-Type", "application/json;charset=UTF-8")
	httpReq.Header.Set("Connection", "keep-alive")
	// Use the same URL for Origin and Referer headers
	ragflowWebURL := os.Getenv("RAGFLOW_WEB_URL")
	if ragflowWebURL == "" {
		ragflowWebURL = "https://ynetflow-agent.finmall.com"
	}
	httpReq.Header.Set("Origin", ragflowWebURL)
	httpReq.Header.Set("Referer", fmt.Sprintf("%s/dataset/testing/%s", ragflowWebURL, kbID))

	// Add user's session key as cookie
	httpReq.Header.Set("Cookie", fmt.Sprintf("session_key=%s", userInfo.SessionKey))

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
	logs.Infof("RAGFlow API called with kb_id=%s, question=%s, size=%d, status=%d", kbID, question, pageSize, resp.StatusCode)

	return result, nil
}