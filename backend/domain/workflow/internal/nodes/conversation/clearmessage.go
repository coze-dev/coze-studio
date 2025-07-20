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

package conversation

import (
	"context"
	"errors"

	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/conversation"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
)

type ClearMessageConfig struct {
	Clearer conversation.ConversationManager
}

type MessageClear struct {
	config *ClearMessageConfig
}

func NewClearMessage(ctx context.Context, cfg *ClearMessageConfig) (*MessageClear, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}
	if cfg.Clearer == nil {
		return nil, errors.New("clearer is required")
	}

	return &MessageClear{
		config: cfg,
	}, nil
}

func (c *MessageClear) Clear(ctx context.Context, input map[string]any) (map[string]any, error) {
	name, ok := nodes.TakeMapValue(input, compose.FieldPath{"ConversationName"})
	if !ok {
		return nil, errors.New("input map should contains 'ConversationName' key ")
	}
	response, err := c.config.Clearer.ClearMessage(ctx, &conversation.ClearMessageRequest{
		Name: name.(string),
	})
	if err != nil {
		return nil, err
	}
	return map[string]any{
		"isSuccess": response.IsSuccess,
	}, nil
}
