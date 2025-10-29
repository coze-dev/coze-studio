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
	"context"
	"errors"
	"fmt"
	"io"
	"strconv"

	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/singleagent"
	crossagent "github.com/coze-dev/coze-studio/backend/crossdomain/contract/agent"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

// SingleAgentChatModel 实现 Eino 的 BaseChatModel 接口，用于调用内部 SingleAgent 智能体
// 不同于 HiAgent/Dify 的 HTTP 调用，SingleAgent 使用内部 Agent Flow 直接执行
type SingleAgentChatModel struct {
	agentID int64
	spaceID int64
	name    string
}

// NewSingleAgentChatModel 创建 SingleAgent 模型实例
func NewSingleAgentChatModel(ctx context.Context, agentID string, spaceID int64, name string) (model.BaseChatModel, error) {
	// 解析 agentID（大整数字符串）
	agentIDInt, err := strconv.ParseInt(agentID, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid agent_id format: %s, error: %w", agentID, err)
	}

	logs.CtxInfof(ctx, "✅ Created SingleAgent model: agent_id=%d, space_id=%d, name=%s",
		agentIDInt, spaceID, name)

	return &SingleAgentChatModel{
		agentID: agentIDInt,
		spaceID: spaceID,
		name:    name,
	}, nil
}

// Generate - 同步调用 SingleAgent（blocking模式）
func (s *SingleAgentChatModel) Generate(ctx context.Context, messages []*schema.Message, opts ...model.Option) (*schema.Message, error) {
	// 提取用户消息对象
	userMessage := extractLastUserMessageObject(messages)
	if userMessage == nil {
		return nil, fmt.Errorf("no user message found in input")
	}

	logs.CtxInfof(ctx, "🚀 SingleAgent Generate (blocking): agent_id=%d, query=%s", s.agentID, userMessage.Content)

	// 调用流式方法并收集完整响应
	streamReader, err := s.Stream(ctx, messages, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to start stream: %w", err)
	}

	// 收集所有流式响应块
	var fullContent string
	var lastMessage *schema.Message

	for {
		chunk, recvErr := streamReader.Recv()
		if recvErr != nil {
			if errors.Is(recvErr, io.EOF) {
				break
			}
			return nil, fmt.Errorf("error receiving stream chunk: %w", recvErr)
		}

		// 拼接内容
		if chunk != nil {
			fullContent += chunk.Content
			lastMessage = chunk
		}
	}

	// 返回完整消息
	if lastMessage == nil {
		return &schema.Message{
			Role:    schema.Assistant,
			Content: fullContent,
		}, nil
	}

	// 更新为完整内容
	lastMessage.Content = fullContent
	return lastMessage, nil
}

// Stream - 流式调用 SingleAgent
func (s *SingleAgentChatModel) Stream(ctx context.Context, messages []*schema.Message, opts ...model.Option) (*schema.StreamReader[*schema.Message], error) {
	// 提取用户输入消息对象
	userMessage := extractLastUserMessageObject(messages)
	if userMessage == nil {
		return nil, fmt.Errorf("no user message found in input")
	}

	logs.CtxInfof(ctx, "🚀 SingleAgent Stream: agent_id=%d, query=%s", s.agentID, userMessage.Content)

	// 创建 StreamReader
	sr, sw := schema.Pipe[*schema.Message](10)

	// 启动流式处理协程
	go s.handleStream(ctx, messages, userMessage, sw)

	return sr, nil
}

// handleStream - 处理流式响应
func (s *SingleAgentChatModel) handleStream(ctx context.Context, messages []*schema.Message, userMessage *schema.Message, sw *schema.StreamWriter[*schema.Message]) {
	defer func() {
		logs.CtxInfof(ctx, "SingleAgent stream handler closing for agent_id=%d", s.agentID)
		sw.Close()
	}()

	logs.CtxInfof(ctx, "SingleAgent stream handler started: agent_id=%d", s.agentID)

	// 1. 从 context 获取 ExecuteConfig（包含会话 ID 等信息）
	executeConfig := GetExecuteConfigFromContext(ctx)
	if executeConfig == nil {
		logs.CtxWarnf(ctx, "⚠️ No ExecuteConfig in context, SingleAgent will run without conversation context")
	} else {
		logs.CtxInfof(ctx, "✅ Found ExecuteConfig: conversation_id=%v, agent_id=%v",
			executeConfig.ConversationID, executeConfig.AgentID)
	}

	// 2. 构建历史消息（除了最后一条用户消息）
	historyMessages := extractHistoryMessages(messages)
	logs.CtxInfof(ctx, "📜 History messages count: %d", len(historyMessages))

	// 3. 构建 AgentRuntime 参数
	agentRuntime := &crossagent.AgentRuntime{
		AgentID:      s.agentID,
		UserID:       "", // TODO: 从 context 或 ExecuteConfig 获取
		SpaceID:      s.spaceID,
		IsDraft:      false, // 默认使用已发布版本
		AgentVersion: "",    // 空字符串表示使用最新版本
		ConnectorID:  0,     // Workflow 中调用不需要 ConnectorID
		Input:        userMessage,
		HistoryMsg:   historyMessages,
		ResumeInfo:   nil, // 暂不支持中断恢复
		PreRetrieveTools: nil, // 暂不支持预检索工具
	}

	// 4. 调用 SingleAgent 服务执行
	agentEventStream, err := crossagent.DefaultSVC().StreamExecute(ctx, agentRuntime)
	if err != nil {
		logs.CtxErrorf(ctx, "❌ Failed to execute SingleAgent: %v", err)
		sw.Send(nil, fmt.Errorf("failed to execute SingleAgent: %w", err))
		return
	}

	logs.CtxInfof(ctx, "✅ SingleAgent execution started, processing events...")

	// 5. 处理事件流并转换为 schema.Message
	s.processAgentEvents(ctx, agentEventStream, sw)

	logs.CtxInfof(ctx, "✅ SingleAgent stream completed for agent_id=%d", s.agentID)
}

