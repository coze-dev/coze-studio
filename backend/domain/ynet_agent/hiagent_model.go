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

package ynet_agent

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"

	workflowModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/workflow"
	crossconversation "github.com/coze-dev/coze-studio/backend/crossdomain/contract/conversation"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

// Context keys for passing ExecuteConfig
type hiagentExecuteConfigKey struct{}

// SetExecuteConfigToContext stores ExecuteConfig in context
func SetExecuteConfigToContext(ctx context.Context, cfg *workflowModel.ExecuteConfig) context.Context {
	return context.WithValue(ctx, hiagentExecuteConfigKey{}, cfg)
}

// GetExecuteConfigFromContext retrieves ExecuteConfig from context
func GetExecuteConfigFromContext(ctx context.Context) *workflowModel.ExecuteConfig {
	if cfg, ok := ctx.Value(hiagentExecuteConfigKey{}).(*workflowModel.ExecuteConfig); ok {
		return cfg
	}
	return nil
}

// HiAgentChatModel 实现 Eino 的 BaseChatModel 接口，用于调用外部HiAgent智能体
type HiAgentChatModel struct {
	agent          *HiAgent
	client         *http.Client
	conversationMu sync.RWMutex
}

// NewHiAgentChatModel 创建HiAgent模型实例
func NewHiAgentChatModel(agent *HiAgent) model.BaseChatModel {
	return &HiAgentChatModel{
		agent: agent,
		client: &http.Client{
			Timeout: 60 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        100,
				MaxIdleConnsPerHost: 10,
				IdleConnTimeout:     90 * time.Second,
			},
		},
	}
}

