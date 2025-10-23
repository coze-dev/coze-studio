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
package internal

import (
	"context"

	crossagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent"
	singleagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func getAgentHistoryRounds(agentInfo *singleagent.SingleAgent) int32 {
	var conversationTurns int32 = entity.ConversationTurnsDefault
	if agentInfo != nil && agentInfo.ModelInfo != nil && agentInfo.ModelInfo.ShortMemoryPolicy != nil && ptr.From(agentInfo.ModelInfo.ShortMemoryPolicy.HistoryRound) > 0 {
		conversationTurns = ptr.From(agentInfo.ModelInfo.ShortMemoryPolicy.HistoryRound)
	}
	return conversationTurns
}

func getAgentInfo(ctx context.Context, agentID int64, isDraft bool, connID int64) (*singleagent.SingleAgent, error) {
	agentInfo, err := crossagent.DefaultSVC().ObtainAgentByIdentity(ctx, &singleagent.AgentIdentity{
		AgentID:     agentID,
		IsDraft:     isDraft,
		ConnectorID: connID,
	})
	if err != nil {
		return nil, err
	}
	if agentInfo == nil {
		return nil, errorx.New(errno.ErrAgentNotExists)
	}

	return agentInfo, nil
}
