package dal

import (
	"context"
	"errors"

	"gorm.io/gorm"

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

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

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
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
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

func (sa *SingleAgentVersionDAO) singleAgentVersionDo2Po(do *entity.SingleAgent) *model.SingleAgentVersion {
	return &model.SingleAgentVersion{
		ID:              do.ID,
		AgentID:         do.AgentID,
		DeveloperID:     do.DeveloperID,
		SpaceID:         do.SpaceID,
		Name:            do.Name,
		Desc:            do.Desc,
		IconURI:         do.IconURI,
		CreatedAt:       do.CreatedAt,
		UpdatedAt:       do.UpdatedAt,
		DeletedAt:       do.DeletedAt,
		ModelInfo:       do.ModelInfo,
		OnboardingInfo:  do.OnboardingInfo,
		Prompt:          do.Prompt,
		Plugin:          do.Plugin,
		Knowledge:       do.Knowledge,
		Workflow:        do.Workflow,
		SuggestReply:    do.SuggestReply,
		JumpConfig:      do.JumpConfig,
		VariablesMetaID: do.VariablesMetaID,
	}
}

func (sa *SingleAgentVersionDAO) PublishDraftAgent(ctx context.Context, version string, connectorIDs []int64, e *entity.SingleAgent) error {
	ids, err := sa.IDGen.GenMultiIDs(ctx, len(connectorIDs))
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrIDGenFailCode, errorx.KV("msg", "PublishDraftAgent"))
	}

	pos := make([]*model.SingleAgentVersion, 0, len(connectorIDs))
	for idx, connectorID := range connectorIDs {
		po := sa.singleAgentVersionDo2Po(e)
		po.ConnectorID = connectorID
		po.ID = ids[idx]
		po.Version = version
	}

	table := sa.dbQuery.SingleAgentVersion
	err = table.CreateInBatches(pos, 100)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrPublishSingleAgentCode)
	}

	return err
}
