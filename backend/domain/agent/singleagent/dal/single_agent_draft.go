package dal

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type SingleAgentDraftDAO struct {
	IDGen   idgen.IDGenerator
	dbQuery *query.Query
}

func (sa *SingleAgentDraftDAO) Create(ctx context.Context, creatorID int64, draft *model.SingleAgentDraft) (draftID int64, err error) {
	id, err := sa.IDGen.GenID(ctx)
	if err != nil {
		return 0, errorx.WrapByCode(err, errno.ErrIDGenFailCode, errorx.KV("msg", "CreatePromptResource"))
	}

	draft.AgentID = id
	draft.DeveloperID = creatorID

	err = sa.dbQuery.SingleAgentDraft.WithContext(ctx).Create(draft)
	if err != nil {
		return 0, errorx.WrapByCode(err, errno.ErrCreateSingleAgentCode)
	}

	return id, nil
}

func (sa *SingleAgentDraftDAO) GetAgentDraft(ctx context.Context, agentID int64) (*model.SingleAgentDraft, error) {
	singleAgentDAOModel := sa.dbQuery.SingleAgentDraft
	singleAgent, err := sa.dbQuery.SingleAgentDraft.Where(singleAgentDAOModel.AgentID.Eq(agentID)).First()
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrGetSingleAgentCode)
	}

	return singleAgent, nil
}

func (sa *SingleAgentDraftDAO) MGetAgentDraft(ctx context.Context, agentIDs []int64) ([]*model.SingleAgentDraft, error) {
	sam := sa.dbQuery.SingleAgentDraft
	singleAgents, err := sam.WithContext(ctx).Where(sam.AgentID.In(agentIDs...)).Find()
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrGetSingleAgentCode)
	}
	return singleAgents, nil
}

func (sa *SingleAgentDraftDAO) UpdateSingleAgentDraft(ctx context.Context, agentInfo *model.SingleAgentDraft) (err error) {
	singleAgentDAOModel := sa.dbQuery.SingleAgentDraft
	_, err = singleAgentDAOModel.Where(singleAgentDAOModel.AgentID.Eq(agentInfo.AgentID)).Updates(agentInfo)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrUpdateSingleAgentCode)
	}

	return nil
}

func (sa *SingleAgentDraftDAO) Delete(ctx context.Context, agentID int64) (err error) {
	// TODO(@fanlv:) implement me
	panic("implement me")
}

func (sa *SingleAgentDraftDAO) Duplicate(ctx context.Context, agentID int64) (draft *entity.SingleAgent, err error) {
	// TODO implement me
	panic("implement me")
}
