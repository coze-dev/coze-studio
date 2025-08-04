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

package dal

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/developer_api"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func makeAgentDisplayInfoKey(userID, agentID int64) string {
	return fmt.Sprintf("agent_display_info:%d:%d", userID, agentID)
}

func (sa *SingleAgentDraftDAO) UpdateDisplayInfo(ctx context.Context, userID int64, e *entity.AgentDraftDisplayInfo) error {
	data, err := json.Marshal(e)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrAgentSetDraftBotDisplayInfo)
	}

	key := makeAgentDisplayInfoKey(userID, e.AgentID)

	_, err = sa.cacheClient.Set(ctx, key, data, 0).Result()
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrAgentSetDraftBotDisplayInfo)
	}

	return nil
}

func (sa *SingleAgentDraftDAO) GetDisplayInfo(ctx context.Context, userID, agentID int64) (*entity.AgentDraftDisplayInfo, error) {
	key := makeAgentDisplayInfoKey(userID, agentID)
	data, err := sa.cacheClient.Get(ctx, key).Result()
	if errors.Is(err, cache.Nil) {
		tabStatusDefault := developer_api.TabStatus_Default
		return &entity.AgentDraftDisplayInfo{
			AgentID: agentID,
			DisplayInfo: &developer_api.DraftBotDisplayInfoData{
				TabDisplayInfo: &developer_api.TabDisplayItems{
					PluginTabStatus:           &tabStatusDefault,
					WorkflowTabStatus:         &tabStatusDefault,
					KnowledgeTabStatus:        &tabStatusDefault,
					DatabaseTabStatus:         &tabStatusDefault,
					VariableTabStatus:         &tabStatusDefault,
					OpeningDialogTabStatus:    &tabStatusDefault,
					ScheduledTaskTabStatus:    &tabStatusDefault,
					SuggestionTabStatus:       &tabStatusDefault,
					TtsTabStatus:              &tabStatusDefault,
					FileboxTabStatus:          &tabStatusDefault,
					LongTermMemoryTabStatus:   &tabStatusDefault,
					AnswerActionTabStatus:     &tabStatusDefault,
					ImageflowTabStatus:        &tabStatusDefault,
					BackgroundImageTabStatus:  &tabStatusDefault,
					ShortcutTabStatus:         &tabStatusDefault,
					KnowledgeTableTabStatus:   &tabStatusDefault,
					KnowledgeTextTabStatus:    &tabStatusDefault,
					KnowledgePhotoTabStatus:   &tabStatusDefault,
					HookInfoTabStatus:         &tabStatusDefault,
					DefaultUserInputTabStatus: &tabStatusDefault,
				},
			},
		}, nil
	}
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrAgentGetDraftBotDisplayInfoNotFound)
	}

	e := &entity.AgentDraftDisplayInfo{}
	err = json.Unmarshal([]byte(data), e)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrAgentGetDraftBotDisplayInfoNotFound)
	}

	return e, nil
}
