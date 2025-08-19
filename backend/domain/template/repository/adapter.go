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
	
	"github.com/coze-dev/coze-studio/backend/domain/template/entity"
	"github.com/coze-dev/coze-studio/backend/domain/template/internal/dal/model"
)

// TemplateRepositoryAdapter provides a public interface for template repository
type TemplateRepositoryAdapter interface {
	// Create creates a new template
	Create(ctx context.Context, template *entity.TemplateModel) (int64, error)

	// List lists templates with filters
	List(ctx context.Context, filter *entity.TemplateFilter, page *entity.Pagination, orderByField string) ([]*entity.TemplateModel, int64, error)
	
	// Update updates an existing template
	Update(ctx context.Context, template *entity.TemplateModel) error
	
	// GetByID gets a template by ID
	GetByID(ctx context.Context, id int64) (*entity.TemplateModel, error)
	
	// Delete deletes a template by ID
	Delete(ctx context.Context, id int64) error
}

// templateRepositoryAdapter wraps the internal repository
type templateRepositoryAdapter struct {
	repo TemplateRepository
}

// NewTemplateRepositoryAdapter creates a new adapter
func NewTemplateRepositoryAdapter(repo TemplateRepository) TemplateRepositoryAdapter {
	return &templateRepositoryAdapter{repo: repo}
}

// Create creates a new template
func (a *templateRepositoryAdapter) Create(ctx context.Context, template *entity.TemplateModel) (int64, error) {
	// Convert entity.TemplateModel to model.Template
	internalModel := &model.Template{
		ID:                template.ID,
		AgentID:           template.AgentID,
		SpaceID:           template.SpaceID,
		CreatedAt:         template.CreatedAt,
		Heat:              template.Heat,
		ProductEntityType: template.ProductEntityType,
		MetaInfo:          template.MetaInfo,
		PluginExtra:       template.PluginExtra,
		AgentExtra:        template.AgentExtra,
		WorkflowExtra:     template.WorkflowExtra,
		ProjectExtra:      template.ProjectExtra,
	}
	return a.repo.Create(ctx, internalModel)
}

// List lists templates with filters
func (a *templateRepositoryAdapter) List(ctx context.Context, filter *entity.TemplateFilter, page *entity.Pagination, orderByField string) ([]*entity.TemplateModel, int64, error) {
	internalModels, total, err := a.repo.List(ctx, filter, page, orderByField)
	if err != nil {
		return nil, 0, err
	}
	
	// Convert []*model.Template to []*entity.TemplateModel
	result := make([]*entity.TemplateModel, len(internalModels))
	for i, m := range internalModels {
		result[i] = &entity.TemplateModel{
			ID:                m.ID,
			AgentID:           m.AgentID,
			SpaceID:           m.SpaceID,
			CreatedAt:         m.CreatedAt,
			Heat:              m.Heat,
			ProductEntityType: m.ProductEntityType,
			MetaInfo:          m.MetaInfo,
			PluginExtra:       m.PluginExtra,
			AgentExtra:        m.AgentExtra,
			WorkflowExtra:     m.WorkflowExtra,
			ProjectExtra:      m.ProjectExtra,
		}
	}
	return result, total, nil
}

// Update updates an existing template
func (a *templateRepositoryAdapter) Update(ctx context.Context, template *entity.TemplateModel) error {
	// Convert entity.TemplateModel to model.Template
	internalModel := &model.Template{
		ID:                template.ID,
		AgentID:           template.AgentID,
		SpaceID:           template.SpaceID,
		CreatedAt:         template.CreatedAt,
		Heat:              template.Heat,
		ProductEntityType: template.ProductEntityType,
		MetaInfo:          template.MetaInfo,
		PluginExtra:       template.PluginExtra,
		AgentExtra:        template.AgentExtra,
		WorkflowExtra:     template.WorkflowExtra,
		ProjectExtra:      template.ProjectExtra,
	}
	return a.repo.Update(ctx, internalModel)
}

// GetByID gets a template by ID
func (a *templateRepositoryAdapter) GetByID(ctx context.Context, id int64) (*entity.TemplateModel, error) {
	internalModel, err := a.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	
	// Convert model.Template to entity.TemplateModel
	return &entity.TemplateModel{
		ID:                internalModel.ID,
		AgentID:           internalModel.AgentID,
		SpaceID:           internalModel.SpaceID,
		CreatedAt:         internalModel.CreatedAt,
		Heat:              internalModel.Heat,
		ProductEntityType: internalModel.ProductEntityType,
		MetaInfo:          internalModel.MetaInfo,
		PluginExtra:       internalModel.PluginExtra,
		AgentExtra:        internalModel.AgentExtra,
		WorkflowExtra:     internalModel.WorkflowExtra,
		ProjectExtra:      internalModel.ProjectExtra,
	}, nil
}

// Delete deletes a template by ID
func (a *templateRepositoryAdapter) Delete(ctx context.Context, id int64) error {
	return a.repo.Delete(ctx, id)
}