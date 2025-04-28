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

func (sa *SingleAgentDraftDAO) Create(ctx context.Context, creatorID int64, draft *entity.SingleAgent) (draftID int64, err error) {
	id, err := sa.IDGen.GenID(ctx)
	if err != nil {
		return 0, errorx.WrapByCode(err, errno.ErrIDGenFailCode, errorx.KV("msg", "CreatePromptResource"))
	}

	po := sa.singleAgentDraftDo2Po(draft)

	po.AgentID = id
	po.DeveloperID = creatorID

	err = sa.dbQuery.SingleAgentDraft.WithContext(ctx).Create(po)
	if err != nil {
		return 0, errorx.WrapByCode(err, errno.ErrCreateSingleAgentCode)
	}

	return id, nil
}

func (sa *SingleAgentDraftDAO) GetAgentDraft(ctx context.Context, agentID int64) (*entity.SingleAgent, error) {
	singleAgentDAOModel := sa.dbQuery.SingleAgentDraft
	singleAgent, err := sa.dbQuery.SingleAgentDraft.Where(singleAgentDAOModel.AgentID.Eq(agentID)).First()
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrGetSingleAgentCode)
	}

	do := sa.singleAgentDraftPo2Do(singleAgent)

	return do, nil
}

func (sa *SingleAgentDraftDAO) MGetAgentDraft(ctx context.Context, agentIDs []int64) ([]*entity.SingleAgent, error) {
	sam := sa.dbQuery.SingleAgentDraft
	singleAgents, err := sam.WithContext(ctx).Where(sam.AgentID.In(agentIDs...)).Find()
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrGetSingleAgentCode)
	}

	dos := make([]*entity.SingleAgent, 0, len(singleAgents))
	for _, singleAgent := range singleAgents {
		dos = append(dos, sa.singleAgentDraftPo2Do(singleAgent))
	}

	return dos, nil
}

func (sa *SingleAgentDraftDAO) UpdateSingleAgentDraft(ctx context.Context, agentInfo *entity.SingleAgent) (err error) {
	po := sa.singleAgentDraftDo2Po(agentInfo)
	singleAgentDAOModel := sa.dbQuery.SingleAgentDraft
	_, err = singleAgentDAOModel.Where(singleAgentDAOModel.AgentID.Eq(agentInfo.AgentID)).Updates(po)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrUpdateSingleAgentCode)
	}

	return nil
}

func (sa *SingleAgentDraftDAO) Delete(ctx context.Context, spaceID, agentID int64) (err error) {
	po := sa.dbQuery.SingleAgentDraft
	_, err = po.WithContext(ctx).Where(po.AgentID.Eq(agentID), po.SpaceID.Eq(spaceID)).Delete()
	return err
}

func (sa *SingleAgentDraftDAO) singleAgentDraftPo2Do(po *model.SingleAgentDraft) *entity.SingleAgent {
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

func (sa *SingleAgentDraftDAO) singleAgentDraftDo2Po(do *entity.SingleAgent) *model.SingleAgentDraft {
	return &model.SingleAgentDraft{
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
