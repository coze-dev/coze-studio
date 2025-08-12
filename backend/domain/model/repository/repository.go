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
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/model/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type ModelRepository interface {
	// 查询操作
	GetSpaceModels(ctx context.Context, spaceID uint64) ([]*entity.SpaceModelView, error)
	GetModelByID(ctx context.Context, modelID uint64) (*entity.ModelEntity, error)
	GetModelMetaByID(ctx context.Context, metaID uint64) (*entity.ModelMeta, error)

	// 创建操作
	CreateModel(ctx context.Context, model *entity.ModelEntity) error
	CreateModelMeta(ctx context.Context, meta *entity.ModelMeta) error

	// 更新操作
	UpdateModel(ctx context.Context, model *entity.ModelEntity) error
	UpdateModelMeta(ctx context.Context, meta *entity.ModelMeta) error

	// 删除操作（软删除）
	DeleteModel(ctx context.Context, modelID uint64) error
	DeleteModelMeta(ctx context.Context, metaID uint64) error

	// 空间模型关联
	AddModelToSpace(ctx context.Context, spaceModel *entity.SpaceModel) error
	RemoveModelFromSpace(ctx context.Context, spaceID, modelID uint64) error
	UpdateSpaceModelConfig(ctx context.Context, spaceID, modelID uint64, config map[string]interface{}) error
}

type modelRepository struct {
	db *gorm.DB
}

func NewModelRepository(db *gorm.DB) ModelRepository {
	return &modelRepository{
		db: db,
	}
}

// GetModelByID 根据ID获取模型实体
func (r *modelRepository) GetModelByID(ctx context.Context, modelID uint64) (*entity.ModelEntity, error) {
	var model entity.ModelEntity
	err := r.db.WithContext(ctx).
		Where("id = ? AND deleted_at IS NULL", modelID).
		First(&model).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get model by id: %w", err)
	}
	return &model, nil
}

// GetModelMetaByID 根据ID获取模型元数据
func (r *modelRepository) GetModelMetaByID(ctx context.Context, metaID uint64) (*entity.ModelMeta, error) {
	var meta entity.ModelMeta
	err := r.db.WithContext(ctx).
		Where("id = ? AND deleted_at IS NULL", metaID).
		First(&meta).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get model meta by id: %w", err)
	}
	return &meta, nil
}

// CreateModel 创建模型实体
func (r *modelRepository) CreateModel(ctx context.Context, model *entity.ModelEntity) error {
	if model.CreatedAt == 0 {
		model.CreatedAt = uint64(time.Now().UnixMilli())
	}
	model.UpdatedAt = model.CreatedAt

	err := r.db.WithContext(ctx).Create(model).Error
	if err != nil {
		return fmt.Errorf("failed to create model: %w", err)
	}
	return nil
}

// CreateModelMeta 创建模型元数据
func (r *modelRepository) CreateModelMeta(ctx context.Context, meta *entity.ModelMeta) error {
	if meta.CreatedAt == 0 {
		meta.CreatedAt = uint64(time.Now().UnixMilli())
	}
	meta.UpdatedAt = meta.CreatedAt

	err := r.db.WithContext(ctx).Create(meta).Error
	if err != nil {
		return fmt.Errorf("failed to create model meta: %w", err)
	}
	return nil
}

// UpdateModel 更新模型实体
func (r *modelRepository) UpdateModel(ctx context.Context, model *entity.ModelEntity) error {
	model.UpdatedAt = uint64(time.Now().UnixMilli())

	err := r.db.WithContext(ctx).
		Model(&entity.ModelEntity{}).
		Where("id = ? AND deleted_at IS NULL", model.ID).
		Updates(model).Error
	if err != nil {
		return fmt.Errorf("failed to update model: %w", err)
	}
	return nil
}

// UpdateModelMeta 更新模型元数据
func (r *modelRepository) UpdateModelMeta(ctx context.Context, meta *entity.ModelMeta) error {
	meta.UpdatedAt = uint64(time.Now().UnixMilli())

	err := r.db.WithContext(ctx).
		Model(&entity.ModelMeta{}).
		Where("id = ? AND deleted_at IS NULL", meta.ID).
		Updates(meta).Error
	if err != nil {
		return fmt.Errorf("failed to update model meta: %w", err)
	}
	return nil
}

// DeleteModel 软删除模型实体
func (r *modelRepository) DeleteModel(ctx context.Context, modelID uint64) error {
	now := uint64(time.Now().UnixMilli())

	err := r.db.WithContext(ctx).
		Model(&entity.ModelEntity{}).
		Where("id = ? AND deleted_at IS NULL", modelID).
		Updates(map[string]interface{}{
			"deleted_at": now,
			"updated_at": now,
		}).Error
	if err != nil {
		return fmt.Errorf("failed to delete model: %w", err)
	}
	return nil
}

// DeleteModelMeta 软删除模型元数据
func (r *modelRepository) DeleteModelMeta(ctx context.Context, metaID uint64) error {
	now := uint64(time.Now().UnixMilli())

	err := r.db.WithContext(ctx).
		Model(&entity.ModelMeta{}).
		Where("id = ? AND deleted_at IS NULL", metaID).
		Updates(map[string]interface{}{
			"deleted_at": now,
			"updated_at": now,
		}).Error
	if err != nil {
		return fmt.Errorf("failed to delete model meta: %w", err)
	}
	return nil
}

// AddModelToSpace 将模型添加到空间
func (r *modelRepository) AddModelToSpace(ctx context.Context, spaceModel *entity.SpaceModel) error {
	if spaceModel.CreatedAt == 0 {
		spaceModel.CreatedAt = uint64(time.Now().UnixMilli())
	}
	spaceModel.UpdatedAt = spaceModel.CreatedAt

	err := r.db.WithContext(ctx).Create(spaceModel).Error
	if err != nil {
		return fmt.Errorf("failed to add model to space: %w", err)
	}
	return nil
}

// RemoveModelFromSpace 从空间移除模型
func (r *modelRepository) RemoveModelFromSpace(ctx context.Context, spaceID, modelID uint64) error {
	now := uint64(time.Now().UnixMilli())

	err := r.db.WithContext(ctx).
		Model(&entity.SpaceModel{}).
		Where("space_id = ? AND model_entity_id = ? AND deleted_at IS NULL", spaceID, modelID).
		Updates(map[string]interface{}{
			"deleted_at": now,
			"updated_at": now,
		}).Error
	if err != nil {
		return fmt.Errorf("failed to remove model from space: %w", err)
	}
	return nil
}

// UpdateSpaceModelConfig 更新空间模型配置
func (r *modelRepository) UpdateSpaceModelConfig(ctx context.Context, spaceID, modelID uint64, config map[string]interface{}) error {
	configJSON, err := json.Marshal(config)
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	configStr := string(configJSON)
	now := uint64(time.Now().UnixMilli())

	err = r.db.WithContext(ctx).
		Model(&entity.SpaceModel{}).
		Where("space_id = ? AND model_entity_id = ? AND deleted_at IS NULL", spaceID, modelID).
		Updates(map[string]interface{}{
			"custom_config": configStr,
			"updated_at":    now,
		}).Error
	if err != nil {
		return fmt.Errorf("failed to update space model config: %w", err)
	}
	return nil
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
