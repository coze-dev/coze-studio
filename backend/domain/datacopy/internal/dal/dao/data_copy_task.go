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
	"gorm.io/gorm/clause"

	"github.com/coze-dev/coze-studio/backend/domain/datacopy/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/datacopy/internal/dal/query"
)

type DataCopyTaskRepo interface {
	UpsertCopyTask(ctx context.Context, task *model.DataCopyTask) error
	UpsertCopyTaskWithTX(ctx context.Context, task *model.DataCopyTask, tx *gorm.DB) error
	GetCopyTask(ctx context.Context, taskID string, originDataID int64, dataType int32) (*model.DataCopyTask, error)
}
type dataCopyTaskDAO struct {
	db    *gorm.DB
	query *query.Query
}

func NewDataCopyTaskDAO(db *gorm.DB) DataCopyTaskRepo {
	return &dataCopyTaskDAO{db: db, query: query.Use(db)}
}

func (dao *dataCopyTaskDAO) UpsertCopyTask(ctx context.Context, task *model.DataCopyTask) error {
	return dao.query.DataCopyTask.WithContext(ctx).Debug().Clauses(
		clause.OnConflict{
			UpdateAll: true,
		},
	).Create(task)
}

func (dao *dataCopyTaskDAO) GetCopyTask(ctx context.Context, taskID string, originDataID int64, dataType int32) (*model.DataCopyTask, error) {
	q := dao.query.DataCopyTask
	return q.WithContext(ctx).Debug().Where(q.MasterTaskID.Eq(taskID)).Where(q.OriginDataID.Eq(originDataID)).Where(q.DataType.Eq(dataType)).First()
}

func (dao *dataCopyTaskDAO) UpsertCopyTaskWithTX(ctx context.Context, task *model.DataCopyTask, tx *gorm.DB) error {
	return tx.WithContext(ctx).Model(&model.DataCopyTask{}).Debug().Clauses(
		clause.OnConflict{
			// UpdateAll: true,
			Columns: []clause.Column{},
		},
	).Create(task).Error
}
