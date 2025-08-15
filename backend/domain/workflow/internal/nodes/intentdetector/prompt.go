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

package intentdetector

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/conversation"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	nodesconversation "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/conversation"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type historyChatTemplate struct {
	basePrompt         prompt.ChatTemplate
	chatHistorySetting *vo.ChatHistorySetting
}

func newHistoryChatTemplate(basePrompt prompt.ChatTemplate, chatHistorySetting *vo.ChatHistorySetting) prompt.ChatTemplate {
	return &historyChatTemplate{
		basePrompt:         basePrompt,
		chatHistorySetting: chatHistorySetting,
	}
}

func (t *historyChatTemplate) Format(ctx context.Context, vs map[string]any, opts ...prompt.Option) ([]*schema.Message, error) {
	baseMessages, err := t.basePrompt.Format(ctx, vs, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to format base prompt: %w", err)
	}
	if len(baseMessages) == 0 {
		return nil, fmt.Errorf("base prompt returned no messages")
	}

	if t.chatHistorySetting == nil || !t.chatHistorySetting.EnableChatHistory {
		return baseMessages, nil
	}

	exeCtx := execute.GetExeCtx(ctx)
	if exeCtx == nil {
		logs.CtxWarnf(ctx, "execute context is nil, skipping chat history")
		return baseMessages, nil
	}

	if exeCtx.ExeCfg.WorkflowMode != workflow.WorkflowMode_ChatFlow {
		return baseMessages, nil
	}

	historyFromCtx, ok := ctxcache.Get[[]*conversation.Message](ctx, chatHistoryKey)
	var messages []*conversation.Message
	if ok {
		messages = historyFromCtx
	}

	if len(messages) == 0 {
		logs.CtxWarnf(ctx, "conversation history is empty")
		return baseMessages, nil
	}

	historyMessages := make([]*schema.Message, 0, len(messages))
	for _, msg := range messages {
		schemaMsg, err := nodesconversation.ConvertMessageToSchema(ctx, msg)
		if err != nil {
			logs.CtxWarnf(ctx, "failed to convert history message, skipping: %v", err)
			continue
		}
		historyMessages = append(historyMessages, schemaMsg)
	}

	if len(historyMessages) == 0 {
		return baseMessages, nil
	}

	finalMessages := make([]*schema.Message, 0, len(baseMessages)+len(historyMessages))
	finalMessages = append(finalMessages, baseMessages[0]) // System prompt
	finalMessages = append(finalMessages, historyMessages...)
	if len(baseMessages) > 1 {
		finalMessages = append(finalMessages, baseMessages[1:]...) // User prompt and any others
	}

	return finalMessages, nil
}
