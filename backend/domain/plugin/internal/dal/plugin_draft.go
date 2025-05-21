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
)

func NewPluginDraftDAO(db *gorm.DB, idGen idgen.IDGenerator) *PluginDraftDAO {
	return &PluginDraftDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type PluginDraftDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

func (p *PluginDraftDAO) Create(ctx context.Context, plugin *entity.PluginInfo) (pluginID int64, err error) {
	id, err := p.idGen.GenID(ctx)
	if err != nil {
		return 0, err
	}

	table := p.query.PluginDraft
	err = table.WithContext(ctx).Create(&model.PluginDraft{
		ID:          id,
		SpaceID:     plugin.SpaceID,
		DeveloperID: plugin.DeveloperID,
		IconURI:     plugin.GetIconURI(),
		ServerURL:   plugin.GetServerURL(),
		ProjectID:   plugin.GetProjectID(),
		Manifest:    plugin.Manifest,
		OpenapiDoc:  plugin.OpenapiDoc,
	})
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (p *PluginDraftDAO) Get(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, exist bool, err error) {
	table := p.query.PluginDraft
	pl, err := table.WithContext(ctx).
		Where(table.ID.Eq(pluginID)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	plugin = model.PluginDraftToDO(pl)

	return plugin, true, nil
}

func (p *PluginDraftDAO) List(ctx context.Context, spaceID int64, pageInfo entity.PageInfo) (plugins []*entity.PluginInfo, total int64, err error) {
	if pageInfo.SortBy == nil || pageInfo.OrderByACS == nil {
		return nil, 0, fmt.Errorf("sortBy or orderByACS is empty")
	}

	var orderExpr field.Expr
	table := p.query.PluginDraft

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
		Where(
			table.SpaceID.Eq(spaceID),
			table.ProjectID.Eq(0),
		).
		Order(orderExpr).
		FindByPage(offset, pageInfo.Size)
	if err != nil {
		return nil, 0, err
	}

	plugins = make([]*entity.PluginInfo, 0, len(pls))
	for _, pl := range pls {
		plugins = append(plugins, model.PluginDraftToDO(pl))
	}

	return plugins, total, nil
}

func (p *PluginDraftDAO) Update(ctx context.Context, plugin *entity.PluginInfo) (err error) {
	m := &model.PluginDraft{
		Manifest:   plugin.Manifest,
		OpenapiDoc: plugin.OpenapiDoc,
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

func (p *PluginDraftDAO) CreateWithTX(ctx context.Context, tx *query.QueryTx, plugin *entity.PluginInfo) (pluginID int64, err error) {
	id, err := p.idGen.GenID(ctx)
	if err != nil {
		return 0, err
	}

	table := tx.PluginDraft
	err = table.WithContext(ctx).Create(&model.PluginDraft{
		ID:          id,
		SpaceID:     plugin.SpaceID,
		DeveloperID: plugin.DeveloperID,
		IconURI:     plugin.GetIconURI(),
		ServerURL:   plugin.GetServerURL(),
		ProjectID:   plugin.GetProjectID(),
		Manifest:    plugin.Manifest,
		OpenapiDoc:  plugin.OpenapiDoc,
	})
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (p *PluginDraftDAO) UpdateWithTX(ctx context.Context, tx *query.QueryTx, plugin *entity.PluginInfo) (err error) {
	m := &model.PluginDraft{
		Manifest:   plugin.Manifest,
		OpenapiDoc: plugin.OpenapiDoc,
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

func (p *PluginDraftDAO) DeleteWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error) {
	table := tx.PluginDraft
	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(pluginID)).
		Delete()
	if err != nil {
		return err
	}

	return nil
}
