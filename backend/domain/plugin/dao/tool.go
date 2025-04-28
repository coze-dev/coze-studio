package dao

import (
	"context"
	"fmt"
	"sync"

	"gorm.io/gen/field"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/convertor"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

var (
	toolOnce      sync.Once
	singletonTool *toolImpl
)

type ToolDAO interface {
	Get(ctx context.Context, vTool entity.VersionTool) (*entity.ToolInfo, error)
	MGet(ctx context.Context, vTools []entity.VersionTool) (tools []*entity.ToolInfo, err error)
	List(ctx context.Context, pluginID int64, pageInfo entity.PageInfo) (tools []*entity.ToolInfo, total int64, err error)

	BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, tools []*entity.ToolInfo) (err error)
	DeleteAllWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error)
}

func NewToolDAO(db *gorm.DB, idGen idgen.IDGenerator) ToolDAO {
	toolOnce.Do(func() {
		singletonTool = &toolImpl{
			IDGen: idGen,
			query: query.Use(db),
		}
	})

	return singletonTool
}

type toolImpl struct {
	IDGen idgen.IDGenerator
	query *query.Query
}

func (t *toolImpl) Get(ctx context.Context, vTool entity.VersionTool) (*entity.ToolInfo, error) {
	table := t.query.Tool
	tl, err := table.WithContext(ctx).
		Where(table.ID.Eq(vTool.ToolID)).
		First()
	if err != nil {
		return nil, err
	}

	return convertor.ToolToDO(tl), nil
}

func (t *toolImpl) MGet(ctx context.Context, vTools []entity.VersionTool) (tools []*entity.ToolInfo, err error) {
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
			tools = append(tools, convertor.ToolToDO(tl))
		}
	}

	return tools, nil
}

func (t *toolImpl) List(ctx context.Context, pluginID int64, pageInfo entity.PageInfo) (tools []*entity.ToolInfo, total int64, err error) {
	table := t.query.Tool

	getOrderExpr := func() field.Expr {
		switch pageInfo.SortBy {
		case entity.SortByCreatedAt:
			if pageInfo.OrderByACS {
				return table.CreatedAt.Asc()
			}
			return table.CreatedAt.Desc()
		case entity.SortByUpdatedAt:
			if pageInfo.OrderByACS {
				return table.UpdatedAt.Asc()
			}
			return table.UpdatedAt.Desc()
		default:
			return table.UpdatedAt.Desc()
		}
	}

	tls, total, err := table.WithContext(ctx).
		Where(table.PluginID.Eq(pluginID)).
		Order(getOrderExpr()).
		FindByPage(pageInfo.Page, pageInfo.Size)
	if err != nil {
		return nil, 0, err
	}

	tools = make([]*entity.ToolInfo, 0, len(tls))
	for _, tl := range tls {
		tools = append(tools, convertor.ToolToDO(tl))
	}

	return tools, total, nil
}

func (t *toolImpl) BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, tools []*entity.ToolInfo) (err error) {
	tls := make([]*model.Tool, 0, len(tools))

	for _, tool := range tools {
		if tool.GetVersion() == "" {
			return fmt.Errorf("invalid tool version")
		}
		tls = append(tls, &model.Tool{
			ID:              tool.ID,
			PluginID:        tool.PluginID,
			Name:            tool.GetName(),
			Desc:            tool.GetDesc(),
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

func (t *toolImpl) DeleteAllWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error) {
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
