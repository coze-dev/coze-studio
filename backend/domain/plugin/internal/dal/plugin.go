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

func NewPluginDAO(db *gorm.DB, idGen idgen.IDGenerator) *PluginDAO {
	return &PluginDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type PluginDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

func (p *PluginDAO) Get(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, exist bool, err error) {
	table := p.query.Plugin
	pl, err := table.WithContext(ctx).
		Where(table.ID.Eq(pluginID)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	plugin = model.PluginToDO(pl)

	return plugin, true, nil
}

func (p *PluginDAO) MGet(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error) {
	plugins = make([]*entity.PluginInfo, 0, len(pluginIDs))

	table := p.query.Plugin
	chunks := slices.Chunks(pluginIDs, 20)

	for _, chunk := range chunks {
		pls, err := table.WithContext(ctx).
			Where(table.ID.In(chunk...)).
			Find()
		if err != nil {
			return nil, err
		}
		for _, pl := range pls {
			plugins = append(plugins, model.PluginToDO(pl))
		}
	}

	return plugins, nil
}

func (p *PluginDAO) CheckPluginExist(ctx context.Context, pluginID int64) (exist bool, err error) {
	table := p.query.Plugin
	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(pluginID)).
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

func (p *PluginDAO) List(ctx context.Context, spaceID int64, pageInfo entity.PageInfo) (plugins []*entity.PluginInfo, total int64, err error) {
	if pageInfo.SortBy == nil || pageInfo.OrderByACS == nil {
		return nil, 0, fmt.Errorf("sortBy or orderByACS is empty")
	}

	var orderExpr field.Expr
	table := p.query.Plugin

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

	offset := (pageInfo.Page - 1) * pageInfo.Size
	pls, total, err := table.WithContext(ctx).
		Where(table.SpaceID.Eq(spaceID)).
		Order(orderExpr).
		FindByPage(offset, pageInfo.Size)
	if err != nil {
		return nil, 0, err
	}

	plugins = make([]*entity.PluginInfo, 0, len(pls))
	for _, pl := range pls {
		plugins = append(plugins, model.PluginToDO(pl))
	}

	return plugins, total, nil
}

func (p *PluginDAO) UpsertWithTX(ctx context.Context, tx *query.QueryTx, plugin *entity.PluginInfo) (err error) {
	m := &model.Plugin{
		ID:          plugin.ID,
		SpaceID:     plugin.SpaceID,
		DeveloperID: plugin.DeveloperID,
		Manifest:    plugin.Manifest,
		OpenapiDoc:  plugin.OpenapiDoc,
		PluginType:  int32(plugin.PluginType),
	}

	if plugin.IconURI != nil {
		m.IconURI = *plugin.IconURI
	}
	if plugin.Version != nil {
		m.Version = *plugin.Version
	}
	if plugin.VersionDesc != nil {
		m.VersionDesc = *plugin.VersionDesc
	}
	if plugin.ServerURL != nil {
		m.ServerURL = *plugin.ServerURL
	}

	table := tx.Plugin
	_, err = table.WithContext(ctx).Select(table.ID).Where(table.ID.Eq(plugin.ID)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return table.WithContext(ctx).Create(m)
		}
		return err
	}

	_, err = table.WithContext(ctx).Updates(m)
	if err != nil {
		return err
	}

	return nil
}

func (p *PluginDAO) DeleteWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error) {
	table := tx.Plugin
	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(pluginID)).
		Delete()
	if err != nil {
		return err
	}

	return nil
}
