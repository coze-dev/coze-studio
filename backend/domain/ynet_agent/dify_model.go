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
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"

	workflowModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/workflow"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/conversation"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

// DifyAgent Dify 外部智能体信息
type DifyAgent struct {
	AgentID     string  // 外部智能体ID
	Name        string  // 智能体名称
	Description *string // 描述
	APIEndpoint string  // API端点 (如: http://ai.finmall.com/v1/chat-messages)
	APIKey      string  // API密钥 (Bearer token)
	SpaceID     int64   // 空间ID
}

// DifyAgentChatModel Dify 智能体聊天模型实现
type DifyAgentChatModel struct {
	agent          *DifyAgent
	client         *http.Client
	conversationMu sync.RWMutex
}

// NewDifyAgentChatModel 创建 Dify 智能体聊天模型
func NewDifyAgentChatModel(ctx context.Context, agent *DifyAgent) (*DifyAgentChatModel, error) {
	if agent == nil {
		return nil, fmt.Errorf("agent is nil")
	}

	if agent.APIEndpoint == "" {
		return nil, fmt.Errorf("API endpoint is required")
	}

	if agent.APIKey == "" {
		return nil, fmt.Errorf("API key is required")
	}

	return &DifyAgentChatModel{
		agent: agent,
		client: &http.Client{
			Timeout: 0, // 流式请求不设置超时
		},
	}, nil
}

// GetType 返回模型类型
func (d *DifyAgentChatModel) GetType() string {
	return "dify_agent"
}

// ============ 核心方法 1: 会话管理 ============

// ensureConversation 确保会话存在
// Dify 的会话管理非常简单：
// 1. 第一次请求时，conversation_id 传空字符串
// 2. Dify 会在响应中返回 conversation_id
// 3. 后续请求使用返回的 conversation_id 即可保持上下文
func (d *DifyAgentChatModel) ensureConversation(ctx context.Context) (string, error) {
	// 1. 从 ExecuteConfig 获取现有会话信息
	exeCfg := GetExecuteConfigFromContext(ctx)
	if exeCfg == nil {
		logs.CtxWarnf(ctx, "ExecuteConfig not found in context for Dify agent: %s", d.agent.AgentID)
		return "", nil // Dify 允许空 conversation_id，会自动创建
	}

	existingInfo := exeCfg.GetHiAgentConversationInfo(d.agent.AgentID)

	// 2. 判断是否可以复用现有会话
	canReuse := false
	if existingInfo != nil && existingInfo.AppConversationID != "" {
		if exeCfg.SectionID == nil {
			// 无 section 概念，直接复用
			canReuse = true
		} else if existingInfo.LastSectionID == *exeCfg.SectionID {
			// section 未变化，复用
			canReuse = true
			logs.CtxInfof(ctx, "✅ reusing dify conversation: %s (section_id: %d)",
				existingInfo.AppConversationID, existingInfo.LastSectionID)
		} else {
			// section 变化了，需要清除旧会话，创建新会话
			logs.CtxInfof(ctx, "🔄 section changed (old: %d, new: %d), clearing old dify conversation",
				existingInfo.LastSectionID, *exeCfg.SectionID)
		}
	}

	if canReuse {
		return existingInfo.AppConversationID, nil
	}

	// 3. Dify 不需要主动创建会话，第一次请求时传空字符串即可
	// 会话 ID 会从流式响应中提取并保存
	logs.CtxInfof(ctx, "🆕 will create new dify conversation in first request")
	return "", nil
}

// saveConversationID 从 Dify 响应中保存会话 ID
func (d *DifyAgentChatModel) saveConversationID(ctx context.Context, conversationID string) error {
	if conversationID == "" {
		return nil
	}

	exeCfg := GetExecuteConfigFromContext(ctx)
	if exeCfg == nil {
		return fmt.Errorf("ExecuteConfig not found in context")
	}

	// 获取当前 sectionID
	sectionID := int64(0)
	if exeCfg.SectionID != nil {
		sectionID = *exeCfg.SectionID
		logs.CtxInfof(ctx, "DEBUG: got section_id from ExecuteConfig: %d", sectionID)
	} else {
		logs.CtxWarnf(ctx, "DEBUG: ExecuteConfig.SectionID is nil!")
	}

	// 保存到 ExecuteConfig 内存
	exeCfg.SetHiAgentConversationInfo(d.agent.AgentID, &workflowModel.HiAgentConversationInfo{
		AppConversationID: conversationID,
		LastSectionID:     sectionID,
	})
	logs.CtxInfof(ctx, "💾 saved dify conversation to memory: agent=%s, conv_id=%s, section_id=%d",
		d.agent.AgentID, conversationID, sectionID)

	// 异步保存到数据库
	go func() {
		bgCtx := context.Background()
		if err := saveDifyConversationToDatabase(bgCtx, exeCfg.ConversationID, d.agent.AgentID, conversationID, sectionID); err != nil {
			logs.CtxErrorf(bgCtx, "❌ failed to save dify conversation to DB: %v", err)
		} else {
			logs.CtxInfof(bgCtx, "✅ successfully saved dify conversation to DB")
		}
	}()

	return nil
}

