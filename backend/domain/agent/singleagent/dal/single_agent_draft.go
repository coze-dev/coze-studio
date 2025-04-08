package dal

import (
	"context"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/query"
)

func (sa *SingleAgentDAO) Create(ctx context.Context, creatorID int64, draft *model.SingleAgentDraft) (draftID int64, err error) {
	id, err := sa.IDGen.GenID(ctx)
	if err != nil {
		return 0, err
	}
	now := time.Now().Unix()

	draft.AgentID = id
	draft.DeveloperID = creatorID
	draft.CreatedAt = now
	draft.UpdatedAt = now

	singleAgentDAOModel := query.SingleAgentDraft
	err = singleAgentDAOModel.WithContext(ctx).Create(draft)
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (sa *SingleAgentDAO) GetAgentDraft(ctx context.Context, botID int64) (*model.SingleAgentDraft, error) {
	singleAgentDAOModel := query.SingleAgentDraft
	singleAgent, err := singleAgentDAOModel.Where(singleAgentDAOModel.AgentID.Eq(botID)).First()
	if err != nil {
		return nil, err
	}

	return singleAgent, nil
}

func (sa *SingleAgentDAO) UpdateSingleAgentDraft(ctx context.Context, agentInfo *model.SingleAgentDraft) (err error) {
	singleAgentDAOModel := query.SingleAgentDraft
	_, err = singleAgentDAOModel.Where(singleAgentDAOModel.AgentID.Eq(agentInfo.AgentID)).Updates(agentInfo)
	if err != nil {
		return err
	}

	return nil
}

func (sa *SingleAgentDAO) Delete(ctx context.Context, agentID int64) (err error) {
	// TODO(@fanlv:) implement me
	panic("implement me")
}

func (sa *SingleAgentDAO) Duplicate(ctx context.Context, agentID int64) (draft *entity.SingleAgent, err error) {
	// TODO implement me
	panic("implement me")
}
