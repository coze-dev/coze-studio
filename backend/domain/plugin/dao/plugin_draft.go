package dao

import (
	"context"
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
	pluginDraftOnce      sync.Once
	singletonPluginDraft *pluginDraftImpl
)

type PluginDraftDAO interface {
	Create(ctx context.Context, plugin *entity.PluginInfo) (pluginID int64, err error)
	Get(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error)
	MGet(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error)
	List(ctx context.Context, spaceID int64, pageInfo entity.PageInfo) (plugins []*entity.PluginInfo, total int64, err error)
	Update(ctx context.Context, plugin *entity.PluginInfo) (err error)

	UpdateWithTX(ctx context.Context, tx *query.QueryTx, plugin *entity.PluginInfo) (err error)
	DeleteWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error)
}

func NewPluginDraftDAO(db *gorm.DB, idGen idgen.IDGenerator) PluginDraftDAO {
	pluginDraftOnce.Do(func() {
		singletonPluginDraft = &pluginDraftImpl{
			IDGen: idGen,
			query: query.Use(db),
		}
	})

	return singletonPluginDraft
}

type pluginDraftImpl struct {
	IDGen idgen.IDGenerator
	query *query.Query
}

func (p *pluginDraftImpl) Create(ctx context.Context, plugin *entity.PluginInfo) (pluginID int64, err error) {
	id, err := p.IDGen.GenID(ctx)
	if err != nil {
		return 0, err
	}

	pl := &model.PluginDraft{
		ID:             id,
		SpaceID:        plugin.SpaceID,
		DeveloperID:    plugin.DeveloperID,
		Name:           plugin.GetName(),
		Desc:           plugin.GetDesc(),
		IconURI:        plugin.GetIconURI(),
		PluginManifest: plugin.PluginManifest,
		OpenapiDoc:     plugin.OpenapiDoc,
	}

	table := p.query.PluginDraft

	err = table.WithContext(ctx).Create(pl)
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (p *pluginDraftImpl) Get(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error) {
	table := p.query.PluginDraft

	pl, err := table.WithContext(ctx).
		Where(table.ID.Eq(pluginID)).
		First()
	if err != nil {
		return nil, err
	}

	plugin = convertor.PluginDraftToDO(pl)

	return plugin, nil
}

func (p *pluginDraftImpl) MGet(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error) {
	plugins = make([]*entity.PluginInfo, 0, len(pluginIDs))

	table := p.query.PluginDraft
	chunks := slices.SplitSlice(pluginIDs, 20)

	for _, chunk := range chunks {
		pls, err := table.WithContext(ctx).
			Where(table.ID.In(chunk...)).
			Find()
		if err != nil {
			return nil, err
		}

		for _, pl := range pls {
			plugins = append(plugins, convertor.PluginDraftToDO(pl))
		}
	}

	return plugins, nil
}

func (p *pluginDraftImpl) List(ctx context.Context, spaceID int64, pageInfo entity.PageInfo) (plugins []*entity.PluginInfo, total int64, err error) {
	table := p.query.PluginDraft

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
		plugins = append(plugins, convertor.PluginDraftToDO(pl))
	}

	return plugins, total, nil
}

func (p *pluginDraftImpl) Update(ctx context.Context, plugin *entity.PluginInfo) (err error) {
	m := &model.PluginDraft{
		PluginManifest: plugin.PluginManifest,
		OpenapiDoc:     plugin.OpenapiDoc,
	}

	if plugin.Name != nil {
		m.Name = *plugin.Name
	}

	if plugin.Desc != nil {
		m.Desc = *plugin.Desc
	}

	if plugin.IconURI != nil {
		m.IconURI = *plugin.IconURI
	}

	table := p.query.PluginDraft

	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(plugin.ID)).
		Updates(m)
	if err != nil {
		return err
	}

	return nil
}

func (p *pluginDraftImpl) UpdateWithTX(ctx context.Context, tx *query.QueryTx, plugin *entity.PluginInfo) (err error) {
	m := &model.PluginDraft{
		PluginManifest: plugin.PluginManifest,
		OpenapiDoc:     plugin.OpenapiDoc,
	}

	if plugin.Name != nil {
		m.Name = *plugin.Name
	}

	if plugin.Desc != nil {
		m.Desc = *plugin.Desc
	}

	if plugin.IconURI != nil {
		m.IconURI = *plugin.IconURI
	}

	if plugin.ServerURL != nil {
		m.ServerURL = *plugin.ServerURL
	}

	table := tx.PluginDraft

	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(plugin.ID)).
		Updates(m)
	if err != nil {
		return err
	}

	return nil
}

func (p *pluginDraftImpl) DeleteWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error) {
	table := tx.PluginDraft

	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(pluginID)).
		Delete()
	if err != nil {
		return err
	}

	return nil
}
