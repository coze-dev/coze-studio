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

package service

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/domain/model/entity"
	"github.com/coze-dev/coze-studio/backend/domain/model/repository"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type ModelService interface {
	// 查询操作
	ListSpaceModels(ctx context.Context, spaceID uint64) ([]*entity.SpaceModelView, error)
	GetModel(ctx context.Context, modelID uint64) (*entity.ModelEntity, *entity.ModelMeta, error)

	// 创建操作
	CreateModel(ctx context.Context, model *entity.ModelEntity, meta *entity.ModelMeta) error

	// 更新操作
	UpdateModel(ctx context.Context, model *entity.ModelEntity) error
	UpdateModelMeta(ctx context.Context, meta *entity.ModelMeta) error

	// 删除操作
	DeleteModel(ctx context.Context, modelID uint64) error

	// 空间模型管理
	AddModelToSpace(ctx context.Context, spaceID, modelID, userID uint64) error
	RemoveModelFromSpace(ctx context.Context, spaceID, modelID uint64) error
	UpdateSpaceModelConfig(ctx context.Context, spaceID, modelID uint64, config map[string]interface{}) error
}

type modelService struct {
	repo      repository.ModelRepository
	tosClient storage.Storage
}

func NewModelService(repo repository.ModelRepository, tosClient storage.Storage) ModelService {
	return &modelService{
		repo:      repo,
		tosClient: tosClient,
	}
}

// GetModel 获取模型详情
func (s *modelService) GetModel(ctx context.Context, modelID uint64) (*entity.ModelEntity, *entity.ModelMeta, error) {
	model, err := s.repo.GetModelByID(ctx, modelID)
	if err != nil {
		return nil, nil, err
	}

	meta, err := s.repo.GetModelMetaByID(ctx, model.MetaID)
	if err != nil {
		return nil, nil, err
	}

	return model, meta, nil
}

// CreateModel 创建模型（事务操作）
func (s *modelService) CreateModel(ctx context.Context, model *entity.ModelEntity, meta *entity.ModelMeta) error {
	// 先创建 ModelMeta
	if err := s.repo.CreateModelMeta(ctx, meta); err != nil {
		return err
	}

	// 设置 MetaID
	model.MetaID = meta.ID

	// 创建 ModelEntity
	if err := s.repo.CreateModel(ctx, model); err != nil {
		// 如果创建失败，应该回滚 ModelMeta 的创建
		// 这里简化处理，实际应该使用事务
		return err
	}

	return nil
}

// UpdateModel 更新模型实体
func (s *modelService) UpdateModel(ctx context.Context, model *entity.ModelEntity) error {
	// 验证模型是否存在
	existing, err := s.repo.GetModelByID(ctx, model.ID)
	if err != nil {
		return err
	}

	// 保留一些不应该被更新的字段
	model.MetaID = existing.MetaID
	model.CreatedAt = existing.CreatedAt

	return s.repo.UpdateModel(ctx, model)
}

// UpdateModelMeta 更新模型元数据
func (s *modelService) UpdateModelMeta(ctx context.Context, meta *entity.ModelMeta) error {
	// 验证元数据是否存在
	existing, err := s.repo.GetModelMetaByID(ctx, meta.ID)
	if err != nil {
		return err
	}

	// 保留创建时间
	meta.CreatedAt = existing.CreatedAt

	return s.repo.UpdateModelMeta(ctx, meta)
}

// DeleteModel 删除模型（级联删除）
func (s *modelService) DeleteModel(ctx context.Context, modelID uint64) error {
	// 获取模型信息
	model, err := s.repo.GetModelByID(ctx, modelID)
	if err != nil {
		return err
	}

	// 删除模型实体
	if err := s.repo.DeleteModel(ctx, modelID); err != nil {
		return err
	}

	// 删除模型元数据
	if err := s.repo.DeleteModelMeta(ctx, model.MetaID); err != nil {
		return err
	}

	return nil
}

// AddModelToSpace 将模型添加到空间
func (s *modelService) AddModelToSpace(ctx context.Context, spaceID, modelID, userID uint64) error {
	// 验证模型是否存在
	_, err := s.repo.GetModelByID(ctx, modelID)
	if err != nil {
		return err
	}

	spaceModel := &entity.SpaceModel{
		SpaceID:       spaceID,
		ModelEntityID: modelID,
		UserID:        userID,
		Status:        1, // 默认启用
	}

	return s.repo.AddModelToSpace(ctx, spaceModel)
}

// RemoveModelFromSpace 从空间移除模型
func (s *modelService) RemoveModelFromSpace(ctx context.Context, spaceID, modelID uint64) error {
	return s.repo.RemoveModelFromSpace(ctx, spaceID, modelID)
}

// UpdateSpaceModelConfig 更新空间模型配置
func (s *modelService) UpdateSpaceModelConfig(ctx context.Context, spaceID, modelID uint64, config map[string]interface{}) error {
	return s.repo.UpdateSpaceModelConfig(ctx, spaceID, modelID, config)
}

func (s *modelService) ListSpaceModels(ctx context.Context, spaceID uint64) ([]*entity.SpaceModelView, error) {
	models, err := s.repo.GetSpaceModels(ctx, spaceID)
	if err != nil {
		return nil, err
	}

	// 可以在这里添加业务逻辑处理
	// 例如：过滤、排序、数据转换等
	for _, model := range models {
		// 确保描述不为空，提供默认描述
		if model.Description == "" {
			model.Description = "暂无描述"
		}

		// 确保上下文长度有合理的显示
		if model.ContextLength <= 0 {
			model.ContextLength = 0
		}

		// 生成图标的签名URL
		if model.IconURI != "" && s.tosClient != nil {
			iconURL, err := s.tosClient.GetObjectUrl(ctx, model.IconURI)
			if err != nil {
				// 记录错误但不中断流程
				logs.CtxWarnf(ctx, "failed to get icon url for model %s: %v", model.ID, err)
			} else {
				model.IconURL = iconURL
			}
		}
	}

	return models, nil
}
