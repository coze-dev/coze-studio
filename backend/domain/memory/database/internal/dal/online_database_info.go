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

package dal

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/api/model/table"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/entity"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

var (
	onlineOnce      sync.Once
	singletonOnline *OlineImpl
)

type OlineImpl struct {
	IDGen idgen.IDGenerator
	query *query.Query
}

func NewOnlineDatabaseDAO(db *gorm.DB, idGen idgen.IDGenerator) *OlineImpl {
	onlineOnce.Do(func() {
		singletonOnline = &OlineImpl{
			IDGen: idGen,
			query: query.Use(db),
		}
	})

	return singletonOnline
}

func (o *OlineImpl) CreateWithTX(ctx context.Context, tx *query.QueryTx, database *entity.Database, draftID, onlineID int64, physicalTableName string) (*entity.Database, error) {
	now := time.Now().UnixMilli()
	onlineInfo := &model.OnlineDatabaseInfo{
		ID:             onlineID,
		AppID:          database.AppID,
		SpaceID:        database.SpaceID,
		RelatedDraftID: draftID,
		IsVisible:      1, // visible by default
		PromptDisabled: func() int32 {
			if database.PromptDisabled {
				return 1
			} else {
				return 0
			}
		}(),
		TableName_:        database.TableName,
		TableDesc:         database.TableDesc,
		TableField:        database.FieldList,
		CreatorID:         database.CreatorID,
		IconURI:           database.IconURI,
		PhysicalTableName: physicalTableName,
		RwMode:            int64(database.RwMode),
		CreatedAt:         now,
		UpdatedAt:         now,
	}

	table := tx.OnlineDatabaseInfo

	err := table.WithContext(ctx).Create(onlineInfo)
	if err != nil {
		return nil, err
	}

	database.CreatedAtMs = now
	database.UpdatedAtMs = now

	return database, nil
}

// Get online database information
func (o *OlineImpl) Get(ctx context.Context, id int64) (*entity.Database, error) {
	res := o.query.OnlineDatabaseInfo

	info, err := res.WithContext(ctx).Where(res.ID.Eq(id)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errorx.New(errno.ErrMemoryDatabaseNotFoundCode)
		}
		return nil, fmt.Errorf("query online database failed: %v", err)
	}

	db := &entity.Database{
		ID:        info.ID,
		SpaceID:   info.SpaceID,
		CreatorID: info.CreatorID,
		IconURI:   info.IconURI,

		AppID:           info.AppID,
		DraftID:         &info.RelatedDraftID,
		OnlineID:        &info.ID,
		IsVisible:       info.IsVisible == 1,
		PromptDisabled:  info.PromptDisabled == 1,
		TableName:       info.TableName_,
		TableDesc:       info.TableDesc,
		FieldList:       info.TableField,
		Status:          table.BotTableStatus_Online,
		ActualTableName: info.PhysicalTableName,
		RwMode:          table.BotTableRWMode(info.RwMode),
	}

	return db, nil
}

// UpdateWithTX updates online database information using transactions
func (o *OlineImpl) UpdateWithTX(ctx context.Context, tx *query.QueryTx, database *entity.Database) (*entity.Database, error) {
	fieldJson, err := json.Marshal(database.FieldList)
	if err != nil {
		return nil, fmt.Errorf("marshal field list failed: %v", err)
	}

	fieldJsonStr := string(fieldJson)
	now := time.Now().UnixMilli()

	// Build update content
	updates := map[string]interface{}{
		"app_id":      database.AppID,
		"table_name":  database.TableName,
		"table_desc":  database.TableDesc,
		"table_field": fieldJsonStr,
		"icon_uri":    database.IconURI,
		"prompt_disabled": func() int32 {
			if database.PromptDisabled {
				return 1
			}
			return 0
		}(),
		"rw_mode":    int64(database.RwMode),
		"updated_at": now,
	}

	// execute update
	res := tx.OnlineDatabaseInfo
	_, err = res.WithContext(ctx).Where(res.ID.Eq(database.ID)).Updates(updates)
	if err != nil {
		return nil, fmt.Errorf("update online database failed: %v", err)
	}

	_, err = res.WithContext(ctx).Where(res.ID.In(database.ID)).Updates(updates)

	database.UpdatedAtMs = now
	return database, nil
}

func (o *OlineImpl) DeleteWithTX(ctx context.Context, tx *query.QueryTx, id int64) error {
	res := tx.OnlineDatabaseInfo
	_, err := res.WithContext(ctx).Where(res.ID.Eq(id)).Delete(&model.OnlineDatabaseInfo{})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errorx.New(errno.ErrMemoryDatabaseNotFoundCode)
		}
		return fmt.Errorf("delete online database failed: %v", err)
	}

	return nil
}

