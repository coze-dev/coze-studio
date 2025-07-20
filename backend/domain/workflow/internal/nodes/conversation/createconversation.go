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

type CreateConversationConfig struct {
	Creator conversation.ConversationManager
}

type CreateConversation struct {
	config *CreateConversationConfig
}

func NewCreateConversation(ctx context.Context, cfg *CreateConversationConfig) (*CreateConversation, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}
	if cfg.Creator == nil {
		return nil, errors.New("creator is required")
	}
	return &CreateConversation{
		config: cfg,
	}, nil
}

func (c *CreateConversation) Create(ctx context.Context, input map[string]any) (map[string]any, error) {
	name, ok := nodes.TakeMapValue(input, compose.FieldPath{"ConversationName"})
	if !ok {
		return nil, errors.New("input map should contains 'ConversationName' key ")
	}
	response, err := c.config.Creator.CreateConversation(ctx, &conversation.CreateConversationRequest{
		Name: name.(string),
	})
	if err != nil {
		return nil, err
	}
	return response.Result, nil

}