// Generate - 同步调用HiAgent（blocking模式）
func (h *HiAgentChatModel) Generate(ctx context.Context, messages []*schema.Message, opts ...model.Option) (*schema.Message, error) {
	// 1. 提取用户查询
	query := extractLastUserMessage(messages)
	if query == "" {
		return nil, fmt.Errorf("no user message found in input")
	}

	// 2. 确保会话存在
	appConvID, err := h.ensureConversation(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to ensure conversation: %w", err)
	}

	// 3. 构建请求体
	reqBody := map[string]any{
		"Query":             query,
		"AppConversationID": appConvID,
		"ResponseMode":      "blocking", // 同步模式
		"UserID":            getUserID(ctx),
	}

	// 4. 发送请求
	endpoint := buildEndpoint(h.agent.Endpoint, "/chat_query_v2")
	respData, err := h.doRequest(ctx, endpoint, reqBody)
	if err != nil {
		return nil, err
	}

	// 5. 解析响应
	var chatResp struct {
		Answer         string   `json:"answer"`
		Code           int      `json:"code"`
		Msg            string   `json:"msg"`
		TotalTokens    int      `json:"total_tokens"`
		ConversationID string   `json:"conversation_id"`
		TaskID         string   `json:"task_id"`
		ToolMessages   []string `json:"tool_messages"`
	}

	if err := sonic.Unmarshal(respData, &chatResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	if chatResp.Code != 0 {
		return nil, fmt.Errorf("hiagent error: %s (code: %d)", chatResp.Msg, chatResp.Code)
	}

	// 6. 构造标准Message返回
	extra := make(map[string]any)
	if chatResp.TotalTokens > 0 {
		extra["total_tokens"] = chatResp.TotalTokens
	}
	extra["platform"] = "hiagent"
	extra["agent_id"] = h.agent.AgentID
	if chatResp.ConversationID != "" {
		extra["conversation_id"] = chatResp.ConversationID
	}
	if chatResp.TaskID != "" {
		extra["task_id"] = chatResp.TaskID
	}
	if len(chatResp.ToolMessages) > 0 {
		extra["tool_messages"] = chatResp.ToolMessages
	}

	return &schema.Message{
		Role:    schema.Assistant,
		Content: chatResp.Answer,
		Extra:   extra,
	}, nil
}

// Stream - 流式调用HiAgent
func (h *HiAgentChatModel) Stream(ctx context.Context, messages []*schema.Message, opts ...model.Option) (*schema.StreamReader[*schema.Message], error) {
	// 1. 提取用户查询
	query := extractLastUserMessage(messages)
	if query == "" {
		return nil, fmt.Errorf("no user message found in input")
	}

	// 2. 确保会话存在
	logs.CtxInfof(ctx, "DEBUG: Ensuring conversation exists...")
	appConvID, err := h.ensureConversation(ctx)
	if err != nil {
		logs.CtxErrorf(ctx, "DEBUG: Failed to ensure conversation: %v", err)
		return nil, fmt.Errorf("failed to ensure conversation: %w", err)
	}
	logs.CtxInfof(ctx, "DEBUG: Conversation ensured, app_conversation_id=%s", appConvID)

	// 3. 构建请求
	logs.CtxInfof(ctx, "DEBUG: Building chat query request...")
	reqBody := map[string]any{
		"Query":             query,
		"AppConversationID": appConvID,
		"ResponseMode":      "streaming", // 流式模式
		"UserID":            getUserID(ctx),
	}

	// 4. 发送SSE请求
	endpoint := buildEndpoint(h.agent.Endpoint, "/chat_query_v2")
	logs.CtxInfof(ctx, "DEBUG: Building request for endpoint: %s", endpoint)
	req, err := h.buildRequest(ctx, endpoint, reqBody)
	if err != nil {
		logs.CtxErrorf(ctx, "DEBUG: Failed to build request: %v", err)
		return nil, err
	}

	logs.CtxInfof(ctx, "DEBUG: Sending chat query request...")
	resp, err := h.client.Do(req)
	if err != nil {
		logs.CtxErrorf(ctx, "DEBUG: Failed to send request: %v", err)
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	logs.CtxInfof(ctx, "DEBUG: Received response with status: %d", resp.StatusCode)

	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// 5. 创建StreamReader并启动解析协程
	// 检查context状态
	select {
	case <-ctx.Done():
		logs.CtxErrorf(ctx, "CRITICAL: Context already cancelled before creating stream! err: %v", ctx.Err())
		resp.Body.Close()
		return nil, fmt.Errorf("context cancelled: %w", ctx.Err())
	default:
	}

	// 使用较大的buffer避免因接收方处理慢导致发送失败
	sr, sw := schema.Pipe[*schema.Message](100)

	logs.CtxInfof(ctx, "DEBUG: Created stream pipe (buffer=100), starting SSE parser goroutine...")

	go h.parseSSEStream(ctx, resp.Body, sw)

	logs.CtxInfof(ctx, "DEBUG: Returning StreamReader to caller")
	return sr, nil
}

// parseSSEStream - 解析HiAgent的SSE流并转换为标准Message流
func (h *HiAgentChatModel) parseSSEStream(ctx context.Context, body io.ReadCloser, sw *schema.StreamWriter[*schema.Message]) {
	defer func() {
		logs.CtxInfof(ctx, "DEBUG: parseSSEStream defer - closing body and sw")
		body.Close()
		sw.Close()
		logs.CtxInfof(ctx, "DEBUG: parseSSEStream defer - closed")
	}()

	logs.CtxInfof(ctx, "DEBUG: SSE parser goroutine started, beginning to read stream...")

	// 立即发送占位符消息，确保下游有数据可读，防止stream被认为立即结束
	placeholderMsg := &schema.Message{
		Role:    schema.Assistant,
		Content: " ",
		Extra: map[string]any{
			"platform":    "hiagent",
			"agent_id":    h.agent.AgentID,
			"placeholder": true,
		},
	}
	sendSuccess := sw.Send(placeholderMsg, nil)
	logs.CtxInfof(ctx, "DEBUG: Sent placeholder in goroutine, success: %v", sendSuccess)
	// 注意：Send返回false不一定表示发送失败，可能是发送成功后检测到stream关闭（竞态）
	// 所以我们不应该在这里return，而应该继续读取SSE流

	scanner := bufio.NewScanner(body)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024) // 增大缓冲区

	var totalTokens int
	var conversationID string
	var taskID string

	logs.CtxInfof(ctx, "DEBUG: Starting to scan SSE lines...")
	for scanner.Scan() {
		// 检查context是否被取消
		select {
		case <-ctx.Done():
			logs.CtxErrorf(ctx, "CRITICAL: Context cancelled during SSE parsing! err: %v", ctx.Err())
			return
		default:
		}

		line := scanner.Text()

		// 跳过空行
		if strings.TrimSpace(line) == "" {
			continue
		}

		// 解析SSE格式
		if !strings.HasPrefix(line, "data:") {
			continue
		}

		dataStr := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
		if dataStr == "" {
			continue
		}

		// 解析JSON数据
		var data map[string]any
		if err := sonic.UnmarshalString(dataStr, &data); err != nil {
			logs.CtxWarnf(ctx, "failed to parse SSE data: %v, data: %s", err, dataStr)
			continue
		}

		eventType, _ := data["event"].(string)

		// 根据事件类型处理
		switch eventType {
		case "message_start":
			// 消息开始 - 提取任务ID
			if tid, ok := data["task_id"].(string); ok {
				taskID = tid
			}
			if cid, ok := data["conversation_id"].(string); ok {
				conversationID = cid
			}
			logs.CtxInfof(ctx, "hiagent stream started, task_id: %s, conversation_id: %s", taskID, conversationID)

		case "message":
			// 流式内容片段
			if answer, ok := data["answer"].(string); ok && answer != "" {
				logs.CtxInfof(ctx, "hiagent received chunk from SSE: %s", answer)
				msg := &schema.Message{
					Role:    schema.Assistant,
					Content: answer,
					Extra: map[string]any{
						"platform": "hiagent",
						"agent_id": h.agent.AgentID,
					},
				}
				logs.CtxInfof(ctx, "hiagent attempting to send chunk to stream...")
				sendSuccess := sw.Send(msg, nil)
				logs.CtxInfof(ctx, "hiagent send result: %v (chunk: %s)", sendSuccess, answer)
				// 注意：Send返回false可能是竞态条件，消息可能已经发送成功
				// 继续处理后续chunks，让SSE流自然结束
			}

		case "message_cost":
			// Token统计
			if inputTokens, ok := data["input_tokens"].(float64); ok {
				totalTokens += int(inputTokens)
			}
			if outputTokens, ok := data["output_tokens"].(float64); ok {
				totalTokens += int(outputTokens)
			}

		case "message_end":
			// 流结束 - 发送最终消息（包含metadata）
			finalExtra := map[string]any{
				"platform": "hiagent",
				"agent_id": h.agent.AgentID,
				"finished": true,
			}
			if totalTokens > 0 {
				finalExtra["total_tokens"] = totalTokens
			}
			if conversationID != "" {
				finalExtra["conversation_id"] = conversationID
			}
			if taskID != "" {
				finalExtra["task_id"] = taskID
			}

			// 从agent configuration获取额外信息
			if agentConf, ok := data["agent_configuration"].(map[string]any); ok {
				finalExtra["agent_configuration"] = agentConf
			}

			finalMsg := &schema.Message{
				Role:    schema.Assistant,
				Content: "", // 空内容表示结束
				Extra:   finalExtra,
			}
			if !sw.Send(finalMsg, nil) {
				logs.CtxErrorf(ctx, "failed to send final message")
			}

			logs.CtxInfof(ctx, "hiagent stream completed, total_tokens: %d", totalTokens)
			return

		case "message_output_start", "message_output_end":
			// 输出开始/结束事件 - 仅记录日志
			logs.CtxDebugf(ctx, "hiagent event: %s", eventType)

		default:
			// 其他事件忽略或记录日志
			logs.CtxDebugf(ctx, "hiagent unknown event: %s", eventType)
		}
	}

	if err := scanner.Err(); err != nil {
		logs.CtxErrorf(ctx, "stream read error: %v", err)
		sw.Send(nil, fmt.Errorf("stream read error: %w", err))
	}
}

// ensureConversation - 确保HiAgent会话存在（创建或复用）
func (h *HiAgentChatModel) ensureConversation(ctx context.Context) (string, error) {
	logs.CtxInfof(ctx, "DEBUG: ensureConversation - start")
	exeCfg := GetExecuteConfigFromContext(ctx)
	if exeCfg == nil {
		// 如果没有ExecuteConfig，每次都创建新会话
		logs.CtxWarnf(ctx, "execute config not found in context, will create new conversation each time")
		return h.createConversation(ctx)
	}

	// 调试：打印ExecuteConfig的地址和内容
	logs.CtxInfof(ctx, "DEBUG: ExecuteConfig address=%p, conversation_id=%v, section_id=%v, hiagent_map=%v",
		exeCfg, exeCfg.ConversationID, exeCfg.SectionID, exeCfg.HiAgentConversations)

	// 简化锁逻辑：先尝试读取，如果需要创建则释放读锁获取写锁
	logs.CtxInfof(ctx, "DEBUG: ensureConversation - acquiring RLock to check existing")
	h.conversationMu.RLock()
	existingInfo := exeCfg.GetHiAgentConversationInfo(h.agent.AgentID)
	logs.CtxInfof(ctx, "DEBUG: ensureConversation - checked existing info=%+v for agent_id=%s",
		existingInfo, h.agent.AgentID)

	// 判断是否可以复用现有会话
	canReuse := false
	if existingInfo != nil && existingInfo.AppConversationID != "" {
		// 如果没有 section 概念，或者 section 未变化，则可以复用
		if exeCfg.SectionID == nil {
			canReuse = true
		} else if existingInfo.LastSectionID == *exeCfg.SectionID {
			canReuse = true
		}
	}

	// 如果可以复用，直接返回
	if canReuse {
		logs.CtxInfof(ctx, "reusing hiagent conversation: %s (section_id: %d)",
			existingInfo.AppConversationID, existingInfo.LastSectionID)
		h.conversationMu.RUnlock()
		return existingInfo.AppConversationID, nil
	}

	// 需要创建新会话，释放读锁
	h.conversationMu.RUnlock()
	logs.CtxInfof(ctx, "DEBUG: ensureConversation - need new conversation, acquiring Lock")

	// 获取写锁
	h.conversationMu.Lock()
	defer h.conversationMu.Unlock()

	// Double-check：可能其他goroutine已经创建了
	existingInfo = exeCfg.GetHiAgentConversationInfo(h.agent.AgentID)
	canReuse = false
	if existingInfo != nil && existingInfo.AppConversationID != "" {
		if exeCfg.SectionID == nil {
			canReuse = true
		} else if existingInfo.LastSectionID == *exeCfg.SectionID {
			canReuse = true
		}
	}

	if canReuse {
		logs.CtxInfof(ctx, "reusing hiagent conversation (after lock): %s", existingInfo.AppConversationID)
		return existingInfo.AppConversationID, nil
	}

	// 清除旧会话（如果有section变化）
	if existingInfo != nil && existingInfo.AppConversationID != "" {
		logs.CtxInfof(ctx, "section changed (old: %d, new: %d), clearing old conversation",
			existingInfo.LastSectionID, *exeCfg.SectionID)
		exeCfg.ClearHiAgentConversationID(h.agent.AgentID)
	}

	// 创建新会话
	logs.CtxInfof(ctx, "DEBUG: ensureConversation - calling createConversation")
	appConvID, err := h.createConversation(ctx)
	if err != nil {
		logs.CtxErrorf(ctx, "DEBUG: ensureConversation - createConversation failed: %v", err)
		return "", err
	}
	logs.CtxInfof(ctx, "DEBUG: ensureConversation - createConversation succeeded: %s", appConvID)

	// 获取当前 sectionID
	sectionID := int64(0)
	if exeCfg.SectionID != nil {
		sectionID = *exeCfg.SectionID
		logs.CtxInfof(ctx, "DEBUG: got section_id from ExecuteConfig: %d", sectionID)
	} else {
		logs.CtxWarnf(ctx, "DEBUG: ExecuteConfig.SectionID is nil!")
	}

	// 存储映射关系到内存（ExecuteConfig）
	exeCfg.SetHiAgentConversationInfo(h.agent.AgentID, &workflowModel.HiAgentConversationInfo{
		AppConversationID: appConvID,
		LastSectionID:     sectionID,
	})
	logs.CtxInfof(ctx, "DEBUG: saved to ExecuteConfig: app_conv_id=%s, section_id=%d", appConvID, sectionID)

	// 🆕 持久化到数据库conversation表的Ext字段
	if exeCfg.ConversationID != nil && *exeCfg.ConversationID != 0 {
		if err := saveHiAgentConversationToDatabase(ctx, *exeCfg.ConversationID, h.agent.AgentID, appConvID, sectionID); err != nil {
			logs.CtxErrorf(ctx, "failed to save hiagent conversation to database: %v", err)
			// 不返回错误，因为内存中已经保存了，这次请求可以继续
		}
	}

	return appConvID, nil
}

// createConversation - 创建新的HiAgent会话
func (h *HiAgentChatModel) createConversation(ctx context.Context) (string, error) {
	endpoint := buildEndpoint(h.agent.Endpoint, "/create_conversation")

	// 调试：打印实际请求的 URL 和认证信息
	logs.CtxInfof(ctx, "DEBUG: Creating HiAgent conversation - base_endpoint=%s, full_url=%s",
		h.agent.Endpoint, endpoint)

	apiKeyPreview := "nil"
	if h.agent.APIKey != nil {
		if len(*h.agent.APIKey) > 10 {
			apiKeyPreview = (*h.agent.APIKey)[:10] + "..."
		} else {
			apiKeyPreview = *h.agent.APIKey
		}
	}
	logs.CtxInfof(ctx, "DEBUG: HiAgent auth - auth_type=%s, api_key_preview=%s", h.agent.AuthType, apiKeyPreview)

	reqBody := map[string]any{
		"Inputs": map[string]string{}, // 可以从节点配置传入额外输入
		"UserID": getUserID(ctx),
	}

	respData, err := h.doRequest(ctx, endpoint, reqBody)
	if err != nil {
		return "", err
	}

	var convResp struct {
		Conversation struct {
			AppConversationID string `json:"AppConversationID"`
			ConversationID    string `json:"ConversationID"`
			ConversationName  string `json:"ConversationName"`
		} `json:"Conversation"`
		Code int    `json:"code"`
		Msg  string `json:"msg"`
	}

	if err := sonic.Unmarshal(respData, &convResp); err != nil {
		return "", fmt.Errorf("failed to parse conversation response: %w", err)
	}

	if convResp.Code != 0 {
		return "", fmt.Errorf("failed to create conversation: %s (code: %d)", convResp.Msg, convResp.Code)
	}

	appConvID := convResp.Conversation.AppConversationID
	if appConvID == "" {
		return "", fmt.Errorf("empty AppConversationID returned")
	}

	logs.CtxInfof(ctx, "created hiagent conversation: app_conversation_id=%s, conversation_id=%s, name=%s",
		appConvID, convResp.Conversation.ConversationID, convResp.Conversation.ConversationName)

	return appConvID, nil
}

// doRequest - 执行HTTP请求
func (h *HiAgentChatModel) doRequest(ctx context.Context, endpoint string, body map[string]any) ([]byte, error) {
	logs.CtxInfof(ctx, "DEBUG: Building HTTP request for endpoint: %s", endpoint)
	req, err := h.buildRequest(ctx, endpoint, body)
	if err != nil {
		logs.CtxErrorf(ctx, "DEBUG: Failed to build request: %v", err)
		return nil, err
	}

	logs.CtxInfof(ctx, "DEBUG: Sending HTTP request to %s", endpoint)
	resp, err := h.client.Do(req)
	if err != nil {
		logs.CtxErrorf(ctx, "DEBUG: HTTP request failed: %v", err)
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	logs.CtxInfof(ctx, "DEBUG: Received HTTP response with status: %d", resp.StatusCode)
	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		logs.CtxErrorf(ctx, "DEBUG: Non-OK status code: %d, body: %s", resp.StatusCode, string(bodyBytes))
		return nil, fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	logs.CtxInfof(ctx, "DEBUG: Reading response body")
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		logs.CtxErrorf(ctx, "DEBUG: Failed to read response body: %v", err)
		return nil, err
	}
	logs.CtxInfof(ctx, "DEBUG: Response body length: %d bytes", len(bodyBytes))
	return bodyBytes, nil
}

// buildRequest - 构建HTTP请求
func (h *HiAgentChatModel) buildRequest(ctx context.Context, endpoint string, body map[string]any) (*http.Request, error) {
	bodyBytes, err := sonic.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %w", err)
	}

	logs.CtxInfof(ctx, "DEBUG: Request body: %s", string(bodyBytes))

	req, err := http.NewRequestWithContext(ctx, "POST", endpoint, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// 设置请求头
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "text/event-stream") // 用于流式请求

	// 设置API Key
	if h.agent.APIKey != nil && *h.agent.APIKey != "" {
		req.Header.Set("Apikey", *h.agent.APIKey)
		logs.CtxInfof(ctx, "DEBUG: Added Apikey header (length: %d)", len(*h.agent.APIKey))
	}

	return req, nil
}

