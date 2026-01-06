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

package modelmgr

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	config "github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr/internal/model"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr/internal/query"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

func (c *ModelConfig) GetProviderModelList(ctx context.Context) ([]*config.ProviderModelList, error) {
	modelProviderList := getModelProviderList()
	res := make([]*config.ProviderModelList, 0, len(modelProviderList))

	allModels, err := query.ModelInstance.WithContext(ctx).
		Where(query.ModelInstance.DeletedAt.IsNull()).Find()
	if err != nil {
		return nil, err
	}

	modelClass2Models := make(map[developer_api.ModelClass][]*config.Model)
	for _, model := range allModels {
		m := c.toModel(ctx, model)
		m.Capability = nil
		m.Provider = nil
		m.Parameters = nil
		modelClass2Models[model.Provider.ModelClass] = append(modelClass2Models[model.Provider.ModelClass], m.Model)
		if m.Connection != nil && m.Connection.BaseConnInfo != nil {
			apiKey := m.Connection.BaseConnInfo.APIKey
			if apiKey != "" {
				n := len(apiKey)
				if n <= 4 {
					m.Connection.BaseConnInfo.APIKey = strings.Repeat("*", n)
				} else if n <= 8 {
					m.Connection.BaseConnInfo.APIKey = fmt.Sprintf("%s***%s", apiKey[:2], apiKey[n-2:])
				} else {
					m.Connection.BaseConnInfo.APIKey = fmt.Sprintf("%s***%s", apiKey[:4], apiKey[n-4:])
				}
			}
		}
	}

	for _, provider := range modelProviderList {
		if provider.IconURI != "" {
			url, err := c.oss.GetObjectUrl(ctx, provider.IconURI)
			if err != nil {
				logs.CtxWarnf(ctx, "get model icon url failed, err: %v", err)
			} else {
				provider.IconURL = url
			}
		}
		res = append(res, &config.ProviderModelList{
			Provider:  provider,
			ModelList: modelClass2Models[provider.ModelClass],
		})
	}

	return res, nil
}

func (c *ModelConfig) GetAllModelList(ctx context.Context) ([]*Model, error) {
	return c.getModelList(ctx, true)
}

func (c *ModelConfig) GetOnlineModelList(ctx context.Context) ([]*Model, error) {
	return c.getModelList(ctx, false)
}

func (c *ModelConfig) getModelList(ctx context.Context, includeDeleteModel bool) ([]*Model, error) {
	useOldModel, err := c.UseOldModelConf(ctx)
	if err != nil {
		return nil, fmt.Errorf("get use old model conf failed, err: %w", err)
	}

	if useOldModel {
		return oldModels, nil
	}

	var allModels []*model.ModelInstance
	if includeDeleteModel {
		allModels, err = query.ModelInstance.WithContext(ctx).Unscoped().Find()
	} else {
		allModels, err = query.ModelInstance.WithContext(ctx).
			Where(query.ModelInstance.DeletedAt.IsNull()).Find()
	}

	if err != nil {
		return nil, err
	}

	modelList := make([]*Model, 0, len(allModels))
	for _, model := range allModels {
		m := c.toModel(ctx, model)
		modelList = append(modelList, m)
	}

	return modelList, nil
}

func (c *ModelConfig) GetOnlineModelListWithLimit(ctx context.Context, limit int) ([]*Model, error) {
	useOldModel, err := c.UseOldModelConf(ctx)
	if err != nil {
		return nil, fmt.Errorf("get use old model conf failed, err: %w", err)
	}

	if useOldModel {
		if limit > len(oldModels) {
			limit = len(oldModels)
		}
		return oldModels[:limit], nil
	}

	allModels, err := query.ModelInstance.WithContext(ctx).Limit(limit).Find()
	if err != nil {
		return nil, err
	}

	modelList := make([]*Model, 0, len(allModels))
	for _, model := range allModels {
		m := c.toModel(ctx, model)
		modelList = append(modelList, m)
	}

	return modelList, nil
}

func (c *ModelConfig) MGetModelByID(ctx context.Context, ids []int64) ([]*Model, error) {
	useOldModel, err := c.UseOldModelConf(ctx)
	if err != nil {
		return nil, fmt.Errorf("get use old model conf failed, err: %w", err)
	}

	if useOldModel {
		modelList := make([]*Model, 0, len(ids))
		for _, id := range ids {
			for _, old := range oldModels {
				if old.ID == id {
					modelList = append(modelList, old)
					break
				}
			}
		}
		return modelList, nil
	}

	modelList := make([]*Model, 0, len(ids))

	models, err := query.ModelInstance.WithContext(ctx).Unscoped().
		Where(query.ModelInstance.ID.In(ids...)).Find()
	if err != nil {
		return nil, err
	}

	for _, model := range models {
		m := c.toModel(ctx, model)
		modelList = append(modelList, m)
	}

	return modelList, nil
}

func (c *ModelConfig) GetModelByID(ctx context.Context, modelID int64) (*Model, error) {
	useOldModel, err := c.UseOldModelConf(ctx)
	if err != nil {
		return nil, fmt.Errorf("get use old model conf failed, err: %w", err)
	}

	if useOldModel {
		for _, old := range oldModels {
			if old.ID == modelID {
				return old, nil
			}
		}
		return nil, fmt.Errorf("model %d not found", modelID)
	}

	return c.getModelByID(ctx, modelID)
}

func (c *ModelConfig) getModelByID(ctx context.Context, modelID int64) (*Model, error) {
	m, err := query.ModelInstance.WithContext(ctx).
		Unscoped(). // allow get deleted data
		Where(query.ModelInstance.ID.Eq(modelID)).First()
	if err != nil {
		return nil, err
	}

	return c.toModel(ctx, m), nil
}

func (c *ModelConfig) toModel(ctx context.Context, q *model.ModelInstance) *Model {
	if q.Provider.IconURI != "" {
		url, err := c.oss.GetObjectUrl(ctx, q.Provider.IconURI)
		if err != nil {
			logs.CtxWarnf(ctx, "get model icon url failed, err: %v", err)
		} else {
			q.Provider.IconURL = url
		}
	}
	conn, err := decryptConn(ctx, q.Connection)
	if err != nil {
		logs.CtxWarnf(ctx, "decrypt model connection failed, err: %v", err)
	}

	extra := &ModelExtra{}
	if err := json.Unmarshal([]byte(q.Extra), extra); err != nil {
		logs.CtxWarnf(ctx, "unmarshal model extra (%s) failed, err: %v", q.Extra, err)
	}

	m := &Model{
		Model: &config.Model{
			ID:              q.ID,
			Provider:        q.Provider,
			DisplayInfo:     q.DisplayInfo,
			Connection:      conn,
			Type:            config.ModelType(q.Type),
			Capability:      q.Capability,
			Parameters:      q.Parameters,
			EnableBase64URL: extra.EnableBase64URL,
			DeleteAtMs:      q.DeletedAt.Time.UnixMilli(),
		},
	}

	m.Status = ternary.IFElse(q.DeletedAt.Time.IsZero(), config.ModelStatus_StatusInUse,
		config.ModelStatus_StatusDeleted)

	return m
}
