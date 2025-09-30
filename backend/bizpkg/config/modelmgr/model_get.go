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
	"fmt"

	config "github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr/internal/model"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr/internal/query"
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
		// m.Connection = nil
		m.Parameters = nil
		modelClass2Models[model.Provider.ModelClass] = append(modelClass2Models[model.Provider.ModelClass], m.Model)
	}

	for _, provider := range modelProviderList {
		for _, model := range modelClass2Models[provider.ModelClass] {
			if provider.IconURL == "" {
				provider.IconURL = model.Provider.IconURL
			}
			model.Provider = nil
		}

		res = append(res, &config.ProviderModelList{
			Provider:  provider,
			ModelList: modelClass2Models[provider.ModelClass],
		})
	}

	return res, nil
}

func (c *ModelConfig) GetModelList(ctx context.Context) ([]*Model, error) {
	useOldModel, err := c.UseOldModelConf(ctx)
	if err != nil {
		return nil, fmt.Errorf("get use old model conf failed, err: %w", err)
	}

	if useOldModel {
		return oldModels, nil
	}

	allModels, err := query.ModelInstance.WithContext(ctx).
		Where(query.ModelInstance.DeletedAt.IsNull()).Find()
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

func (c *ModelConfig) GetModelListWithLimit(ctx context.Context, limit int) ([]*Model, error) {
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

	allModels, err := query.ModelInstance.WithContext(ctx).
		Where(query.ModelInstance.DeletedAt.IsNull()).Limit(limit).Find()
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

	models, err := query.ModelInstance.WithContext(ctx).
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

	m := &Model{
		Model: &config.Model{
			ID:          q.ID,
			Provider:    q.Provider,
			DisplayInfo: q.DisplayInfo,
			Connection:  conn,
			Status:      config.ModelStatus_StatusInUse,
			Type:        config.ModelType(q.Type),
			Capability:  q.Capability,
			Parameters:  q.Parameters,
		},
	}

	return m
}
