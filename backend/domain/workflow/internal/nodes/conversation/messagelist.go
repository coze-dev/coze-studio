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
	"encoding/json"
	"errors"

	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/conversation"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
)

type MessageListConfig struct {
	Lister conversation.ConversationManager
}
type MessageList struct {
	config *MessageListConfig
}

type Param struct {
	ConversationName string
	Limit            *int
	BeforeID         *string
	AfterID          *string
}

func NewMessageList(ctx context.Context, cfg *MessageListConfig) (*MessageList, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}

	if cfg.Lister == nil {
		return nil, errors.New("lister is required")
	}

	return &MessageList{
		config: cfg,
	}, nil

}

func (m *MessageList) List(ctx context.Context, input map[string]any) (map[string]any, error) {
	param := &Param{}
	name, ok := nodes.TakeMapValue(input, compose.FieldPath{"ConversationName"})
	if !ok {
		return nil, errors.New("ConversationName is required")
	}
	param.ConversationName = name.(string)
	limit, ok := nodes.TakeMapValue(input, compose.FieldPath{"Limit"})
	if ok {
		limit := limit.(int)
		param.Limit = &limit
	}
	beforeID, ok := nodes.TakeMapValue(input, compose.FieldPath{"BeforeID"})
	if ok {
		beforeID := beforeID.(string)
		param.BeforeID = &beforeID
	}
	afterID, ok := nodes.TakeMapValue(input, compose.FieldPath{"AfterID"})
	if ok {
		afterID := afterID.(string)
		param.BeforeID = &afterID
	}
	r, err := m.config.Lister.MessageList(ctx, &conversation.ListMessageRequest{
		ConversationName: param.ConversationName,
		Limit:            param.Limit,
		BeforeID:         param.BeforeID,
		AfterID:          param.AfterID,
	})
	if err != nil {
		return nil, err
	}

	result := make(map[string]any)
	objects := make([]any, 0, len(r.Messages))
	for _, msg := range r.Messages {
		object := make(map[string]any)
		bs, _ := json.Marshal(msg)
		err := json.Unmarshal(bs, &object)
		if err != nil {
			return nil, err
		}
		objects = append(objects, object)
	}

	result["messageList"] = objects
	result["firstId"] = r.FirstID
	result["hasMore"] = r.HasMore
	return result, nil

}
