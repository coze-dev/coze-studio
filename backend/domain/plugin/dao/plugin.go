package dao

import (
	"context"
	"errors"
	"sync"

	"gorm.io/gen/field"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

var (
	pluginOnce      sync.Once
	singletonPlugin *pluginImpl
)

type PluginDAO interface {
	Get(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, exist bool, err error)
	MGet(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error)
	List(ctx context.Context, spaceID int64, pageInfo entity.PageInfo) (plugins []*entity.PluginInfo, total int64, err error)

	UpsertWithTX(ctx context.Context, tx *query.QueryTx, plugin *entity.PluginInfo) (err error)
	DeleteWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error)
}

func NewPluginDAO(db *gorm.DB, idGen idgen.IDGenerator) PluginDAO {
	pluginOnce.Do(func() {
		singletonPlugin = &pluginImpl{
			IDGen: idGen,
			query: query.Use(db),
		}
	})

	return singletonPlugin
}

type pluginImpl struct {
	IDGen idgen.IDGenerator
	query *query.Query
}

func (p *pluginImpl) Get(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, exist bool, err error) {
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

func (p *pluginImpl) MGet(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error) {
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

func (p *pluginImpl) List(ctx context.Context, spaceID int64, pageInfo entity.PageInfo) (plugins []*entity.PluginInfo, total int64, err error) {
	table := p.query.Plugin

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

	pls, total, err := table.WithContext(ctx).
		Where(table.SpaceID.Eq(spaceID)).
		Order(getOrderExpr()).
		FindByPage(pageInfo.Page, pageInfo.Size)
	if err != nil {
		return nil, 0, err
	}

	plugins = make([]*entity.PluginInfo, 0, len(pls))
	for _, pl := range pls {
		plugins = append(plugins, model.PluginToDO(pl))
	}

	return plugins, total, nil
}

func (p *pluginImpl) UpsertWithTX(ctx context.Context, tx *query.QueryTx, plugin *entity.PluginInfo) (err error) {
	m := &model.Plugin{
		ID:          plugin.ID,
		SpaceID:     plugin.SpaceID,
		DeveloperID: plugin.DeveloperID,
		Manifest:    plugin.Manifest,
		OpenapiDoc:  plugin.OpenapiDoc,
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
	_, err = table.WithContext(ctx).Where(table.ID.Eq(plugin.ID)).First()
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

func (p *pluginImpl) DeleteWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error) {
	table := tx.Plugin
	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(pluginID)).
		Delete()
	if err != nil {
		return err
	}

	return nil
}
