package dal

import (
	"context"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/model"
)

func (sa *SingleAgentDAO) Create(ctx context.Context, draft *model.SingleAgentDraft) (draftID int64, err error) {
	id, err := sa.IDGen.GenID(ctx)
	if err != nil {
		return 0, err
	}
	now := time.Now().Unix()

	draft.AgentID = id
	draft.CreatedAt = now
	draft.UpdatedAt = now

	promptModel := query.SingleAgentDraft
	err = promptModel.WithContext(ctx).Create(draft)
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (sa *SingleAgentDAO) Update(ctx context.Context, draft *model.SingleAgentDraft) (err error) {
	// TODO(@fanlv:) implement me
	panic("implement me")
}

func (sa *SingleAgentDAO) Delete(ctx context.Context, agentID int64) (err error) {
	// TODO(@fanlv:) implement me
	panic("implement me")
}

func (sa *SingleAgentDAO) Duplicate(ctx context.Context, agentID int64) (draft *entity.SingleAgent, err error) {
	// TODO implement me
	panic("implement me")
}
