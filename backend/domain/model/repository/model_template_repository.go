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
	"fmt"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/model/entity"
)

type ModelTemplateRepository interface {
	// GetAll 获取所有模板
	GetAll(ctx context.Context) ([]*entity.ModelTemplate, error)
	// GetByID 根据ID获取模板
	GetByID(ctx context.Context, id uint64) (*entity.ModelTemplate, error)
	// GetByProvider 根据Provider获取模板
	GetByProvider(ctx context.Context, provider string) (*entity.ModelTemplate, error)
}

type modelTemplateRepository struct {
	db *gorm.DB
}

func NewModelTemplateRepository(db *gorm.DB) ModelTemplateRepository {
	return &modelTemplateRepository{
		db: db,
	}
}

// GetAll 获取所有模板
func (r *modelTemplateRepository) GetAll(ctx context.Context) ([]*entity.ModelTemplate, error) {
	var templates []*entity.ModelTemplate
	err := r.db.WithContext(ctx).
		Where("deleted_at IS NULL").
		Order("id ASC").
		Find(&templates).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get all templates: %w", err)
	}
	return templates, nil
}

// GetByID 根据ID获取模板
func (r *modelTemplateRepository) GetByID(ctx context.Context, id uint64) (*entity.ModelTemplate, error) {
	var template entity.ModelTemplate
	err := r.db.WithContext(ctx).
		Where("id = ? AND deleted_at IS NULL", id).
		First(&template).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("template not found")
		}
		return nil, fmt.Errorf("failed to get template by id: %w", err)
	}
	return &template, nil
}

// GetByProvider 根据Provider获取模板
func (r *modelTemplateRepository) GetByProvider(ctx context.Context, provider string) (*entity.ModelTemplate, error) {
	var template entity.ModelTemplate
	err := r.db.WithContext(ctx).
		Where("provider = ? AND deleted_at IS NULL", provider).
		First(&template).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("template not found")
		}
		return nil, fmt.Errorf("failed to get template by provider: %w", err)
	}
	return &template, nil
}