// saveDifyConversationToDatabase 保存 Dify 会话 ID 到数据库
func saveDifyConversationToDatabase(ctx context.Context, conversationIDPtr *int64, agentID, appConversationID string, sectionID int64) error {
	if conversationIDPtr == nil {
		return fmt.Errorf("conversation_id is nil")
	}

	conversationID := *conversationIDPtr

	logs.CtxInfof(ctx, "💾 saving dify conversation to DB: conversation_id=%d, agent=%s, app_conv_id=%s, section_id=%d",
		conversationID, agentID, appConversationID, sectionID)

	// 1. 获取当前 conversation 记录
	conv, err := conversation.DefaultSVC().GetByID(ctx, conversationID)
	if err != nil {
		return fmt.Errorf("failed to get conversation: %w", err)
	}

	// 2. 解析 ext 字段
	ext := make(map[string]interface{})
	if conv.Ext != "" {
		if err := sonic.UnmarshalString(conv.Ext, &ext); err != nil {
			return fmt.Errorf("failed to unmarshal ext: %w", err)
		}
	}

	// 3. 更新 hiagent_conversations 部分（复用同一结构）
	var hiagentConvs map[string]interface{}
	if existing, ok := ext["hiagent_conversations"].(map[string]interface{}); ok {
		hiagentConvs = existing
	} else {
		hiagentConvs = make(map[string]interface{})
	}

	// 使用新的标准结构
	hiagentConvs[agentID] = map[string]interface{}{
		"app_conversation_id": appConversationID,
		"last_section_id":     sectionID,
	}
	ext["hiagent_conversations"] = hiagentConvs

	logs.CtxInfof(ctx, "DEBUG: prepared ext data: %+v", ext)

	// 4. 序列化并保存
	extStr, err := sonic.MarshalString(ext)
	if err != nil {
		return fmt.Errorf("failed to marshal ext: %w", err)
	}

	logs.CtxInfof(ctx, "DEBUG: marshaled ext string: %s", extStr)

	return conversation.DefaultSVC().UpdateExt(ctx, conversationID, extStr)
}

// ============ 核心方法 2: Dify API 调用 ============

// DifyChatRequest Dify 聊天请求
type DifyChatRequest struct {
	Query          string                 `json:"query"`
	Inputs         map[string]interface{} `json:"inputs"`
	ResponseMode   string                 `json:"response_mode"` // streaming 或 blocking
	ConversationID string                 `json:"conversation_id,omitempty"`
	User           string                 `json:"user"`
}

// DifyStreamEvent Dify 流式事件
type DifyStreamEvent struct {
	Event          string                 `json:"event"`
	ConversationID string                 `json:"conversation_id,omitempty"`
	MessageID      string                 `json:"message_id,omitempty"`
	Answer         string                 `json:"answer,omitempty"`
	CreatedAt      int64                  `json:"created_at,omitempty"`
	Metadata       map[string]interface{} `json:"metadata,omitempty"`
}

// ============ 核心方法 3: Stream 实现（重点） ============

