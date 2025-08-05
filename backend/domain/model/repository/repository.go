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

package repository

import (
	"context"
	"encoding/json"
	"fmt"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/model/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type ModelRepository interface {
	GetSpaceModels(ctx context.Context, spaceID uint64) ([]*entity.SpaceModelView, error)
}

type modelRepository struct {
	db *gorm.DB
}

func NewModelRepository(db *gorm.DB) ModelRepository {
	return &modelRepository{
		db: db,
	}
}

func (r *modelRepository) GetSpaceModels(ctx context.Context, spaceID uint64) ([]*entity.SpaceModelView, error) {
	type queryResult struct {
		EntityID     uint64  `json:"entity_id"`
		Name         string  `json:"name"`
		Description  *string `json:"description"`
		Capability   *string `json:"capability"`
		IconURI      string  `json:"icon_uri"`
		Protocol     string  `json:"protocol"`
		CustomConfig *string `json:"custom_config"`
	}

	var results []queryResult
	
	query := r.db.WithContext(ctx).
		Table("space_model sm").
		Select(`
			me.id as entity_id,
			me.name,
			me.description,
			mm.capability,
			mm.icon_uri,
			mm.protocol,
			sm.custom_config
		`).
		Joins("JOIN model_entity me ON sm.model_entity_id = me.id").
		Joins("JOIN model_meta mm ON me.meta_id = mm.id").
		Where("sm.space_id = ?", spaceID).
		Where("sm.status = ?", 1).
		Where("sm.deleted_at IS NULL").
		Where("me.status = ?", 1).
		Where("me.deleted_at IS NULL").
		Where("mm.status = ?", 1).
		Where("mm.deleted_at IS NULL").
		Order("sm.created_at DESC")

	// 添加调试日志 - 打印SQL语句
	sqlStr := query.ToSQL(func(tx *gorm.DB) *gorm.DB {
		return tx.Scan(&results)
	})
	logs.Infof("GetSpaceModels SQL: %s, spaceID: %d", sqlStr, spaceID)

	if err := query.Scan(&results).Error; err != nil {
		return nil, fmt.Errorf("failed to query space models: %w", err)
	}

	logs.Infof("GetSpaceModels query results count: %d", len(results))

	spaceModels := make([]*entity.SpaceModelView, 0, len(results))
	for _, result := range results {
		model := &entity.SpaceModelView{
			ID:       fmt.Sprintf("%d", result.EntityID),
			Name:     result.Name,
			IconURI:  result.IconURI,
			Protocol: result.Protocol,
		}

		// 处理描述信息，提取中文描述
		if result.Description != nil {
			var descMap map[string]string
			if err := json.Unmarshal([]byte(*result.Description), &descMap); err == nil {
				if zhDesc, exists := descMap["zh"]; exists && zhDesc != "" {
					model.Description = zhDesc
				} else if enDesc, exists := descMap["en"]; exists && enDesc != "" {
					model.Description = enDesc
				}
			} else {
				// 如果不是 JSON 格式，直接使用原始描述
				model.Description = *result.Description
			}
		}

		// 处理能力信息，提取上下文长度
		if result.Capability != nil {
			var capMap map[string]interface{}
			if err := json.Unmarshal([]byte(*result.Capability), &capMap); err == nil {
				if inputTokens, exists := capMap["input_tokens"]; exists {
					switch v := inputTokens.(type) {
					case float64:
						model.ContextLength = int64(v)
					case int64:
						model.ContextLength = v
					case int:
						model.ContextLength = int64(v)
					}
				}
			}
		}

		// 处理自定义配置
		if result.CustomConfig != nil {
			var customMap map[string]interface{}
			if err := json.Unmarshal([]byte(*result.CustomConfig), &customMap); err == nil {
				model.CustomConfig = customMap
			}
		}

		spaceModels = append(spaceModels, model)
	}

	return spaceModels, nil
}