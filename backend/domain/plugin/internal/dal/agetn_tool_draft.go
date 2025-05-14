package dal

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

func NewAgentToolDraftDAO(db *gorm.DB, idGen idgen.IDGenerator) *AgentToolDraftDAO {
	return &AgentToolDraftDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type AgentToolDraftDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

func (at *AgentToolDraftDAO) Create(ctx context.Context, identity entity.AgentToolIdentity, tool *entity.ToolInfo) (err error) {
	id, err := at.idGen.GenID(ctx)
	if err != nil {
		return err
	}

	tl := &model.AgentToolDraft{
		ID:          id,
		AgentID:     identity.AgentID,
		SpaceID:     identity.SpaceID,
		ToolID:      identity.ToolID,
		ToolVersion: tool.GetVersion(),
		Operation:   tool.Operation,
	}
	table := at.query.AgentToolDraft
	err = table.WithContext(ctx).Create(tl)
	if err != nil {
		return err
	}

	return nil
}

func (at *AgentToolDraftDAO) Get(ctx context.Context, identity entity.AgentToolIdentity) (tool *entity.ToolInfo, exist bool, err error) {
	table := at.query.AgentToolDraft
	tl, err := table.WithContext(ctx).
		Where(
			table.AgentID.Eq(identity.AgentID),
			table.SpaceID.Eq(identity.SpaceID),
			table.ToolID.Eq(identity.ToolID),
		).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	tool = model.AgentToolDraftToDO(tl)

	return tool, true, nil
}

func (at *AgentToolDraftDAO) MGet(ctx context.Context, agentID, spaceID int64, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
	tools = make([]*entity.ToolInfo, 0, len(toolIDs))

	table := at.query.AgentToolDraft
	chunks := slices.Chunks(toolIDs, 20)

	for _, chunk := range chunks {
		tls, err := table.WithContext(ctx).
			Where(
				table.AgentID.Eq(agentID),
				table.SpaceID.Eq(spaceID),
				table.ToolID.In(chunk...),
			).
			Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			tools = append(tools, model.AgentToolDraftToDO(tl))
		}
	}

	return tools, nil
}

func (at *AgentToolDraftDAO) GetAll(ctx context.Context, spaceID, agentID int64) (tools []*entity.ToolInfo, err error) {
	const limit = 20
	table := at.query.AgentToolDraft
	cursor := int64(0)

	for {
		tls, err := table.WithContext(ctx).
			Where(
				table.AgentID.Eq(agentID),
				table.SpaceID.Eq(spaceID),
				table.ID.Gt(cursor),
			).
			Order(table.ID.Asc()).
			Limit(limit).
			Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			tools = append(tools, model.AgentToolDraftToDO(tl))
		}

		if len(tls) < limit {
			break
		}

		cursor = tls[len(tls)-1].ID
	}

	return tools, nil
}

func (at *AgentToolDraftDAO) Update(ctx context.Context, identity entity.AgentToolIdentity, tool *entity.ToolInfo) (err error) {
	m := &model.AgentToolDraft{
		Operation: tool.Operation,
	}
	table := at.query.AgentToolDraft
	_, err = table.WithContext(ctx).
		Where(
			table.AgentID.Eq(identity.AgentID),
			table.SpaceID.Eq(identity.SpaceID),
			table.ToolID.Eq(identity.ToolID),
		).
		Updates(m)
	if err != nil {
		return err
	}

	return nil
}

func (at *AgentToolDraftDAO) BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, spaceID, agentID int64, tools []*entity.ToolInfo) (err error) {
	tls := make([]*model.AgentToolDraft, 0, len(tools))
	for _, tl := range tools {
		id, err := at.idGen.GenID(ctx)
		if err != nil {
			return err
		}
		m := &model.AgentToolDraft{
			ID:          id,
			AgentID:     agentID,
			SpaceID:     spaceID,
			ToolID:      tl.ID,
			ToolVersion: tl.GetVersion(),
			Operation:   tl.Operation,
		}
		tls = append(tls, m)
	}

	table := tx.AgentToolDraft
	err = table.WithContext(ctx).CreateInBatches(tls, 20)
	if err != nil {
		return err
	}

	return nil
}

func (at *AgentToolDraftDAO) DeleteAllWithTX(ctx context.Context, tx *query.QueryTx, spaceID, agentID int64) (err error) {
	const limit = 20
	table := tx.AgentToolDraft

	for {
		info, err := table.WithContext(ctx).
			Where(table.SpaceID.Eq(spaceID)).
			Where(table.AgentID.Eq(agentID)).
			Limit(limit).
			Delete()
		if err != nil {
			return err
		}

		if info.RowsAffected == 0 || info.RowsAffected < limit {
			break
		}
	}

	return nil
}