// Stream 流式生成
func (d *DifyAgentChatModel) Stream(ctx context.Context, input []*schema.Message, opts ...model.Option) (*schema.StreamReader[*schema.Message], error) {
	// 1. 获取现有会话 ID（可能为空）
	conversationID, err := d.ensureConversation(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to ensure conversation: %w", err)
	}

	// 2. 提取用户消息
	userMessage := extractUserMessage(input)
	if userMessage == "" {
		return nil, fmt.Errorf("no user message found in input")
	}

	logs.CtxInfof(ctx, "🚀 calling dify stream API: conv_id=%s, message=%s", conversationID, userMessage)

	// 3. 构造请求
	reqBody := DifyChatRequest{
		Query:          userMessage,
		Inputs:         make(map[string]interface{}),
		ResponseMode:   "streaming",
		ConversationID: conversationID,
		User:           "user-123", // TODO: 从 context 获取真实用户 ID
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// 4. 发送 HTTP 请求
	req, err := http.NewRequestWithContext(ctx, "POST", d.agent.APIEndpoint, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+d.agent.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := d.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, fmt.Errorf("dify API error: status=%d, body=%s", resp.StatusCode, string(body))
	}

	// 5. 创建流式 reader
	sr, sw := schema.Pipe[*schema.Message](100)

	logs.CtxInfof(ctx, "✅ Created dify stream pipe, starting parser goroutine...")

	// 启动协程解析流
	go d.parseDifyStream(ctx, resp, sw, conversationID)

	return sr, nil
}

// parseDifyStream 解析 Dify 的 SSE 流
func (d *DifyAgentChatModel) parseDifyStream(ctx context.Context, resp *http.Response, sw *schema.StreamWriter[*schema.Message], existingConvID string) {
	defer func() {
		logs.CtxInfof(ctx, "DEBUG: parseDifyStream defer - closing body and sw")
		resp.Body.Close()
		sw.Close()
		logs.CtxInfof(ctx, "DEBUG: parseDifyStream defer - closed")
	}()

	logs.CtxInfof(ctx, "DEBUG: Dify parser goroutine started, beginning to read stream...")

	scanner := bufio.NewScanner(resp.Body)
	var fullAnswer strings.Builder
	convIDSaved := false

	for scanner.Scan() {
		line := scanner.Text()

		// SSE 格式：data: {...}
		if !strings.HasPrefix(line, "data: ") {
			continue
		}

		dataStr := strings.TrimPrefix(line, "data: ")
		dataStr = strings.TrimSpace(dataStr)

		if dataStr == "" {
			continue
		}

		// 解析 JSON
		var event DifyStreamEvent
		if err := json.Unmarshal([]byte(dataStr), &event); err != nil {
			logs.CtxWarnf(ctx, "failed to unmarshal dify event: %v, data: %s", err, dataStr)
			continue
		}

		// 保存 conversation_id（只保存一次）
		if !convIDSaved && event.ConversationID != "" {
			logs.CtxInfof(ctx, "📝 extracted conversation_id from dify stream: %s", event.ConversationID)
			if err := d.saveConversationID(ctx, event.ConversationID); err != nil {
				logs.CtxErrorf(ctx, "failed to save conversation_id: %v", err)
			}
			convIDSaved = true
		}

		// 处理不同的事件类型
		switch event.Event {
		case "message":
			// 流式文本片段
			if event.Answer != "" {
				fullAnswer.WriteString(event.Answer)
				msg := &schema.Message{
					Role:    schema.Assistant,
					Content: event.Answer,
				}
				if !sw.Send(msg, nil) {
					logs.CtxWarnf(ctx, "dify send message returned false (may be race condition)")
				}
			}

		case "message_end":
			// 消息结束
			logs.CtxInfof(ctx, "✅ dify stream completed, full answer length: %d", fullAnswer.Len())
			return

		case "error":
			// 错误事件
			logs.CtxErrorf(ctx, "dify error event: %+v", event)
			return

		default:
			// 其他事件类型，跳过
			logs.CtxInfof(ctx, "dify event: %s", event.Event)
		}
	}

	if err := scanner.Err(); err != nil {
		logs.CtxErrorf(ctx, "dify scanner error: %v", err)
	}
}

// ============ 核心方法 4: Generate 实现（非流式） ============

// Generate 同步生成（将流式结果聚合）
func (d *DifyAgentChatModel) Generate(ctx context.Context, input []*schema.Message, opts ...model.Option) (*schema.Message, error) {
	// 使用 Stream 并聚合结果
	streamReader, err := d.Stream(ctx, input, opts...)
	if err != nil {
		return nil, err
	}
	defer streamReader.Close()

	var fullContent strings.Builder
	for {
		msg, err := streamReader.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		if msg.Content != "" {
			fullContent.WriteString(msg.Content)
		}
	}

	return &schema.Message{
		Role:    schema.Assistant,
		Content: fullContent.String(),
	}, nil
}

// BindTools 绑定工具（Dify 智能体自带工具，不需要外部绑定）
func (d *DifyAgentChatModel) BindTools(tools []*schema.ToolInfo) error {
	// Dify 智能体内部管理工具，无需绑定
	return nil
}

// ============ 辅助函数 ============

// extractUserMessage 从消息列表中提取用户消息
func extractUserMessage(messages []*schema.Message) string {
	if len(messages) == 0 {
		return ""
	}

	// 取最后一条用户消息
	for i := len(messages) - 1; i >= 0; i-- {
		if messages[i].Role == schema.User {
			return messages[i].Content
		}
	}

	return ""
}
