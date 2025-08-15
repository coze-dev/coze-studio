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

package dao

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/upload/entity"
	"github.com/coze-dev/coze-studio/backend/domain/upload/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/upload/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

type FilesDAO struct {
	DB    *gorm.DB
	Query *query.Query
}

func NewFilesDAO(db *gorm.DB) *FilesDAO {
	return &FilesDAO{
		DB:    db,
		Query: query.Use(db),
	}
}

func (dao *FilesDAO) Create(ctx context.Context, file *entity.File) error {
	f := dao.fromEntityToModel(file)
	return dao.Query.Files.WithContext(ctx).Create(f)
}

func (dao *FilesDAO) BatchCreate(ctx context.Context, files []*entity.File) error {
	if len(files) == 0 {
		return nil
	}
	return dao.Query.Files.WithContext(ctx).CreateInBatches(slices.Transform(files, dao.fromEntityToModel), len(files))
}

func (dao *FilesDAO) Delete(ctx context.Context, id int64) error {
	_, err := dao.Query.Files.WithContext(ctx).Where(dao.Query.Files.ID.Eq(id)).Delete()
	return err
}

func (dao *FilesDAO) GetByID(ctx context.Context, id int64) (*entity.File, error) {
	file, err := dao.Query.Files.WithContext(ctx).Where(dao.Query.Files.ID.Eq(id)).First()
	if err != nil {
		return nil, err
	}
	return dao.fromModelToEntity(file), nil
}

func (dao *FilesDAO) MGetByIDs(ctx context.Context, ids []int64) ([]*entity.File, error) {
	if len(ids) == 0 {
		return nil, nil
	}
	files, err := dao.Query.Files.WithContext(ctx).Where(dao.Query.Files.ID.In(ids...)).Find()
	if err != nil {
		return nil, err
	}
	return slices.Transform(files, dao.fromModelToEntity), nil
}

func (dao *FilesDAO) fromModelToEntity(model *model.Files) *entity.File {
	if model == nil {
		return nil
	}
	return &entity.File{
		ID:            model.ID,
		Name:          model.Name,
		FileSize:      model.FileSize,
		TosURI:        model.TosURI,
		Status:        entity.FileStatus(model.Status),
		Comment:       model.Comment,
		Source:        entity.FileSource(model.Source),
		CreatorID:     model.CreatorID,
		CozeAccountID: model.CozeAccountID,
		ContentType:   model.ContentType,
		CreatedAt:     model.CreatedAt,
		UpdatedAt:     model.UpdatedAt,
	}
}

func (dao *FilesDAO) fromEntityToModel(entity *entity.File) *model.Files {
	return &model.Files{
		ID:            entity.ID,
		Name:          entity.Name,
		FileSize:      entity.FileSize,
		TosURI:        entity.TosURI,
		Status:        int32(entity.Status),
		Comment:       entity.Comment,
		Source:        int32(entity.Source),
		CreatorID:     entity.CreatorID,
		CozeAccountID: entity.CozeAccountID,
		ContentType:   entity.ContentType,
		CreatedAt:     entity.CreatedAt,
		UpdatedAt:     entity.UpdatedAt,
	}
}
