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
	"github.com/coze-dev/coze-studio/backend/api/model/conversation/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/conversation/model"
)

type Conversation = model.Conversation

type CreateMeta struct {
	Name        string       `json:"name"`
	AgentID     int64        `json:"agent_id"`
	UserID      int64        `json:"user_id"`
	ConnectorID int64        `json:"connector_id"`
	Scene       common.Scene `json:"scene"`
	Ext         string       `json:"ext"`
}

type NewConversationCtxRequest struct {
	ID int64 `json:"id"`
}

type NewConversationCtxResponse struct {
	ID        int64 `json:"id"`
	SectionID int64 `json:"section_id"`
}

type GetCurrent = model.GetCurrent

type ListMeta struct {
	UserID      int64        `json:"user_id"`
	ConnectorID int64        `json:"connector_id"`
	Scene       common.Scene `json:"scene"`
	AgentID     int64        `json:"agent_id"`
	Limit       int          `json:"limit"`
	Page        int          `json:"page"`
	OrderBy     *string      `json:"order_by"`
}

type UpdateMeta struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}
