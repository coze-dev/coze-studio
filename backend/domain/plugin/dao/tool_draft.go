package dao

import (
	"context"
	"sync"

	"gorm.io/gen/field"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/plugin_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/convertor"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

var (
	toolDraftOnce      sync.Once
	singletonToolDraft *toolDraftImpl
)

type ToolDraftDAO interface {
	Create(ctx context.Context, tool *entity.ToolInfo) (toolID int64, err error)
	Get(ctx context.Context, toolID int64) (tool *entity.ToolInfo, err error)
	GetAll(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error)
	Update(ctx context.Context, tool *entity.ToolInfo) (err error)

	List(ctx context.Context, pluginID int64, pageInfo entity.PageInfo) (tools []*entity.ToolInfo, total int64, err error)

	DeleteAllWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error)
	ResetAllDebugStatusWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error)
}

func NewToolDraftDAO(db *gorm.DB, idGen idgen.IDGenerator) ToolDraftDAO {
	toolDraftOnce.Do(func() {
		singletonToolDraft = &toolDraftImpl{
			IDGen: idGen,
			query: query.Use(db),
		}
	})

	return singletonToolDraft
}

type toolDraftImpl struct {
	IDGen idgen.IDGenerator
	query *query.Query
}

func (t *toolDraftImpl) Create(ctx context.Context, tool *entity.ToolInfo) (toolID int64, err error) {
	id, err := t.IDGen.GenID(ctx)
	if err != nil {
		return 0, err
	}

	tl := &model.ToolDraft{
		ID:             id,
		PluginID:       tool.PluginID,
		RequestParams:  tool.ReqParameters,
		ResponseParams: tool.RespParameters,
	}

	if tool.Name != nil {
		tl.Name = *tool.Name
	}

	if tool.Desc != nil {
		tl.Desc = *tool.Desc
	}

	if tool.IconURI != nil {
		tl.IconURI = *tool.IconURI
	}

	if tool.SubURLPath != nil {
		tl.SubURLPath = *tool.SubURLPath
	}

	if tool.ReqMethod != nil {
		tl.RequestMethod = int32(*tool.ReqMethod)
	}

	if tool.ActivatedStatus != nil {
		tl.ActivatedStatus = 0
		if !*tool.ActivatedStatus {
			tl.ActivatedStatus = 1
		}
	}

	if tool.DebugStatus != nil {
		tl.DebugStatus = int32(*tool.DebugStatus)
	}

	return tl.ID, nil
}

func (t *toolDraftImpl) Get(ctx context.Context, toolID int64) (tool *entity.ToolInfo, err error) {
	table := t.query.ToolDraft

	tl, err := table.WithContext(ctx).
		Where(table.ID.Eq(toolID)).
		First()
	if err != nil {
		return nil, err
	}

	return convertor.ToolDraftToDO(tl), nil
}

func (t *toolDraftImpl) GetAll(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error) {
	table := t.query.ToolDraft
	cursor := int64(0)

	const limit = 20

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

		tools = make([]*entity.ToolInfo, 0, len(tls))
		for _, tl := range tls {
			tools = append(tools, convertor.ToolDraftToDO(tl))
		}

		if len(tls) < limit {
			break
		}

		cursor = tls[len(tls)-1].ID
	}

	return tools, nil
}

func (t *toolDraftImpl) Update(ctx context.Context, tool *entity.ToolInfo) (err error) {
	table := t.query.ToolDraft

	m := &model.ToolDraft{
		RequestParams:  tool.ReqParameters,
		ResponseParams: tool.RespParameters,
	}

	if tool.Name != nil {
		m.Name = *tool.Name
	}

	if tool.Desc != nil {
		m.Desc = *tool.Desc
	}

	if tool.IconURI != nil {
		m.IconURI = *tool.IconURI
	}

	if tool.SubURLPath != nil {
		m.SubURLPath = *tool.SubURLPath
	}

	if tool.ReqMethod != nil {
		m.RequestMethod = int32(*tool.ReqMethod)
	}

	if tool.ActivatedStatus != nil {
		m.ActivatedStatus = 0
		if !*tool.ActivatedStatus {
			m.ActivatedStatus = 1
		}
	}

	if tool.DebugStatus != nil {
		m.DebugStatus = int32(*tool.DebugStatus)
	}

	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(tool.ID)).
		Updates(m)
	if err != nil {
		return err
	}

	return nil
}

func (t *toolDraftImpl) List(ctx context.Context, pluginID int64, pageInfo entity.PageInfo) (tools []*entity.ToolInfo, total int64, err error) {
	table := t.query.ToolDraft

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
		tools = append(tools, convertor.ToolDraftToDO(tl))
	}

	return tools, total, nil
}

func (t *toolDraftImpl) DeleteAllWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error) {
	const limit = 20

	table := tx.ToolDraft

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

func (t *toolDraftImpl) ResetAllDebugStatusWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error) {
	table := tx.ToolDraft

	const limit = 50
	var lastID int64 = 0

	for {
		var toolIDs []int64
		err = table.WithContext(ctx).
			Where(table.PluginID.Eq(pluginID)).
			Where(table.ID.Gt(lastID)).
			Order(table.ID.Asc()).
			Limit(limit).
			Pluck(table.ID, &toolIDs)
		if err != nil {
			return err
		}

		if len(toolIDs) == 0 {
			break
		}

		_, err = table.WithContext(ctx).
			Where(table.ID.In(toolIDs...)).
			Updates(&model.ToolDraft{
				DebugStatus: int32(plugin_common.APIDebugStatus_DebugWaiting),
			})
		if err != nil {
			return err
		}

		lastID = toolIDs[len(toolIDs)-1]

		if len(toolIDs) < limit {
			break
		}
	}

	return nil
}
