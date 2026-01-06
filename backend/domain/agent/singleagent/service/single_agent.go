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

package singleagent

import (
	"context"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/playground"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
)

//go:generate mockgen -destination ../../../../internal/mock/domain/agent/singleagent/single_agent_mock.go --package singleagent -source single_agent.go
type SingleAgent interface {
	// draft agent
	CreateSingleAgentDraft(ctx context.Context, creatorID int64, draft *entity.SingleAgent) (agentID int64, err error)
	CreateSingleAgentDraftWithID(ctx context.Context, creatorID, agentID int64, draft *entity.SingleAgent) (int64, error)
	MGetSingleAgentDraft(ctx context.Context, agentIDs []int64) (agents []*entity.SingleAgent, err error)
	GetSingleAgentDraft(ctx context.Context, agentID int64) (agentInfo *entity.SingleAgent, err error)
	UpdateSingleAgentDraft(ctx context.Context, agentInfo *entity.SingleAgent) (err error)
	DeleteAgentDraft(ctx context.Context, spaceID, agentID int64) (err error)
	UpdateAgentDraftDisplayInfo(ctx context.Context, userID int64, e *entity.AgentDraftDisplayInfo) error
	GetAgentDraftDisplayInfo(ctx context.Context, userID, agentID int64) (*entity.AgentDraftDisplayInfo, error)

	// online agent
	CreateSingleAgent(ctx context.Context, connectorID int64, version string, e *entity.SingleAgent) (int64, error)
	DuplicateInMemory(ctx context.Context, req *entity.DuplicateInfo) (newAgent *entity.SingleAgent, err error)
	StreamExecute(ctx context.Context, req *entity.ExecuteRequest) (events *schema.StreamReader[*entity.AgentEvent], err error)
	GetSingleAgent(ctx context.Context, agentID int64, version string) (botInfo *entity.SingleAgent, err error)
	ListAgentPublishHistory(ctx context.Context, agentID int64, pageIndex, pageSize int32, connectorID *int64) ([]*entity.SingleAgentPublish, error)
	// ObtainAgentByIdentity support obtain agent by connectorID and agentID
	ObtainAgentByIdentity(ctx context.Context, identity *entity.AgentIdentity) (*entity.SingleAgent, error)

	GetAgentPopupCount(ctx context.Context, uid, agentID int64, agentPopupType playground.BotPopupType) (int64, error)
	IncrAgentPopupCount(ctx context.Context, uid, agentID int64, agentPopupType playground.BotPopupType) error

	// Publish
	GetPublishedTime(ctx context.Context, agentID int64) (int64, error)
	GetPublishedInfo(ctx context.Context, agentID int64) (*entity.PublishInfo, error)
	SavePublishRecord(ctx context.Context, p *entity.SingleAgentPublish, e *entity.SingleAgent) error
	GetPublishConnectorList(ctx context.Context, agentID int64) (*entity.PublishConnectorData, error)
}
