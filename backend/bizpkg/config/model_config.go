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

package config

import (
	"context"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/internal/model"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/internal/query"
)

/*
-- Create 'model_instance' table
CREATE TABLE IF NOT EXISTS `model_instance` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'id',
  `type` tinyint NOT NULL COMMENT 'Model Type 0-LLM 1-TextEmbedding 2-Rerank ',
  `provider` json NOT NULL COMMENT 'Provider Information',
  `display_info` json NOT NULL COMMENT 'Display Information',
  `connection` json NOT NULL COMMENT 'Connection Information',
  `capability` json NOT NULL COMMENT 'Model Capability',
  `parameters` json NOT NULL COMMENT 'Model Parameters',
  `extra` json COMMENT 'Extra Information',
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
  `deleted_at` datetime(3) NULL COMMENT 'Delete Time',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Model Instance Management Table';

*/

func (c *Config) GetProviderModelList(ctx context.Context) ([]*config.ProviderModelList, error) {
	modelProviderList := ModelProviders()
	res := make([]*config.ProviderModelList, 0, len(modelProviderList))

	allModels, err := query.ModelInstance.WithContext(ctx).
		Where(query.ModelInstance.DeletedAt.IsNull()).Find()
	if err != nil {
		return nil, err
	}

	modelClass2Models := make(map[developer_api.ModelClass][]*config.Model)
	for _, model := range allModels {
		m := toModel(model)
		modelClass2Models[model.Provider.ModelClass] = append(modelClass2Models[model.Provider.ModelClass], m)
	}

	for _, provider := range modelProviderList {
		res = append(res, &config.ProviderModelList{
			Provider:  provider,
			ModelList: modelClass2Models[provider.ModelClass],
		})
	}

	return res, nil
}

func (c *Config) GetModelList(ctx context.Context) ([]*config.Model, error) {
	allModels, err := query.ModelInstance.WithContext(ctx).
		Where(query.ModelInstance.DeletedAt.IsNull()).Find()
	if err != nil {
		return nil, err
	}

	modelList := make([]*config.Model, 0, len(allModels))
	for _, model := range allModels {
		m := toModel(model)
		modelList = append(modelList, m)
	}

	return modelList, nil
}

func (c *Config) CreateModel(ctx context.Context, modelClass developer_api.ModelClass, modelName string, conn *config.Connection) (int64, error) {
	if conn == nil {
		return 0, fmt.Errorf("connection is nil")
	}

	provider, ok := GetModelProvider(modelClass)
	if !ok {
		return 0, fmt.Errorf("model class %s not supported", modelClass)
	}

	conn, err := encryptConn(ctx, conn)
	if err != nil {
		return 0, err
	}

	// TODO : check conn
	q := query.ModelInstance.WithContext(ctx)
	m := &model.ModelInstance{
		Type:        1,
		Provider:    provider,
		Connection:  conn,
		DisplayInfo: &config.DisplayInfo{},
		Capability:  &developer_api.ModelAbility{},
		Parameters:  []*developer_api.ModelParameter{},
		Extra:       "{}",
	}

	err = q.Create(m)
	if err != nil {
		return 0, err
	}

	return m.ID, nil
}

func (c *Config) DeleteModel(ctx context.Context, modelID int64) error {
	q := query.ModelInstance.WithContext(ctx)
	_, err := q.Where(query.ModelInstance.ID.Eq(modelID)).Delete()
	return err
}

func (c *Config) GetModel(ctx context.Context, modelID int64) (*config.Model, error) {
	q := query.ModelInstance.WithContext(ctx)

	m, err := q.Where(query.ModelInstance.ID.Eq(modelID)).First()
	if err != nil {
		return nil, err
	}

	conn, err := decryptConn(ctx, m.Connection)
	if err != nil {
		return nil, err
	}

	m.Connection = conn

	return toModel(m), nil
}

func toModel(q *model.ModelInstance) *config.Model {
	return &config.Model{
		ID:          q.ID,
		Provider:    q.Provider,
		DisplayInfo: q.DisplayInfo,
		Capability:  q.Capability,
		Connection:  q.Connection,
		Type:        config.ModelType(q.Type),
		Parameters:  q.Parameters,
	}
}

func encryptConn(ctx context.Context, conn *config.Connection) (*config.Connection, error) {
	// encrypt conn if you need
	return conn, nil
}

func decryptConn(ctx context.Context, conn *config.Connection) (*config.Connection, error) {
	return conn, nil
}
