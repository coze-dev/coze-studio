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

	"github.com/coze-dev/coze-studio/backend/domain/prompt/entity"
	"github.com/coze-dev/coze-studio/backend/domain/prompt/internal/dal"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
)

func NewPromptRepo(db *gorm.DB, generator idgen.IDGenerator) PromptRepository {
	return dal.NewPromptDAO(db, generator)
}

type PromptRepository interface {
	CreatePromptResource(ctx context.Context, do *entity.PromptResource) (int64, error)
	GetPromptResource(ctx context.Context, promptID int64) (*entity.PromptResource, error)
	UpdatePromptResource(ctx context.Context, promptID int64, name, description, promptText *string) error
	DeletePromptResource(ctx context.Context, ID int64) error
}
