package dal

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gen/field"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
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

func (t *ToolDAO) Get(ctx context.Context, vTool entity.VersionTool) (tool *entity.ToolInfo, exist bool, err error) {
	table := t.query.Tool
	tl, err := table.WithContext(ctx).
		Where(table.ID.Eq(vTool.ToolID)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	tool = model.ToolToDO(tl)

	return tool, true, nil
}

func (t *ToolDAO) MGet(ctx context.Context, vTools []entity.VersionTool) (tools []*entity.ToolInfo, err error) {
	tools = make([]*entity.ToolInfo, 0, len(vTools))

	table := t.query.Tool
	chunks := slices.Chunks(vTools, 20)

	for _, chunk := range chunks {
		toolIDs := make([]int64, 0, len(chunk))
		for _, id := range chunk {
			toolIDs = append(toolIDs, id.ToolID)
		}

		tls, err := table.WithContext(ctx).
			Where(table.ID.In(toolIDs...)).
			Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			tools = append(tools, model.ToolToDO(tl))
		}
	}

	return tools, nil
}

func (t *ToolDAO) List(ctx context.Context, pluginID int64, pageInfo entity.PageInfo) (tools []*entity.ToolInfo, total int64, err error) {
	if pageInfo.SortBy == nil || pageInfo.OrderByACS == nil {
		return nil, 0, fmt.Errorf("sortBy or orderByACS is empty")
	}

	var orderExpr field.Expr
	table := t.query.Tool

	switch *pageInfo.SortBy {
	case entity.SortByCreatedAt:
		if *pageInfo.OrderByACS {
			orderExpr = table.CreatedAt.Asc()
		} else {
			orderExpr = table.CreatedAt.Desc()
		}
	case entity.SortByUpdatedAt:
		if *pageInfo.OrderByACS {
			orderExpr = table.UpdatedAt.Asc()
		} else {
			orderExpr = table.UpdatedAt.Desc()
		}
	default:
		return nil, 0, fmt.Errorf("invalid sortBy '%v'", *pageInfo.SortBy)
	}

	tls, total, err := table.WithContext(ctx).
		Where(table.PluginID.Eq(pluginID)).
		Order(orderExpr).
		FindByPage(pageInfo.Page, pageInfo.Size)
	if err != nil {
		return nil, 0, err
	}

	tools = make([]*entity.ToolInfo, 0, pageInfo.Size)
	for _, tl := range tls {
		tools = append(tools, model.ToolToDO(tl))
	}

	return tools, total, nil
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
			tools = append(tools, model.ToolToDO(tl))
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
		if info.RowsAffected == 0 || info.RowsAffected < limit {
			break
		}
	}

	return nil
}
