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

package model

import "github.com/coze-dev/coze-studio/backend/api/model/conversation/common"

type GetCurrent struct {
	UserID      int64        `json:"user_id"`
	Scene       common.Scene `json:"scene"`
	AgentID     int64        `json:"agent_id"`
	ConnectorID int64        `json:"connector_id"`
}

type Scene int32

const (
	SceneDefault           Scene = 0
	SceneExplore           Scene = 1
	SceneBotStore          Scene = 2
	SceneCozeHome          Scene = 3
	ScenePlayground        Scene = 4
	SceneEvaluation        Scene = 5
	SceneAgentAPP          Scene = 6
	ScenePromptOptimize    Scene = 7
	SceneGenerateAgentInfo Scene = 8
	SceneOpenApi           Scene = 9
)

type Conversation struct {
	ID          int64              `json:"id"`
	Name        string             `json:"name"`
	SectionID   int64              `json:"section_id"`
	AgentID     int64              `json:"agent_id"`
	ConnectorID int64              `json:"connector_id"`
	CreatorID   int64              `json:"creator_id"`
	Scene       common.Scene       `json:"scene"`
	Status      ConversationStatus `json:"status"`
	Ext         string             `json:"ext"`
	CreatedAt   int64              `json:"created_at"`
	UpdatedAt   int64              `json:"updated_at"`
}

type ConversationStatus int32

const (
	ConversationStatusNormal  ConversationStatus = 1
	ConversationStatusDeleted ConversationStatus = 2
)
