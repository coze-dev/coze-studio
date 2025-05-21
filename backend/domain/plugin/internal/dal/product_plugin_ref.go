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

func NewPluginProductRefDAO(db *gorm.DB, idGen idgen.IDGenerator) *PluginProductRefDAO {
	return &PluginProductRefDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type PluginProductRefDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

func (p *PluginProductRefDAO) Get(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, exist bool, err error) {
	table := p.query.PluginProductRef
	pl, err := table.WithContext(ctx).
		Where(table.ID.Eq(pluginID)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	plugin = model.PluginProductRefToDO(pl)

	return plugin, true, nil
}

func (p *PluginProductRefDAO) GetAllPluginProducts(ctx context.Context, spaceID int64) (plugins []*entity.PluginInfo, err error) {
	const limit = 20
	table := p.query.PluginProductRef
	cursor := int64(0)

	for {
		pls, err := table.WithContext(ctx).
			Where(
				table.SpaceID.Eq(spaceID),
				table.ID.Gt(cursor),
			).
			Select(table.RefProductID).
			Order(table.ID.Asc()).
			Limit(limit).
			Find()
		if err != nil {
			return nil, err
		}

		for _, pl := range pls {
			plugins = append(plugins, model.PluginProductRefToDO(pl))
		}

		if len(pls) < limit {
			break
		}

		cursor = pls[len(pls)-1].ID
	}

	return plugins, nil
}

func (p *PluginProductRefDAO) MGet(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error) {
	plugins = make([]*entity.PluginInfo, 0, len(pluginIDs))

	table := p.query.PluginProductRef
	chunks := slices.Chunks(pluginIDs, 20)

	for _, chunk := range chunks {
		pls, err := table.WithContext(ctx).
			Where(table.ID.In(chunk...)).
			Find()
		if err != nil {
			return nil, err
		}
		for _, pl := range pls {
			plugins = append(plugins, model.PluginProductRefToDO(pl))
		}
	}

	return plugins, nil
}

func (p *PluginProductRefDAO) CheckPluginExist(ctx context.Context, pluginID int64) (exist bool, err error) {
	table := p.query.PluginProductRef
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

func (p *PluginProductRefDAO) CreateWithTX(ctx context.Context, tx *query.QueryTx, plugin *entity.PluginInfo) (pluginID int64, err error) {
	if plugin.GetRefProductID() <= 0 {
		return 0, fmt.Errorf("invalid product id")
	}

	pluginID, err = p.idGen.GenID(ctx)
	if err != nil {
		return 0, err
	}

	m := &model.PluginProductRef{
		ID:           pluginID,
		SpaceID:      plugin.SpaceID,
		PluginType:   int32(plugin.PluginType),
		RefProductID: plugin.GetRefProductID(),
		DeveloperID:  plugin.DeveloperID,
		Manifest:     plugin.Manifest,
		OpenapiDoc:   plugin.OpenapiDoc,
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

	table := tx.PluginProductRef
	err = table.WithContext(ctx).Create(m)
	if err != nil {
		return 0, err
	}

	return pluginID, nil
}

func (p *PluginProductRefDAO) DeleteWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error) {
	table := tx.PluginProductRef
	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(pluginID)).
		Delete()
	if err != nil {
		return err
	}

	return nil
}
