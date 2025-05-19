package dal

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

func NewPluginVersionDAO(db *gorm.DB, idGen idgen.IDGenerator) *PluginVersionDAO {
	return &PluginVersionDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type PluginVersionDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

func (p *PluginVersionDAO) Get(ctx context.Context, pluginID int64, version string) (plugin *entity.PluginInfo, exist bool, err error) {
	table := p.query.PluginVersion
	pl, err := table.WithContext(ctx).
		Where(
			table.PluginID.Eq(pluginID),
			table.Version.Eq(version),
		).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	plugin = model.PluginVersionToDO(pl)

	return plugin, true, nil
}

func (p *PluginVersionDAO) MGet(ctx context.Context, vPlugins []entity.VersionPlugin) (plugins []*entity.PluginInfo, err error) {
	plugins = make([]*entity.PluginInfo, 0, len(vPlugins))

	table := p.query.PluginVersion
	chunks := slices.Chunks(vPlugins, 10)

	for _, chunk := range chunks {
		q := table.WithContext(ctx).
			Where(
				table.Where(
					table.PluginID.Eq(chunk[0].PluginID),
					table.Version.Eq(chunk[0].Version),
				),
			)

		for i, v := range chunk {
			if i == 0 {
				continue
			}
			q = q.Or(
				table.PluginID.Eq(v.PluginID),
				table.Version.Eq(v.Version),
			)
		}

		pls, err := q.Find()
		if err != nil {
			return nil, err
		}

		for _, pl := range pls {
			plugins = append(plugins, model.PluginVersionToDO(pl))
		}
	}

	return plugins, nil
}

func (p *PluginVersionDAO) ListVersions(ctx context.Context, pluginID int64, pageInfo entity.PageInfo) (plugins []*entity.PluginInfo, total int64, err error) {
	table := p.query.PluginVersion
	pls, total, err := table.WithContext(ctx).
		Where(table.PluginID.Eq(pluginID)).
		Select(table.CreatedAt, table.Manifest, table.Version, table.VersionDesc).
		Order(table.CreatedAt.Desc()).
		FindByPage(pageInfo.Page-1, pageInfo.Size)
	if err != nil {
		return nil, 0, err
	}

	plugins = make([]*entity.PluginInfo, 0, len(pls))
	for _, pl := range pls {
		plugins = append(plugins, model.PluginVersionToDO(pl))
	}

	return plugins, total, nil
}

func (p *PluginVersionDAO) CreateWithTX(ctx context.Context, tx *query.QueryTx, plugin *entity.PluginInfo) (err error) {
	if plugin.GetVersion() == "" {
		return fmt.Errorf("invalid plugin version")
	}

	id, err := p.idGen.GenID(ctx)
	if err != nil {
		return err
	}

	table := tx.PluginVersion
	err = table.WithContext(ctx).Create(&model.PluginVersion{
		ID:          id,
		SpaceID:     plugin.SpaceID,
		PluginID:    plugin.ID,
		DeveloperID: plugin.DeveloperID,
		IconURI:     plugin.GetIconURI(),
		ServerURL:   plugin.GetServerURL(),
		Version:     plugin.GetVersion(),
		VersionDesc: plugin.GetVersionDesc(),
		Manifest:    plugin.Manifest,
		OpenapiDoc:  plugin.OpenapiDoc,
	})
	if err != nil {
		return err
	}

	return nil
}
