package dao

import (
	"context"
	"sync"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/convertor"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type PluginVersionDAO interface {
	Get(ctx context.Context, pluginID int64, version string) (plugin *entity.PluginInfo, err error)

	CreateWithTX(ctx context.Context, tx *query.QueryTx, plugin *entity.PluginInfo) (err error)
}

var (
	pluginVersionOnce      sync.Once
	singletonPluginVersion *pluginVersionImpl
)

func NewPluginVersionDAO(db *gorm.DB, idGen idgen.IDGenerator) PluginVersionDAO {
	pluginVersionOnce.Do(func() {
		singletonPluginVersion = &pluginVersionImpl{
			IDGen: idGen,
			query: query.Use(db),
		}
	})

	return singletonPluginVersion
}

type pluginVersionImpl struct {
	IDGen idgen.IDGenerator
	query *query.Query
}

func (p *pluginVersionImpl) Get(ctx context.Context, pluginID int64, version string) (plugin *entity.PluginInfo, err error) {
	table := p.query.PluginVersion

	pl, err := table.WithContext(ctx).
		Where(
			table.PluginID.Eq(pluginID),
			table.Version.Eq(version),
		).First()
	if err != nil {
		return nil, err
	}

	plugin = convertor.PluginVersionToDO(pl)

	return nil, nil
}

func (p *pluginVersionImpl) CreateWithTX(ctx context.Context, tx *query.QueryTx, plugin *entity.PluginInfo) (err error) {
	m := &model.PluginVersion{
		ID:          plugin.ID,
		SpaceID:     plugin.SpaceID,
		DeveloperID: plugin.DeveloperID,
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

	if plugin.Version != nil {
		m.Version = *plugin.Version
	}

	if plugin.PrivacyInfoInJson != nil {
		m.PrivacyInfo = *plugin.PrivacyInfoInJson
	}

	if plugin.ServerURL != nil {
		m.ServerURL = *plugin.ServerURL
	}

	table := tx.PluginVersion

	err = table.WithContext(ctx).Create(m)
	if err != nil {
		return err
	}

	return nil
}
