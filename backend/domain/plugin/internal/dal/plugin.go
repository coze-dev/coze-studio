package dal

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gen/field"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
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

type pluginPO model.Plugin

func (p pluginPO) ToDO() *entity.PluginInfo {
	return entity.NewPluginInfo(&plugin.PluginInfo{
		ID:          p.ID,
		SpaceID:     p.SpaceID,
		DeveloperID: p.DeveloperID,
		IconURI:     &p.IconURI,
		ServerURL:   &p.ServerURL,
		PluginType:  plugin_develop_common.PluginType(p.PluginType),
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
		Version:     &p.Version,
		VersionDesc: &p.VersionDesc,
		Manifest:    p.Manifest,
		OpenapiDoc:  p.OpenapiDoc,
	})
}

func (p *PluginDAO) getSelected(opt *PluginSelectedOption) (selected []field.Expr) {
	if opt == nil {
		return selected
	}

	table := p.query.Plugin

	if opt.PluginID {
		selected = append(selected, table.ID)
	}
	if opt.OpenapiDoc {
		selected = append(selected, table.OpenapiDoc)
	}
	if opt.Version {
		selected = append(selected, table.Version)
	}

	return selected
}

func (p *PluginDAO) Get(ctx context.Context, pluginID int64, opt *PluginSelectedOption) (plugin *entity.PluginInfo, exist bool, err error) {
	table := p.query.Plugin

	pl, err := table.WithContext(ctx).
		Where(table.ID.Eq(pluginID)).
		Select(p.getSelected(opt)...).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	plugin = pluginPO(*pl).ToDO()

	return plugin, true, nil
}

func (p *PluginDAO) MGet(ctx context.Context, pluginIDs []int64, opt *PluginSelectedOption) (plugins []*entity.PluginInfo, err error) {
	plugins = make([]*entity.PluginInfo, 0, len(pluginIDs))

	table := p.query.Plugin
	chunks := slices.Chunks(pluginIDs, 10)

	for _, chunk := range chunks {
		pls, err := table.WithContext(ctx).
			Select(p.getSelected(opt)...).
			Where(table.ID.In(chunk...)).
			Find()
		if err != nil {
			return nil, err
		}
		for _, pl := range pls {
			plugins = append(plugins, pluginPO(*pl).ToDO())
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
		plugins = append(plugins, pluginPO(*pl).ToDO())
	}

	return plugins, total, nil
}

func (p *PluginDAO) UpsertWithTX(ctx context.Context, tx *query.QueryTx, plugin *entity.PluginInfo) (err error) {
	table := tx.Plugin
	_, err = table.WithContext(ctx).Select(table.ID).Where(table.ID.Eq(plugin.ID)).First()
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		m := &model.Plugin{
			ID:          plugin.ID,
			SpaceID:     plugin.SpaceID,
			DeveloperID: plugin.DeveloperID,
			AppID:       plugin.GetAPPID(),
			Manifest:    plugin.Manifest,
			OpenapiDoc:  plugin.OpenapiDoc,
			PluginType:  int32(plugin.PluginType),
			IconURI:     plugin.GetIconURI(),
			ServerURL:   plugin.GetServerURL(),
			Version:     plugin.GetVersion(),
			VersionDesc: plugin.GetVersionDesc(),
		}

		return table.WithContext(ctx).Create(m)
	}

	updateMap := map[string]interface{}{}
	if plugin.IconURI != nil {
		updateMap[table.IconURI.ColumnName().String()] = *plugin.IconURI
	}
	if plugin.Version != nil {
		updateMap[table.Version.ColumnName().String()] = *plugin.Version
	}
	if plugin.VersionDesc != nil {
		updateMap[table.VersionDesc.ColumnName().String()] = *plugin.VersionDesc
	}
	if plugin.ServerURL != nil {
		updateMap[table.ServerURL.ColumnName().String()] = *plugin.ServerURL
	}
	if plugin.Manifest != nil {
		updateMap[table.Manifest.ColumnName().String()] = plugin.Manifest
	}
	if plugin.OpenapiDoc != nil {
		updateMap[table.OpenapiDoc.ColumnName().String()] = plugin.OpenapiDoc
	}

	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(plugin.ID)).
		UpdateColumns(updateMap)
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