// processAgentEvents - 处理 AgentEvent 流并转换为 schema.Message
func (s *SingleAgentChatModel) processAgentEvents(ctx context.Context, eventStream *schema.StreamReader[*singleagent.AgentEvent], sw *schema.StreamWriter[*schema.Message]) {
	for {
		// 接收事件
		event, err := eventStream.Recv()
		if err != nil {
			if errors.Is(err, io.EOF) {
				logs.CtxInfof(ctx, "✅ AgentEvent stream ended normally")
				return
			}
			logs.CtxErrorf(ctx, "❌ Error receiving AgentEvent: %v", err)
			sw.Send(nil, fmt.Errorf("error receiving AgentEvent: %w", err))
			return
		}

		// 根据事件类型处理
		switch event.EventType {
		case singleagent.EventTypeOfChatModelAnswer:
			// LLM 流式回答 - 直接转发流
			s.handleChatModelAnswer(ctx, event.ChatModelAnswer, sw)

		case singleagent.EventTypeOfToolsMessage:
			// 工具执行结果 - 记录日志但不发送给用户（隐藏实现细节）
			logs.CtxInfof(ctx, "🔧 Tool execution completed: %d messages", len(event.ToolsMessage))

		case singleagent.EventTypeOfFuncCall:
			// 函数调用 - 记录日志
			if event.FuncCall != nil {
				logs.CtxInfof(ctx, "📞 Function called: %s", event.FuncCall.Content)
			}

		case singleagent.EventTypeOfKnowledge:
			// 知识库检索结果 - 记录日志
			logs.CtxInfof(ctx, "📚 Knowledge retrieved: %d documents", len(event.Knowledge))

		case singleagent.EventTypeOfToolMidAnswer:
			// 工具中间答案流 - 可选择性转发
			logs.CtxInfof(ctx, "🔄 Tool mid-answer stream received")

		case singleagent.EventTypeOfInterrupt:
			// 中断事件 - 需要用户交互（暂不支持）
			logs.CtxWarnf(ctx, "⚠️ Interrupt event received (not supported in Workflow context)")

		default:
			logs.CtxWarnf(ctx, "⚠️ Unknown event type: %s", event.EventType)
		}
	}
}

// handleChatModelAnswer - 处理 LLM 流式回答
func (s *SingleAgentChatModel) handleChatModelAnswer(ctx context.Context, answerStream *schema.StreamReader[*schema.Message], sw *schema.StreamWriter[*schema.Message]) {
	if answerStream == nil {
		return
	}

	for {
		chunk, err := answerStream.Recv()
		if err != nil {
			if errors.Is(err, io.EOF) {
				return
			}
			logs.CtxErrorf(ctx, "❌ Error receiving chat model answer: %v", err)
			return
		}

		// 转发消息块
		sw.Send(chunk, nil)
	}
}

// IsCallbacksEnabled - 实现接口方法
func (s *SingleAgentChatModel) IsCallbacksEnabled() bool {
	return false // SingleAgent 暂不支持回调
}

// GetType - 返回模型类型
func (s *SingleAgentChatModel) GetType() string {
	return "singleagent"
}

// extractLastUserMessageObject - 提取用户消息对象（保留完整的 schema.Message）
func extractLastUserMessageObject(messages []*schema.Message) *schema.Message {
	if len(messages) == 0 {
		return nil
	}

	// 从后往前查找最后一条用户消息
	for i := len(messages) - 1; i >= 0; i-- {
		if messages[i].Role == schema.User {
			return messages[i]
		}
	}

	return nil
}

// extractHistoryMessages - 提取历史消息（除了最后一条用户消息）
func extractHistoryMessages(messages []*schema.Message) []*schema.Message {
	if len(messages) <= 1 {
		return nil
	}

	// 返回除最后一条消息外的所有消息
	return messages[:len(messages)-1]
}
