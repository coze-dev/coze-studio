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

	"github.com/coze-dev/coze-studio/backend/domain/upload/entity"
	"github.com/coze-dev/coze-studio/backend/domain/upload/internal/dal/dao"
)

func NewFilesRepo(db *gorm.DB) FilesRepo {
	return dao.NewFilesDAO(db)
}

//go:generate mockgen -destination ../internal/mock/dal/dao/knowledge_document.go --package dao -source knowledge_document.go
type FilesRepo interface {
	Create(ctx context.Context, file *entity.File) error
	BatchCreate(ctx context.Context, files []*entity.File) error
	Delete(ctx context.Context, id int64) error
	GetByID(ctx context.Context, id int64) (*entity.File, error)
	MGetByIDs(ctx context.Context, ids []int64) ([]*entity.File, error)
}
