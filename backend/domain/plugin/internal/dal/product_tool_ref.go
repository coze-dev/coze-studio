package dal

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

func NewToolProductRefDAO(db *gorm.DB, idGen idgen.IDGenerator) *ToolProductRefDAO {
	return &ToolProductRefDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type ToolProductRefDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

func (t *ToolProductRefDAO) Get(ctx context.Context, toolID int64) (tool *entity.ToolInfo, exist bool, err error) {
	table := t.query.ToolProductRef
	tl, err := table.WithContext(ctx).
		Where(table.ID.Eq(toolID)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	tool = model.ToolProductRefToDO(tl)

	return tool, true, nil
}

func (t *ToolProductRefDAO) CheckToolExist(ctx context.Context, toolID int64) (exist bool, err error) {
	table := t.query.ToolProductRef
	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(toolID)).
		Select(table.ID).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (t *ToolProductRefDAO) CheckToolsExist(ctx context.Context, toolIDs []int64) (exist map[int64]bool, err error) {
	table := t.query.ToolProductRef
	existTools, err := table.WithContext(ctx).
		Where(table.ID.In(toolIDs...)).
		Select(table.ID).
		Find()
	if err != nil {
		return nil, err
	}

	existToolIDs := make(map[int64]bool, len(toolIDs))
	for _, tl := range existTools {
		existToolIDs[tl.ID] = true
	}

	return existToolIDs, nil
}

func (t *ToolProductRefDAO) MGet(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
	tools = make([]*entity.ToolInfo, 0, len(toolIDs))

	table := t.query.ToolProductRef
	chunks := slices.Chunks(toolIDs, 20)

	for _, chunk := range chunks {
		tls, err := table.WithContext(ctx).
			Where(table.ID.In(chunk...)).
			Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			tools = append(tools, model.ToolProductRefToDO(tl))
		}
	}

	return tools, nil
}

func (t *ToolProductRefDAO) GetAll(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error) {
	const limit = 20
	table := t.query.ToolProductRef
	cursor := int64(0)

	for {
		tls, err := table.WithContext(ctx).
			Where(
				table.PluginID.Eq(pluginID),
				table.ID.Gt(cursor),
			).
			Order(table.ID.Asc()).
			Limit(limit).
			Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			tools = append(tools, model.ToolProductRefToDO(tl))
		}

		if len(tls) < limit {
			break
		}

		cursor = tls[len(tls)-1].ID
	}

	return tools, nil
}

func (t *ToolProductRefDAO) BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, tools []*entity.ToolInfo) (err error) {
	tls := make([]*model.ToolProductRef, 0, len(tools))

	for _, tool := range tools {
		if tool.GetVersion() == "" {
			return fmt.Errorf("invalid tool version")
		}

		toolID, err := t.idGen.GenID(ctx)
		if err != nil {
			return err
		}

		tls = append(tls, &model.ToolProductRef{
			ID:        toolID,
			PluginID:  tool.PluginID,
			Version:   tool.GetVersion(),
			SubURL:    tool.GetSubURL(),
			Method:    tool.GetMethod(),
			Operation: tool.Operation,
		})
	}

	err = tx.ToolProductRef.WithContext(ctx).CreateInBatches(tls, 10)
	if err != nil {
		return err
	}

	return nil
}

func (t *ToolProductRefDAO) DeleteAllWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error) {
	const limit = 20
	table := tx.ToolProductRef
	for {
		info, err := table.WithContext(ctx).
			Where(table.PluginID.Eq(pluginID)).
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
