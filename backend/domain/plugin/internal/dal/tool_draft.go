package dal

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"gorm.io/gen/field"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

func NewToolDraftDAO(db *gorm.DB, idGen idgen.IDGenerator) *ToolDraftDAO {
	return &ToolDraftDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type ToolDraftDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

type toolDraftPO model.ToolDraft

func (t toolDraftPO) ToDO() *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:              t.ID,
		PluginID:        t.PluginID,
		CreatedAt:       t.CreatedAt,
		UpdatedAt:       t.UpdatedAt,
		SubURL:          &t.SubURL,
		Method:          ptr.Of(t.Method),
		Operation:       t.Operation,
		DebugStatus:     ptr.Of(common.APIDebugStatus(t.DebugStatus)),
		ActivatedStatus: ptr.Of(plugin.ActivatedStatus(t.ActivatedStatus)),
	}
}

func (p *ToolDraftDAO) getSelected(opt *ToolSelectedOption) (selected []field.Expr) {
	if opt == nil {
		return selected
	}

	table := p.query.ToolDraft

	if opt.ToolID {
		selected = append(selected, table.ID)
	}
	if opt.ActivatedStatus {
		selected = append(selected, table.ActivatedStatus)
	}
	if opt.DebugStatus {
		selected = append(selected, table.DebugStatus)
	}

	return selected
}

func (t *ToolDraftDAO) Create(ctx context.Context, tool *entity.ToolInfo) (toolID int64, err error) {
	id, err := t.idGen.GenID(ctx)
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

func (t *ToolDraftDAO) Get(ctx context.Context, toolID int64) (tool *entity.ToolInfo, exist bool, err error) {
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

	tool = toolDraftPO(*tl).ToDO()

	return tool, true, nil
}

func (t *ToolDraftDAO) MGet(ctx context.Context, toolIDs []int64, opt *ToolSelectedOption) (tools []*entity.ToolInfo, err error) {
	tools = make([]*entity.ToolInfo, 0, len(toolIDs))

	table := t.query.ToolDraft
	chunks := slices.Chunks(toolIDs, 10)

	for _, chunk := range chunks {
		tls, err := table.WithContext(ctx).
			Select(t.getSelected(opt)...).
			Where(table.ID.In(chunk...)).
			Find()
		if err != nil {
			return nil, err
		}
		for _, tl := range tls {
			tools = append(tools, toolDraftPO(*tl).ToDO())
		}
	}

	return tools, nil
}

func (t *ToolDraftDAO) GetWithAPI(ctx context.Context, pluginID int64, api entity.UniqueToolAPI) (tool *entity.ToolInfo, exist bool, err error) {
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

	tool = toolDraftPO(*tl).ToDO()

	return tool, true, nil
}

func (t *ToolDraftDAO) MGetWithAPIs(ctx context.Context, pluginID int64, apis []entity.UniqueToolAPI) (tools map[entity.UniqueToolAPI]*entity.ToolInfo, err error) {
	tools = make(map[entity.UniqueToolAPI]*entity.ToolInfo, len(apis))

	table := t.query.ToolDraft
	chunks := slices.Chunks(apis, 10)
	for _, chunk := range chunks {
		sq := table.Where(
			table.Where(
				table.SubURL.Eq(chunk[0].SubURL),
				table.Method.Eq(chunk[0].Method),
			),
		)
		for i, api := range chunk {
			if i == 0 {
				continue
			}
			sq = sq.Or(
				table.SubURL.Eq(api.SubURL),
				table.Method.Eq(api.Method),
			)
		}

		tls, err := table.WithContext(ctx).
			Where(table.PluginID.Eq(pluginID)).
			Where(sq).
			Find()
		if err != nil {
			return nil, err
		}
		for _, tl := range tls {
			api := entity.UniqueToolAPI{
				SubURL: tl.SubURL,
				Method: tl.Method,
			}
			tools[api] = toolDraftPO(*tl).ToDO()
		}
	}

	return tools, nil
}

func (t *ToolDraftDAO) GetAll(ctx context.Context, pluginID int64, opt *ToolSelectedOption) (tools []*entity.ToolInfo, err error) {
	const limit = 20
	table := t.query.ToolDraft
	cursor := int64(0)

	for {
		tls, err := table.WithContext(ctx).
			Select(t.getSelected(opt)...).
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
			tools = append(tools, toolDraftPO(*tl).ToDO())
		}

		if len(tls) < limit {
			break
		}

		cursor = tls[len(tls)-1].ID
	}

	return tools, nil
}

