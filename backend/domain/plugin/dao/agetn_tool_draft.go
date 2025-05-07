package dao

import (
	"context"
	"errors"
	"sync"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type AgentToolDraftDAO interface {
	Create(ctx context.Context, identity entity.AgentToolIdentity, tool *entity.ToolInfo) (err error)
	Get(ctx context.Context, identity entity.AgentToolIdentity) (tool *entity.ToolInfo, exist bool, err error)
	MGet(ctx context.Context, agentID, spaceID int64, toolIDs []int64) (tools []*entity.ToolInfo, err error)
	GetAll(ctx context.Context, agentID, spaceID int64) (tools []*entity.ToolInfo, err error)
	Delete(ctx context.Context, identity entity.AgentToolIdentity) (err error)
	Update(ctx context.Context, identity entity.AgentToolIdentity, tool *entity.ToolInfo) (err error)
}

var (
	agentToolDraftOnce      sync.Once
	singletonAgentDraftTool *agentToolDraftImpl
)

func NewAgentToolDraftDAO(db *gorm.DB, idGen idgen.IDGenerator) AgentToolDraftDAO {
	agentToolDraftOnce.Do(func() {
		singletonAgentDraftTool = &agentToolDraftImpl{
			IDGen: idGen,
			query: query.Use(db),
		}
	})

	return singletonAgentDraftTool
}

type agentToolDraftImpl struct {
	IDGen idgen.IDGenerator
	query *query.Query
}

func (at *agentToolDraftImpl) Create(ctx context.Context, identity entity.AgentToolIdentity, tool *entity.ToolInfo) (err error) {
	id, err := at.IDGen.GenID(ctx)
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

func (at *agentToolDraftImpl) Get(ctx context.Context, identity entity.AgentToolIdentity) (tool *entity.ToolInfo, exist bool, err error) {
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

func (at *agentToolDraftImpl) MGet(ctx context.Context, agentID, spaceID int64, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
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

func (at *agentToolDraftImpl) Delete(ctx context.Context, identity entity.AgentToolIdentity) (err error) {
	table := at.query.AgentToolDraft
	_, err = table.WithContext(ctx).
		Where(
			table.AgentID.Eq(identity.AgentID),
			table.SpaceID.Eq(identity.SpaceID),
			table.ToolID.Eq(identity.ToolID),
		).
		Delete()
	if err != nil {
		return err
	}

	return nil
}

func (at *agentToolDraftImpl) GetAll(ctx context.Context, agentID, spaceID int64) (tools []*entity.ToolInfo, err error) {
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

func (at *agentToolDraftImpl) Update(ctx context.Context, identity entity.AgentToolIdentity, tool *entity.ToolInfo) (err error) {
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
