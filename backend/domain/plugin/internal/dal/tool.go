package dal

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gen/field"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

func NewToolDAO(db *gorm.DB, idGen idgen.IDGenerator) *ToolDAO {
	return &ToolDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type ToolDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

type toolPO model.Tool

func (t toolPO) ToDO() *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:              t.ID,
		PluginID:        t.PluginID,
		CreatedAt:       t.CreatedAt,
		UpdatedAt:       t.UpdatedAt,
		Version:         &t.Version,
		SubURL:          &t.SubURL,
		Method:          ptr.Of(t.Method),
		Operation:       t.Operation,
		ActivatedStatus: ptr.Of(plugin.ActivatedStatus(t.ActivatedStatus)),
	}
}

func (t *ToolDAO) getSelected(opt *ToolSelectedOption) (selected []field.Expr) {
	if opt == nil {
		return selected
	}

	table := t.query.Tool

	if opt.ToolID {
		selected = append(selected, table.ID)
	}

	return selected
}

func (t *ToolDAO) Get(ctx context.Context, toolID int64) (tool *entity.ToolInfo, exist bool, err error) {
	table := t.query.Tool
	tl, err := table.WithContext(ctx).
		Where(table.ID.Eq(toolID)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	tool = toolPO(*tl).ToDO()

	return tool, true, nil
}

func (t *ToolDAO) CheckToolExist(ctx context.Context, toolID int64) (exist bool, err error) {
	table := t.query.Tool
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

func (t *ToolDAO) CheckToolsExist(ctx context.Context, toolIDs []int64) (exist map[int64]bool, err error) {
	table := t.query.Tool
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

func (t *ToolDAO) MGet(ctx context.Context, toolIDs []int64, opt *ToolSelectedOption) (tools []*entity.ToolInfo, err error) {
	tools = make([]*entity.ToolInfo, 0, len(toolIDs))

	table := t.query.Tool
	chunks := slices.Chunks(toolIDs, 20)

	for _, chunk := range chunks {
		tls, err := table.WithContext(ctx).
			Select(t.getSelected(opt)...).
			Where(table.ID.In(chunk...)).
			Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			tools = append(tools, toolPO(*tl).ToDO())
		}
	}

	return tools, nil
}

func (t *ToolDAO) GetAll(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error) {
	const limit = 20
	table := t.query.Tool
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
			tools = append(tools, toolPO(*tl).ToDO())
		}

		if len(tls) < limit {
			break
		}

		cursor = tls[len(tls)-1].ID
	}

	return tools, nil
}

func (t *ToolDAO) BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, tools []*entity.ToolInfo) (err error) {
	tls := make([]*model.Tool, 0, len(tools))

	for _, tool := range tools {
		if tool.GetVersion() == "" {
			return fmt.Errorf("invalid tool version")
		}
		tls = append(tls, &model.Tool{
			ID:              tool.ID,
			PluginID:        tool.PluginID,
			Version:         tool.GetVersion(),
			SubURL:          tool.GetSubURL(),
			Method:          tool.GetMethod(),
			ActivatedStatus: int32(tool.GetActivatedStatus()),
			Operation:       tool.Operation,
		})
	}

	err = tx.Tool.WithContext(ctx).CreateInBatches(tls, 10)
	if err != nil {
		return err
	}

	return nil
}

func (t *ToolDAO) DeleteAllWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error) {
	const limit = 20
	table := tx.Tool
	for {
		info, err := table.WithContext(ctx).
			Where(table.PluginID.Eq(pluginID)).
			Limit(limit).
			Delete()
		if err != nil {
			return err
		}
		if info.RowsAffected < limit {
			break
		}
	}

	return nil
}
