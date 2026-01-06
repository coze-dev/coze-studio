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

package entity

import (
	model "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
)

type Message = model.Message

type ListMeta struct {
	ConversationID int64                `json:"conversation_id"`
	RunID          []*int64             `json:"run_id"`
	UserID         string               `json:"user_id"`
	AgentID        int64                `json:"agent_id"`
	OrderBy        *string              `json:"order_by"`
	Limit          int                  `json:"limit"`
	Cursor         int64                `json:"cursor"`    // message id
	Direction      ScrollPageDirection  `json:"direction"` //  "prev" "Next"
	MessageType    []*model.MessageType `json:"message_type"`
}

type ListResult struct {
	Messages   []*Message          `json:"messages"`
	PrevCursor int64               `json:"prev_cursor"`
	NextCursor int64               `json:"next_cursor"`
	HasMore    bool                `json:"has_more"`
	Direction  ScrollPageDirection `json:"direction"`
}

type GetByRunIDsRequest struct {
	ConversationID int64   `json:"conversation_id"`
	RunID          []int64 `json:"run_id"`
}

type DeleteMeta struct {
	ConversationID *int64  `json:"conversation_id"`
	MessageIDs     []int64 `json:"message_ids"`
	RunIDs         []int64 `json:"run_ids"`
}

type BrokenMeta struct {
	ID       int64  `json:"id"`
	Position *int32 `json:"position"`
}
