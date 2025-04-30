package dao

import (
	"context"
	"errors"
	"sync"

	"gorm.io/gen"
	"gorm.io/gen/field"
	"gorm.io/gorm"

	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

var (
	toolDraftOnce      sync.Once
	singletonToolDraft *toolDraftImpl
)

type ToolDraftDAO interface {
	Create(ctx context.Context, tool *entity.ToolInfo) (toolID int64, err error)
	Update(ctx context.Context, tool *entity.ToolInfo) (err error)
	Get(ctx context.Context, toolID int64) (tool *entity.ToolInfo, exist bool, err error)
	GetAll(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error)
	Delete(ctx context.Context, toolID int64) (err error)
	GetWithAPI(ctx context.Context, pluginID int64, api entity.UniqueToolAPI) (tool *entity.ToolInfo, exist bool, err error)
	MGetWithAPIs(ctx context.Context, pluginID int64, apis []entity.UniqueToolAPI) (tools map[entity.UniqueToolAPI]*entity.ToolInfo, err error)

	List(ctx context.Context, pluginID int64, pageInfo entity.PageInfo) (tools []*entity.ToolInfo, total int64, err error)

	BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, tools []*entity.ToolInfo) (toolIDs []int64, err error)
	UpdateWithTX(ctx context.Context, tx *query.QueryTx, tool *entity.ToolInfo) (err error)
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

	err = t.query.ToolDraft.WithContext(ctx).Create(&model.ToolDraft{
		ID:              id,
		PluginID:        tool.PluginID,
		SubURL:          tool.GetSubURL(),
		Method:          tool.GetMethod(),
		ActivatedStatus: int32(tool.GetActivatedStatus()),
		DebugStatus:     int32(tool.GetDebugStatus()),
		Operation:       tool.Operation,
	})
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (t *toolDraftImpl) Get(ctx context.Context, toolID int64) (tool *entity.ToolInfo, exist bool, err error) {
	table := t.query.ToolDraft
	tl, err := table.WithContext(ctx).
		Where(table.ID.Eq(toolID)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	tool = model.ToolDraftToDO(tl)

	return tool, true, nil
}

func (t *toolDraftImpl) GetWithAPI(ctx context.Context, pluginID int64, api entity.UniqueToolAPI) (tool *entity.ToolInfo, exist bool, err error) {
	table := t.query.ToolDraft
	tl, err := table.WithContext(ctx).
		Where(
			table.PluginID.Eq(pluginID),
			table.SubURL.Eq(api.SubURL),
			table.Method.Eq(api.Method),
		).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	tool = model.ToolDraftToDO(tl)

	return tool, true, nil
}

func (t *toolDraftImpl) MGetWithAPIs(ctx context.Context, pluginID int64, apis []entity.UniqueToolAPI) (tools map[entity.UniqueToolAPI]*entity.ToolInfo, err error) {
	tools = make(map[entity.UniqueToolAPI]*entity.ToolInfo, len(apis))

	table := t.query.ToolDraft
	chunks := slices.Chunks(apis, 50)
	for _, chunk := range chunks {
		orConds := make([]gen.Condition, 0, len(chunk))
		for _, api := range chunk {
			orConds = append(orConds, table.Where(
				table.SubURL.Eq(api.SubURL),
				table.Method.Eq(api.Method),
			))
		}

		conds := append([]gen.Condition{table.PluginID.Eq(pluginID)}, table.Or(orConds...))
		tls, err := table.WithContext(ctx).Where(conds...).Find()
		if err != nil {
			return nil, err
		}
		for _, tl := range tls {
			api := entity.UniqueToolAPI{
				SubURL: tl.SubURL,
				Method: tl.Method,
			}
			tools[api] = model.ToolDraftToDO(tl)
		}
	}

	return tools, nil
}

func (t *toolDraftImpl) GetAll(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error) {
	const limit = 20
	table := t.query.ToolDraft
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
			tools = append(tools, model.ToolDraftToDO(tl))
		}

		if len(tls) < limit {
			break
		}

		cursor = tls[len(tls)-1].ID
	}

	return tools, nil
}

func (t *toolDraftImpl) Delete(ctx context.Context, toolID int64) (err error) {
	table := t.query.ToolDraft
	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(toolID)).
		Delete()
	if err != nil {
		return err
	}

	return nil
}

func (t *toolDraftImpl) Update(ctx context.Context, tool *entity.ToolInfo) (err error) {
	table := t.query.ToolDraft
	m := getToolDraftUpdateModel(tool)

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
		tools = append(tools, model.ToolDraftToDO(tl))
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

func (t *toolDraftImpl) BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, tools []*entity.ToolInfo) (toolIDs []int64, err error) {
	toolIDs = make([]int64, 0, len(tools))
	tls := make([]*model.ToolDraft, 0, len(tools))

	for _, tool := range tools {
		id, err := t.IDGen.GenID(ctx)
		if err != nil {
			return nil, err
		}

		toolIDs = append(toolIDs, id)

		tls = append(tls, &model.ToolDraft{
			ID:              id,
			PluginID:        tool.PluginID,
			SubURL:          tool.GetSubURL(),
			Method:          tool.GetMethod(),
			ActivatedStatus: int32(tool.GetActivatedStatus()),
			DebugStatus:     int32(tool.GetDebugStatus()),
			Operation:       tool.Operation,
		})
	}

	table := tx.ToolDraft
	err = table.CreateInBatches(tls, 10)
	if err != nil {
		return nil, err
	}

	return toolIDs, nil
}

func (t *toolDraftImpl) UpdateWithTX(ctx context.Context, tx *query.QueryTx, tool *entity.ToolInfo) (err error) {
	table := tx.ToolDraft
	m := getToolDraftUpdateModel(tool)

	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(tool.ID)).
		Updates(m)
	if err != nil {
		return err
	}

	return nil
}

func (t *toolDraftImpl) ResetAllDebugStatusWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error) {
	const limit = 50
	table := tx.ToolDraft
	lastID := int64(0)

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
				DebugStatus: int32(common.APIDebugStatus_DebugWaiting),
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

func getToolDraftUpdateModel(tool *entity.ToolInfo) *model.ToolDraft {
	m := &model.ToolDraft{
		Operation: tool.Operation,
	}
	if tool.SubURL != nil {
		m.SubURL = *tool.SubURL
	}
	if tool.Method != nil {
		m.Method = *tool.Method
	}
	if tool.ActivatedStatus != nil {
		m.ActivatedStatus = int32(*tool.ActivatedStatus)
	}
	if tool.DebugStatus != nil {
		m.DebugStatus = int32(*tool.DebugStatus)
	}
	if tool.Operation != nil {
		m.Operation = tool.Operation
	}
	return m
}
