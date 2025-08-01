/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package dal

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"gorm.io/gen/field"
	"gorm.io/gorm"

	pluginModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	"github.com/coze-dev/coze-studio/backend/api/model/plugin_develop_common"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/conf"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
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

type pluginDraftPO model.PluginDraft

func (p pluginDraftPO) ToDO() *entity.PluginInfo {
	return entity.NewPluginInfo(&pluginModel.PluginInfo{
		ID:          p.ID,
		SpaceID:     p.SpaceID,
		DeveloperID: p.DeveloperID,
		APPID:       &p.AppID,
		IconURI:     &p.IconURI,
		ServerURL:   &p.ServerURL,
		PluginType:  plugin_develop_common.PluginType(p.PluginType),
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
		Manifest:    p.Manifest,
		OpenapiDoc:  p.OpenapiDoc,
	})
}

func (p *PluginDraftDAO) getSelected(opt *PluginSelectedOption) (selected []field.Expr) {
	if opt == nil {
		return selected
	}

	table := p.query.PluginDraft

	if opt.PluginID {
		selected = append(selected, table.ID)
	}
	if opt.OpenapiDoc {
		selected = append(selected, table.OpenapiDoc)
	}
	if opt.Manifest {
		selected = append(selected, table.Manifest)
	}
	if opt.IconURI {
		selected = append(selected, table.IconURI)
	}

	return selected
}

