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

package platforms

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"path"
	"strings"

	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type HiagentAdapter struct {
	client HTTPClient
}

func NewHiagentAdapter(client HTTPClient) Adapter {
	return &HiagentAdapter{client: client}
}

const (
	hiagentDefaultChatPath         = "/api/proxy/api/v1/chat_query_v2"
	hiagentDefaultConversationPath = "/api/proxy/api/v1/create_conversation"
)

const (
	hiagentDefaultUserID = "dev"
)

type hiagentCreateConversationRequest struct {
	Inputs map[string]string `json:"Inputs,omitempty"`
	UserID string            `json:"UserID"`
}

type hiagentConversation struct {
	AppConversationID string `json:"AppConversationID"`
	ConversationID    string `json:"ConversationID"`
	ConversationName  string `json:"ConversationName"`
	CreateTime        string `json:"CreateTime"`
	CreateTimestamp   int64  `json:"CreateTimestamp"`
}

type hiagentCreateConversationResponse struct {
	Conversation hiagentConversation `json:"Conversation"`
	Code         int                 `json:"code"`
	Msg          string              `json:"msg"`
}

type hiagentChatRequest struct {
	Query             string `json:"Query"`
	AppConversationID string `json:"AppConversationID"`
	ResponseMode      string `json:"ResponseMode"`
	UserID            string `json:"UserID"`
}

type hiagentChatResponse struct {
	Answer         string   `json:"answer"`
	Code           int      `json:"code"`
	Msg            string   `json:"msg"`
	ToolMessages   []string `json:"tool_messages"`
	TotalTokens    int      `json:"total_tokens"`
	TaskID         string   `json:"task_id"`
	Event          string   `json:"event"`
	ConversationID string   `json:"conversation_id"`
	ID             string   `json:"id"`
	CreatedAt      int64    `json:"created_at"`
}

var hiagentReservedInputKeys = map[string]struct{}{
	"user_id":             {},
	"userid":              {},
	"user-id":             {},
	"app_conversation_id": {},
	"appconversationid":   {},
	"response_mode":       {},
	"responsemode":        {},
	"response-mode":       {},
}

func (h *HiagentAdapter) ValidateConfig(config *Config) error {
	if config == nil {
		return fmt.Errorf("config is nil")
	}
	if config.AgentURL == "" {
		return fmt.Errorf("agent_url is required")
	}
	if config.Query == "" {
		return fmt.Errorf("query is required")
	}
	return nil
}

func (h *HiagentAdapter) Call(ctx context.Context, config *Config) (*Response, error) {
	if err := h.ValidateConfig(config); err != nil {
		return nil, err
	}

	chatURL, conversationURL, err := resolveHiagentEndpoints(config.AgentURL)
	if err != nil {
		return nil, err
	}

	headers := map[string]string{}
	if config.AgentKey != "" {
		headers["Apikey"] = config.AgentKey
	}

	inputs := cloneAndTrimInputs(config.Inputs)
	logs.CtxInfof(ctx, "[hiagent] flattened inputs before filter: %+v", inputs)
	index := buildLowercaseIndex(inputs)

	userID := lookupInsensitive(index, "user_id", "userid", "user-id")
	userID = strings.TrimSpace(userID)
	if userID == "" {
		userID = hiagentDefaultUserID
	}

	appConversationID := strings.TrimSpace(lookupInsensitive(index, "app_conversation_id", "appconversationid"))
	responseMode := strings.TrimSpace(lookupInsensitive(index, "response_mode", "responsemode"))
	if responseMode == "" {
		responseMode = "blocking"
	}

	metadata := make(map[string]any)

	if appConversationID == "" {
		payload := filterReservedHiagentInputs(inputs)
		reqBody := &hiagentCreateConversationRequest{
			Inputs: payload,
			UserID: userID,
		}

		logs.CtxInfof(ctx, "[hiagent] create_conversation request url=%s payload=%+v", conversationURL, reqBody)

		raw, err := h.client.PostJSON(ctx, conversationURL, headers, reqBody)
		if err != nil {
			return nil, err
		}

		var convResp hiagentCreateConversationResponse
		if err := json.Unmarshal(raw, &convResp); err != nil {
			return nil, fmt.Errorf("decode hiagent conversation response failed: %w", err)
		}

		if convResp.Code != 0 {
			errMsg := strings.TrimSpace(convResp.Msg)
			if errMsg == "" {
				errMsg = fmt.Sprintf("hiagent create_conversation failed with code %d", convResp.Code)
			}
			return nil, fmt.Errorf("%s", errMsg)
		}

		if strings.TrimSpace(convResp.Conversation.AppConversationID) == "" {
			errMsg := strings.TrimSpace(convResp.Msg)
			if errMsg == "" {
				errMsg = "hiagent create_conversation returned empty AppConversationID"
			}
			return nil, fmt.Errorf("%s", errMsg)
		}

		appConversationID = strings.TrimSpace(convResp.Conversation.AppConversationID)
		metadata["app_conversation_id"] = appConversationID
		if convResp.Conversation.ConversationID != "" {
			metadata["conversation_id"] = convResp.Conversation.ConversationID
		}
		if convResp.Conversation.ConversationName != "" {
			metadata["conversation_name"] = convResp.Conversation.ConversationName
		}
	} else {
		metadata["app_conversation_id"] = appConversationID
	}

	chatReq := &hiagentChatRequest{
		Query:             config.Query,
		AppConversationID: appConversationID,
		ResponseMode:      responseMode,
		UserID:            userID,
	}

	logs.CtxInfof(ctx, "[hiagent] chat_query_v2 request url=%s payload=%+v", chatURL, chatReq)

	raw, err := h.client.PostJSON(ctx, chatURL, headers, chatReq)
	if err != nil {
		return nil, err
	}

	var chatResp hiagentChatResponse
	if err := json.Unmarshal(raw, &chatResp); err != nil {
		return nil, fmt.Errorf("decode hiagent chat response failed: %w", err)
	}

	if chatResp.ConversationID != "" {
		metadata["conversation_id"] = chatResp.ConversationID
	}
	if chatResp.TaskID != "" {
		metadata["task_id"] = chatResp.TaskID
	}
	if chatResp.Event != "" {
		metadata["event"] = chatResp.Event
	}
	if len(chatResp.ToolMessages) > 0 {
		metadata["tool_messages"] = chatResp.ToolMessages
	}
	if chatResp.TotalTokens > 0 {
		metadata["total_tokens"] = chatResp.TotalTokens
	}
	if chatResp.ID != "" {
		metadata["id"] = chatResp.ID
	}
	if chatResp.CreatedAt != 0 {
		metadata["created_at"] = chatResp.CreatedAt
	}
	if strings.TrimSpace(chatResp.Msg) != "" {
		metadata["msg"] = strings.TrimSpace(chatResp.Msg)
	}

	if chatResp.Code != 0 {
		metadata["code"] = chatResp.Code
		return &Response{
			Answer:   strings.TrimSpace(chatResp.Answer),
			Platform: "hiagent",
			Metadata: metadata,
			Error:    strings.TrimSpace(chatResp.Msg),
		}, nil
	}

	if len(metadata) == 0 {
		metadata = nil
	}

	return &Response{
		Answer:   chatResp.Answer,
		Platform: "hiagent",
		Metadata: metadata,
	}, nil
}