func (t *ToolDraftDAO) Delete(ctx context.Context, toolID int64) (err error) {
	table := t.query.ToolDraft
	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(toolID)).
		Delete()
	if err != nil {
		return err
	}

	return nil
}

func (t *ToolDraftDAO) Update(ctx context.Context, tool *entity.ToolInfo) (err error) {
	m, err := t.getToolDraftUpdateMap(tool)
	if err != nil {
		return err
	}

	table := t.query.ToolDraft
	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(tool.ID)).
		Updates(m)
	if err != nil {
		return err
	}

	return nil
}

func (t *ToolDraftDAO) List(ctx context.Context, pluginID int64, pageInfo entity.PageInfo) (tools []*entity.ToolInfo, total int64, err error) {
	if pageInfo.SortBy == nil || pageInfo.OrderByACS == nil {
		return nil, 0, fmt.Errorf("sortBy or orderByACS is empty")
	}

	if *pageInfo.SortBy != entity.SortByCreatedAt {
		return nil, 0, fmt.Errorf("invalid sortBy '%v'", *pageInfo.SortBy)
	}

	table := t.query.ToolDraft
	var orderExpr field.Expr
	if *pageInfo.OrderByACS {
		orderExpr = table.CreatedAt.Asc()
	} else {
		orderExpr = table.CreatedAt.Desc()
	}

	offset := (pageInfo.Page - 1) * pageInfo.Size
	tls, total, err := table.WithContext(ctx).
		Where(table.PluginID.Eq(pluginID)).
		Order(orderExpr).
		FindByPage(offset, pageInfo.Size)
	if err != nil {
		return nil, 0, err
	}

	tools = make([]*entity.ToolInfo, 0, len(tls))
	for _, tl := range tls {
		tools = append(tools, toolDraftPO(*tl).ToDO())
	}

	return tools, total, nil
}

func (t *ToolDraftDAO) DeleteAllWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error) {
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

func (t *ToolDraftDAO) BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, tools []*entity.ToolInfo) (toolIDs []int64, err error) {
	toolIDs = make([]int64, 0, len(tools))
	tls := make([]*model.ToolDraft, 0, len(tools))

	for _, tool := range tools {
		id, err := t.idGen.GenID(ctx)
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

func (t *ToolDraftDAO) UpdateWithTX(ctx context.Context, tx *query.QueryTx, tool *entity.ToolInfo) (err error) {
	m, err := t.getToolDraftUpdateMap(tool)
	if err != nil {
		return err
	}

	table := tx.ToolDraft
	_, err = table.Debug().WithContext(ctx).
		Where(table.ID.Eq(tool.ID)).
		Updates(m)
	if err != nil {
		return err
	}

	return nil
}

func (t *ToolDraftDAO) ResetAllDebugStatusWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error) {
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
			Updates(map[string]any{
				table.DebugStatus.ColumnName().String(): int32(common.APIDebugStatus_DebugWaiting),
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

func (t *ToolDraftDAO) getToolDraftUpdateMap(tool *entity.ToolInfo) (map[string]any, error) {
	table := t.query.ToolDraft

	updateMap := map[string]any{}
	if tool.Operation != nil {
		b, err := json.Marshal(tool.Operation)
		if err != nil {
			return nil, err
		}
		updateMap[table.Operation.ColumnName().String()] = b
	}
	if tool.SubURL != nil {
		updateMap[table.SubURL.ColumnName().String()] = *tool.SubURL
	}
	if tool.Method != nil {
		updateMap[table.Method.ColumnName().String()] = *tool.Method
	}
	if tool.ActivatedStatus != nil {
		updateMap[table.ActivatedStatus.ColumnName().String()] = int32(*tool.ActivatedStatus)
	}
	if tool.DebugStatus != nil {
		updateMap[table.DebugStatus.ColumnName().String()] = int32(*tool.DebugStatus)
	}

	return updateMap, nil
}