// MGet batch acquisition of online database information
func (o *OlineImpl) MGet(ctx context.Context, ids []int64) ([]*entity.Database, error) {
	if len(ids) == 0 {
		return []*entity.Database{}, nil
	}

	res := o.query.OnlineDatabaseInfo

	// Query undeleted records with IDs in the given list
	records, err := res.WithContext(ctx).
		Where(res.ID.In(ids...)).
		Find()
	if err != nil {
		return nil, fmt.Errorf("batch query online database failed: %v", err)
	}

	// Build returns results
	databases := make([]*entity.Database, 0, len(records))
	for _, info := range records {
		db := &entity.Database{
			ID:        info.ID,
			SpaceID:   info.SpaceID,
			CreatorID: info.CreatorID,
			IconURI:   info.IconURI,

			AppID:           info.AppID,
			DraftID:         &info.RelatedDraftID,
			OnlineID:        &info.ID,
			IsVisible:       info.IsVisible == 1,
			PromptDisabled:  info.PromptDisabled == 1,
			TableName:       info.TableName_,
			TableDesc:       info.TableDesc,
			FieldList:       info.TableField,
			Status:          table.BotTableStatus_Online,
			ActualTableName: info.PhysicalTableName,
			RwMode:          table.BotTableRWMode(info.RwMode),

			CreatedAtMs: info.CreatedAt,
			UpdatedAtMs: info.UpdatedAt,
		}

		databases = append(databases, db)
	}

	return databases, nil
}

// List eligible database information
func (o *OlineImpl) List(ctx context.Context, filter *entity.DatabaseFilter, page *entity.Pagination, orderBy []*database.OrderBy) ([]*entity.Database, int64, error) {
	res := o.query.OnlineDatabaseInfo

	// Build basic query
	q := res.WithContext(ctx)

	// Add filter criteria
	if filter != nil {
		if filter.CreatorID != nil {
			q = q.Where(res.CreatorID.Eq(*filter.CreatorID))
		}

		if filter.SpaceID != nil {
			q = q.Where(res.SpaceID.Eq(*filter.SpaceID))
		}

		if filter.AppID != nil {
			q = q.Where(res.AppID.Eq(*filter.AppID))
		}

		if filter.TableName != nil {
			q = q.Where(res.TableName_.Like("%" + *filter.TableName + "%"))
		}

		q = q.Where(res.IsVisible.Eq(1))
	}

	count, err := q.Count()
	if err != nil {
		return nil, 0, fmt.Errorf("count online database failed: %v", err)
	}

	limit := int64(50) // default
	if page != nil && page.Limit > 0 {
		limit = int64(page.Limit)
	}

	offset := 0
	if page != nil && page.Offset > 0 {
		offset = page.Offset
	}

	// processing sort
	if len(orderBy) > 0 {
		for _, order := range orderBy {
			switch order.Field {
			case "created_at":
				if order.Direction == table.SortDirection_Desc {
					q = q.Order(res.CreatedAt.Desc())
				} else {
					q = q.Order(res.CreatedAt)
				}
			case "updated_at":
				if order.Direction == table.SortDirection_Desc {
					q = q.Order(res.UpdatedAt.Desc())
				} else {
					q = q.Order(res.UpdatedAt)
				}
			default:
				q = q.Order(res.CreatedAt.Desc())
			}
		}
	} else {
		q = q.Order(res.CreatedAt.Desc())
	}

	records, err := q.Limit(int(limit)).Offset(offset).Find()
	if err != nil {
		return nil, 0, fmt.Errorf("list online database failed: %v", err)
	}

	databases := make([]*entity.Database, 0, len(records))
	for _, info := range records {
		d := &entity.Database{
			ID:        info.ID,
			SpaceID:   info.SpaceID,
			CreatorID: info.CreatorID,
			IconURI:   info.IconURI,

			AppID:           info.AppID,
			DraftID:         &info.RelatedDraftID,
			OnlineID:        &info.ID,
			IsVisible:       info.IsVisible == 1,
			PromptDisabled:  info.PromptDisabled == 1,
			TableName:       info.TableName_,
			TableDesc:       info.TableDesc,
			FieldList:       info.TableField,
			Status:          table.BotTableStatus_Online,
			ActualTableName: info.PhysicalTableName,
			RwMode:          table.BotTableRWMode(info.RwMode),
			TableType:       ptr.Of(table.TableType_OnlineTable),
		}

		databases = append(databases, d)
	}

	return databases, count, nil
}

func (o *OlineImpl) BatchDeleteWithTX(ctx context.Context, tx *query.QueryTx, ids []int64) error {
	if len(ids) == 0 {
		return nil
	}

	res := tx.OnlineDatabaseInfo
	_, err := res.WithContext(ctx).Where(res.ID.In(ids...)).Delete()
	if err != nil {
		return fmt.Errorf("batch delete online database failed: %v", err)
	}
	return nil
}
