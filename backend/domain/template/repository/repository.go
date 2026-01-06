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

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/template/internal/dal"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"

	"github.com/coze-dev/coze-studio/backend/domain/template/entity"

	"github.com/coze-dev/coze-studio/backend/domain/template/internal/dal/model"
)

func NewTemplateDAO(db *gorm.DB, idGen idgen.IDGenerator) TemplateRepository {
	return dal.NewTemplateDAO(db, idGen)
}

// TemplateRepository defines the interface for template operations
type TemplateRepository interface {
	// Create creates a new template
	Create(ctx context.Context, template *model.Template) (int64, error)

	// List lists templates with filters
	List(ctx context.Context, filter *entity.TemplateFilter, page *entity.Pagination, orderByField string) ([]*model.Template, int64, error)
}