func (p *PluginDraftDAO) Create(ctx context.Context, plugin *entity.PluginInfo) (pluginID int64, err error) {
	id, err := p.genPluginID(ctx)
	if err != nil {
		return 0, err
	}

	mf, err := plugin.Manifest.EncryptAuthPayload()
	if err != nil {
		return 0, fmt.Errorf("EncryptAuthPayload failed, err=%w", err)
	}

	table := p.query.PluginDraft
	err = table.WithContext(ctx).Create(&model.PluginDraft{
		ID:          id,
		SpaceID:     plugin.SpaceID,
		DeveloperID: plugin.DeveloperID,
		PluginType:  int32(plugin.PluginType),
		IconURI:     plugin.GetIconURI(),
		ServerURL:   plugin.GetServerURL(),
		AppID:       plugin.GetAPPID(),
		Manifest:    mf,
		OpenapiDoc:  plugin.OpenapiDoc,
	})
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (p *PluginDraftDAO) genPluginID(ctx context.Context) (id int64, err error) {

	retryTimes := 5
	for i := 0; i < retryTimes; i++ {
		id, err = p.idGen.GenID(ctx)
		if err != nil {
			return 0, err
		}
		if _, ok := conf.GetPluginProduct(id); !ok {
			break
		}
		if i == retryTimes-1 {
			return 0, fmt.Errorf("id %d is confilict with product plugin id.", id)
		}
	}

	return id, nil
}

func (p *PluginDraftDAO) Get(ctx context.Context, pluginID int64, opt *PluginSelectedOption) (plugin *entity.PluginInfo, exist bool, err error) {
	table := p.query.PluginDraft
	pl, err := table.WithContext(ctx).
		Select(p.getSelected(opt)...).
		Where(table.ID.Eq(pluginID)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	plugin = pluginDraftPO(*pl).ToDO()

	return plugin, true, nil
}

func (p *PluginDraftDAO) GetAPPAllPlugins(ctx context.Context, appID int64, opt *PluginSelectedOption) (plugins []*entity.PluginInfo, err error) {
	table := p.query.PluginDraft

	cursor := int64(0)
	limit := 20

	for {
		pls, err := table.WithContext(ctx).
			Select(p.getSelected(opt)...).
			Where(
				table.AppID.Eq(appID),
				table.ID.Gt(cursor),
			).
			Order(table.ID.Asc()).
			Limit(limit).
			Find()
		if err != nil {
			return nil, err
		}

		for _, pl := range pls {
			plugins = append(plugins, pluginDraftPO(*pl).ToDO())
		}

		if len(pls) < limit {
			break
		}

		cursor = pls[len(pls)-1].ID
	}

	return plugins, nil
}

func (p *PluginDraftDAO) MGet(ctx context.Context, pluginIDs []int64, opt *PluginSelectedOption) (plugins []*entity.PluginInfo, err error) {
	plugins = make([]*entity.PluginInfo, 0, len(pluginIDs))

	table := p.query.PluginDraft
	chunks := slices.Chunks(pluginIDs, 20)

	for _, chunk := range chunks {
		pls, err := table.WithContext(ctx).
			Select(p.getSelected(opt)...).
			Where(table.ID.In(chunk...)).
			Find()
		if err != nil {
			return nil, err
		}
		for _, pl := range pls {
			plugins = append(plugins, pluginDraftPO(*pl).ToDO())
		}
	}

	return plugins, nil
}

func (p *PluginDraftDAO) List(ctx context.Context, spaceID, appID int64, pageInfo entity.PageInfo) (plugins []*entity.PluginInfo, total int64, err error) {
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
			table.AppID.Eq(appID),
		).
		Order(orderExpr).
		FindByPage(offset, pageInfo.Size)
	if err != nil {
		return nil, 0, err
	}

	plugins = make([]*entity.PluginInfo, 0, len(pls))
	for _, pl := range pls {
		plugins = append(plugins, pluginDraftPO(*pl).ToDO())
	}

	return plugins, total, nil
}

func (p *PluginDraftDAO) Update(ctx context.Context, plugin *entity.PluginInfo) (err error) {
	var mf *pluginModel.PluginManifest
	if plugin.Manifest != nil {
		mf, err = plugin.Manifest.EncryptAuthPayload()
		if err != nil {
			return fmt.Errorf("EncryptAuthPayload failed, err=%w", err)
		}
	}

	m := &model.PluginDraft{
		Manifest:   mf,
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
	id, err := p.genPluginID(ctx)
	if err != nil {
		return 0, err
	}

	mf, err := plugin.Manifest.EncryptAuthPayload()
	if err != nil {
		return 0, fmt.Errorf("EncryptAuthPayload failed, err=%w", err)
	}

	table := tx.PluginDraft
	err = table.WithContext(ctx).Create(&model.PluginDraft{
		ID:          id,
		SpaceID:     plugin.SpaceID,
		DeveloperID: plugin.DeveloperID,
		PluginType:  int32(plugin.PluginType),
		IconURI:     plugin.GetIconURI(),
		ServerURL:   plugin.GetServerURL(),
		AppID:       plugin.GetAPPID(),
		Manifest:    mf,
		OpenapiDoc:  plugin.OpenapiDoc,
	})
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (p *PluginDraftDAO) UpdateWithTX(ctx context.Context, tx *query.QueryTx, plugin *entity.PluginInfo) (err error) {
	table := tx.PluginDraft

	updateMap := map[string]any{}
	if plugin.Manifest != nil {
		mf, err := plugin.Manifest.EncryptAuthPayload()
		if err != nil {
			return fmt.Errorf("EncryptAuthPayload failed, err=%w", err)
		}

		mfBytes, err := json.Marshal(mf)
		if err != nil {
			return err
		}

		updateMap[table.Manifest.ColumnName().String()] = mfBytes
	}
	if plugin.OpenapiDoc != nil {
		doc, err := json.Marshal(plugin.OpenapiDoc)
		if err != nil {
			return err
		}
		updateMap[table.OpenapiDoc.ColumnName().String()] = doc
	}
	if plugin.IconURI != nil {
		updateMap[table.IconURI.ColumnName().String()] = *plugin.IconURI
	}
	if plugin.ServerURL != nil {
		updateMap[table.ServerURL.ColumnName().String()] = *plugin.ServerURL
	}
	if plugin.APPID != nil {
		updateMap[table.AppID.ColumnName().String()] = *plugin.APPID
	}

	_, err = table.WithContext(ctx).
		Where(table.ID.Eq(plugin.ID)).
		UpdateColumns(updateMap)
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
