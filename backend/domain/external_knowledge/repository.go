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
)

// Repository defines the interface for external knowledge binding repository
type Repository interface {
	// Create creates a new external knowledge binding
	Create(ctx context.Context, binding *ExternalKnowledgeBinding) (*ExternalKnowledgeBinding, error)

	// GetByID retrieves a binding by ID
	GetByID(ctx context.Context, id int64) (*ExternalKnowledgeBinding, error)

	// GetByUserID retrieves all bindings for a user
	GetByUserID(ctx context.Context, userID string, offset, limit int, status *int8) ([]*ExternalKnowledgeBinding, int64, error)

	// GetByUserIDAndKey retrieves a binding by user ID and binding key
	GetByUserIDAndKey(ctx context.Context, userID, bindingKey string) (*ExternalKnowledgeBinding, error)

	// Update updates an existing binding
	Update(ctx context.Context, binding *ExternalKnowledgeBinding) error

	// Delete deletes a binding by ID
	Delete(ctx context.Context, id int64) error

	// DeleteByUserIDAndID deletes a binding by user ID and binding ID
	DeleteByUserIDAndID(ctx context.Context, userID string, id int64) error

	// DisableAllByUserID disables all bindings for a user
	DisableAllByUserID(ctx context.Context, userID string) error
}