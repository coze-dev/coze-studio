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
)

type ModelService interface {
	ListSpaceModels(ctx context.Context, spaceID uint64) ([]*entity.SpaceModelView, error)
}

type modelService struct {
	repo repository.ModelRepository
}

func NewModelService(repo repository.ModelRepository) ModelService {
	return &modelService{
		repo: repo,
	}
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
	}

	return models, nil
}