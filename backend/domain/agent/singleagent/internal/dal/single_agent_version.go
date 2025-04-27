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

type SingleAgentVersionDAO struct {
	IDGen   idgen.IDGenerator
	dbQuery *query.Query
}

func (sa *SingleAgentVersionDAO) GetAgentLatest(ctx context.Context, agentID int64) (*entity.SingleAgent, error) {
	singleAgentDAOModel := sa.dbQuery.SingleAgentVersion
	singleAgent, err := singleAgentDAOModel.
		Where(singleAgentDAOModel.AgentID.Eq(agentID)).
		Order(singleAgentDAOModel.CreatedAt.Desc()).
		First()
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrGetSingleAgentCode)
	}

	do := sa.singleAgentVersionPo2Do(singleAgent)

	return do, nil
}

func (sa *SingleAgentVersionDAO) GetAgentVersion(ctx context.Context, agentID int64, version string) (*entity.SingleAgent, error) {
	singleAgentDAOModel := sa.dbQuery.SingleAgentVersion
	singleAgent, err := singleAgentDAOModel.
		Where(singleAgentDAOModel.AgentID.Eq(agentID), singleAgentDAOModel.Version.Eq(version)).
		First()
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrGetSingleAgentCode)
	}

	do := sa.singleAgentVersionPo2Do(singleAgent)

	return do, nil
}

func (sa *SingleAgentVersionDAO) singleAgentVersionPo2Do(po *model.SingleAgentVersion) *entity.SingleAgent {
	return &entity.SingleAgent{
		ID:              po.ID,
		AgentID:         po.AgentID,
		DeveloperID:     po.DeveloperID,
		SpaceID:         po.SpaceID,
		Name:            po.Name,
		Desc:            po.Desc,
		IconURI:         po.IconURI,
		CreatedAt:       po.CreatedAt,
		UpdatedAt:       po.UpdatedAt,
		DeletedAt:       po.DeletedAt,
		ModelInfo:       po.ModelInfo,
		OnboardingInfo:  po.OnboardingInfo,
		Prompt:          po.Prompt,
		Plugin:          po.Plugin,
		Knowledge:       po.Knowledge,
		Workflow:        po.Workflow,
		SuggestReply:    po.SuggestReply,
		JumpConfig:      po.JumpConfig,
		VariablesMetaID: po.VariablesMetaID,
	}
}