// IsCallbacksEnabled - 实现接口方法
func (h *HiAgentChatModel) IsCallbacksEnabled() bool {
	return false // HiAgent暂不支持回调
}

// GetType - 返回模型类型
func (h *HiAgentChatModel) GetType() string {
	return "hiagent"
}

// 辅助函数

// extractLastUserMessage 提取最后一条用户消息
func extractLastUserMessage(messages []*schema.Message) string {
	for i := len(messages) - 1; i >= 0; i-- {
		if messages[i].Role == schema.User {
			return strings.TrimSpace(messages[i].Content)
		}
	}
	return ""
}

// getUserID 从执行上下文获取用户ID
func getUserID(ctx context.Context) string {
	if exeCfg := GetExecuteConfigFromContext(ctx); exeCfg != nil {
		return fmt.Sprintf("%d", exeCfg.Operator)
	}
	return "default_user"
}

// buildEndpoint 构建完整的endpoint URL
func buildEndpoint(baseURL, path string) string {
	base := strings.TrimSuffix(baseURL, "/")
	p := strings.TrimPrefix(path, "/")
	return base + "/" + p
}

// saveHiAgentConversationToDatabase 保存HiAgent会话映射到数据库
// 通过调用crossdomain conversation service来更新数据库
func saveHiAgentConversationToDatabase(ctx context.Context, conversationID int64, agentID, appConversationID string, sectionID int64) error {
	logs.CtxInfof(ctx, "💾 saving hiagent conversation to DB: conversation_id=%d, agent_id=%s, app_conversation_id=%s, section_id=%d",
		conversationID, agentID, appConversationID, sectionID)

	// 导入必要的包
	// github.com/coze-dev/coze-studio/backend/crossdomain/contract/conversation
	// github.com/coze-dev/coze-studio/backend/pkg/sonic

	// 1. 获取当前conversation记录
	manager := crossconversation.DefaultSVC()
	if manager == nil {
		return fmt.Errorf("conversation manager is nil")
	}

	conv, err := manager.GetByID(ctx, conversationID)
	if err != nil {
		return fmt.Errorf("failed to get conversation: %w", err)
	}

	// 2. 解析现有Ext字段
	var ext map[string]interface{}
	if conv.Ext != "" {
		if err := sonic.UnmarshalString(conv.Ext, &ext); err != nil {
			logs.CtxWarnf(ctx, "failed to unmarshal existing ext, creating new: %v", err)
			ext = make(map[string]interface{})
		}
	} else {
		ext = make(map[string]interface{})
	}

	// 3. 更新或创建hiagent_conversations映射
	var hiagentConvs map[string]interface{}
	if existing, ok := ext["hiagent_conversations"].(map[string]interface{}); ok {
		hiagentConvs = existing
	} else {
		hiagentConvs = make(map[string]interface{})
	}

	// 使用新的结构来同时保存 app_conversation_id 和 last_section_id
	hiagentConvs[agentID] = map[string]interface{}{
		"app_conversation_id": appConversationID,
		"last_section_id":     sectionID,
	}
	ext["hiagent_conversations"] = hiagentConvs

	// 4. 序列化回JSON
	extStr, err := sonic.MarshalString(ext)
	if err != nil {
		return fmt.Errorf("failed to marshal ext: %w", err)
	}

	// 5. 调用UpdateExt更新数据库
	if err := manager.UpdateExt(ctx, conversationID, extStr); err != nil {
		return fmt.Errorf("failed to update conversation ext: %w", err)
	}

	logs.CtxInfof(ctx, "✅ successfully saved hiagent conversation to DB")
	return nil
}
