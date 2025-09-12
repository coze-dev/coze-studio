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

package external_knowledge

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/external_knowledge"
)

// RepositoryImpl implements the external knowledge repository interface
type RepositoryImpl struct {
	db *gorm.DB
}

// NewRepository creates a new external knowledge repository
func NewRepository(db *gorm.DB) external_knowledge.Repository {
	return &RepositoryImpl{db: db}
}

// Create creates a new external knowledge binding
func (r *RepositoryImpl) Create(ctx context.Context, binding *external_knowledge.ExternalKnowledgeBinding) (*external_knowledge.ExternalKnowledgeBinding, error) {
	if err := r.db.WithContext(ctx).Create(binding).Error; err != nil {
		return nil, err
	}
	return binding, nil
}

// GetByID retrieves a binding by ID
func (r *RepositoryImpl) GetByID(ctx context.Context, id int64) (*external_knowledge.ExternalKnowledgeBinding, error) {
	var binding external_knowledge.ExternalKnowledgeBinding
	if err := r.db.WithContext(ctx).First(&binding, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &binding, nil
}

// GetByUserID retrieves all bindings for a user with pagination
func (r *RepositoryImpl) GetByUserID(ctx context.Context, userID string, offset, limit int, status *int8) ([]*external_knowledge.ExternalKnowledgeBinding, int64, error) {
	var bindings []*external_knowledge.ExternalKnowledgeBinding
	var total int64

	query := r.db.WithContext(ctx).Model(&external_knowledge.ExternalKnowledgeBinding{}).Where("user_id = ?", userID)
	
	if status != nil {
		query = query.Where("status = ?", *status)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Fetch with pagination
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&bindings).Error; err != nil {
		return nil, 0, err
	}

	return bindings, total, nil
}

// GetByUserIDAndKey retrieves a binding by user ID and binding key
func (r *RepositoryImpl) GetByUserIDAndKey(ctx context.Context, userID, bindingKey string) (*external_knowledge.ExternalKnowledgeBinding, error) {
	var binding external_knowledge.ExternalKnowledgeBinding
	if err := r.db.WithContext(ctx).Where("user_id = ? AND binding_key = ?", userID, bindingKey).First(&binding).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &binding, nil
}

// Update updates an existing binding
func (r *RepositoryImpl) Update(ctx context.Context, binding *external_knowledge.ExternalKnowledgeBinding) error {
	return r.db.WithContext(ctx).Save(binding).Error
}

// Delete deletes a binding by ID
func (r *RepositoryImpl) Delete(ctx context.Context, id int64) error {
	return r.db.WithContext(ctx).Delete(&external_knowledge.ExternalKnowledgeBinding{}, id).Error
}

// DeleteByUserIDAndID deletes a binding by user ID and binding ID
func (r *RepositoryImpl) DeleteByUserIDAndID(ctx context.Context, userID string, id int64) error {
	return r.db.WithContext(ctx).Where("user_id = ? AND id = ?", userID, id).Delete(&external_knowledge.ExternalKnowledgeBinding{}).Error
}

// DisableAllByUserID disables all bindings for a user
func (r *RepositoryImpl) DisableAllByUserID(ctx context.Context, userID string) error {
	return r.db.WithContext(ctx).Model(&external_knowledge.ExternalKnowledgeBinding{}).
		Where("user_id = ? AND status = ?", userID, external_knowledge.BindingStatusEnabled).
		Update("status", external_knowledge.BindingStatusDisabled).Error
}