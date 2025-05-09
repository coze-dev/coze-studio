package dal

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/redis/go-redis/v9"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

func makeAgentDisplayInfoKey(userID, agentID int64) string {
	return fmt.Sprintf("agent_display_info:%d:%d", userID, agentID)
}

func (sa *SingleAgentDraftDAO) UpdateDisplayInfo(ctx context.Context, userID int64, e *entity.AgentDraftDisplayInfo) error {
	data, err := json.Marshal(e)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrorSetDraftBotDisplayInfo)
	}

	key := makeAgentDisplayInfoKey(userID, e.AgentID)

	_, err = sa.cacheClient.Set(ctx, key, data, 0).Result()
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrorSetDraftBotDisplayInfo)
	}

	return nil
}

func (sa *SingleAgentDraftDAO) GetDisplayInfo(ctx context.Context, userID, agentID int64) (*entity.AgentDraftDisplayInfo, error) {
	key := makeAgentDisplayInfoKey(userID, agentID)
	data, err := sa.cacheClient.Get(ctx, key).Result()
	if errors.Is(err, redis.Nil) {
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
		return nil, errorx.WrapByCode(err, errno.ErrorGetDraftBotDisplayInfoNotFound)
	}

	e := &entity.AgentDraftDisplayInfo{}
	err = json.Unmarshal([]byte(data), e)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrorGetDraftBotDisplayInfoNotFound)
	}

	return e, nil
}