func resolveHiagentEndpoints(agentURL string) (string, string, error) {
	trimmed := strings.TrimSpace(agentURL)
	if trimmed == "" {
		return "", "", fmt.Errorf("agent_url is required")
	}

	parsed, err := url.Parse(trimmed)
	if err != nil {
		return "", "", fmt.Errorf("invalid agent_url: %w", err)
	}

	if parsed.Scheme == "" {
		return "", "", fmt.Errorf("agent_url missing scheme: %s", agentURL)
	}

	if parsed.Host == "" {
		return "", "", fmt.Errorf("agent_url missing host: %s", agentURL)
	}

	// Normalize paths and derive endpoints based on the provided agent_url.
	pathStr := strings.TrimSuffix(parsed.Path, "/")
	if pathStr == "" || pathStr == "/" {
		chatURL := cloneURL(parsed)
		chatURL.Path = hiagentDefaultChatPath
		conversationURL := cloneURL(parsed)
		conversationURL.Path = hiagentDefaultConversationPath
		return chatURL.String(), conversationURL.String(), nil
	}

	lowerPath := strings.ToLower(pathStr)
	switch path.Base(lowerPath) {
	case "chat_query_v2":
		chatURL := cloneURL(parsed)
		conversationURL := cloneURL(parsed)
		conversationURL.Path = path.Join(path.Dir(parsed.Path), "create_conversation")
		return chatURL.String(), conversationURL.String(), nil
	case "create_conversation":
		chatURL := cloneURL(parsed)
		chatURL.Path = path.Join(path.Dir(parsed.Path), "chat_query_v2")
		conversationURL := cloneURL(parsed)
		return chatURL.String(), conversationURL.String(), nil
	default:
		chatURL := cloneURL(parsed)
		chatURL.Path = path.Join(parsed.Path, "chat_query_v2")
		conversationURL := cloneURL(parsed)
		conversationURL.Path = path.Join(parsed.Path, "create_conversation")
		return chatURL.String(), conversationURL.String(), nil
	}
}

func cloneURL(u *url.URL) url.URL {
	if u == nil {
		return url.URL{}
	}
	clone := *u
	return clone
}

func cloneAndTrimInputs(src map[string]string) map[string]string {
	if len(src) == 0 {
		return nil
	}
	dst := make(map[string]string, len(src))
	for k, v := range src {
		trimmedKey := strings.TrimSpace(k)
		dst[trimmedKey] = strings.TrimSpace(v)
	}
	return dst
}

func buildLowercaseIndex(src map[string]string) map[string]string {
	idx := make(map[string]string, len(src))
	for k, v := range src {
		idx[strings.ToLower(k)] = v
	}
	return idx
}

func lookupInsensitive(idx map[string]string, keys ...string) string {
	for _, key := range keys {
		if val, ok := idx[strings.ToLower(key)]; ok {
			return val
		}
	}
	return ""
}

func filterReservedHiagentInputs(inputs map[string]string) map[string]string {
	if len(inputs) == 0 {
		return nil
	}
	filtered := make(map[string]string)
	for k, v := range inputs {
		if v == "" {
			continue
		}
		if _, ok := hiagentReservedInputKeys[strings.ToLower(k)]; ok {
			continue
		}
		filtered[k] = v
	}
	if len(filtered) == 0 {
		return nil
	}
	return filtered
}

var _ Adapter = (*HiagentAdapter)(nil)
