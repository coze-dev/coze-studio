package dal

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type SingleAgentVersionDAO struct {
	IDGen   idgen.IDGenerator
	dbQuery *query.Query
}

func (sa *SingleAgentVersionDAO) GetAgentLatest(ctx context.Context, agentID int64) (*model.SingleAgentVersion, error) {
	singleAgentDAOModel := sa.dbQuery.SingleAgentVersion
	singleAgent, err := singleAgentDAOModel.
		Where(singleAgentDAOModel.AgentID.Eq(agentID)).
		Order(singleAgentDAOModel.CreatedAt.Desc()).
		First()
	if err != nil {
		return nil, errorx.New(errno.ErrGetSingleAgentCode)
	}

	return singleAgent, nil
}

func (sa *SingleAgentVersionDAO) GetAgentVersion(ctx context.Context, agentID int64, version string) (*model.SingleAgentVersion, error) {
	singleAgentDAOModel := sa.dbQuery.SingleAgentVersion
	singleAgent, err := singleAgentDAOModel.
		Where(singleAgentDAOModel.AgentID.Eq(agentID), singleAgentDAOModel.Version.Eq(version)).
		First()
	if err != nil {
		return nil, errorx.New(errno.ErrGetSingleAgentCode)
	}

	return singleAgent, nil
}
