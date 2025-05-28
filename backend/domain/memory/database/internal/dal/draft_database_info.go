package dal

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

var (
	draftOnce      sync.Once
	singletonDraft *DraftImpl
)

type DraftImpl struct {
	IDGen idgen.IDGenerator
	query *query.Query
}

func NewDraftDatabaseDAO(db *gorm.DB, idGen idgen.IDGenerator) *DraftImpl {
	draftOnce.Do(func() {
		singletonDraft = &DraftImpl{
			IDGen: idGen,
			query: query.Use(db),
		}
	})

	return singletonDraft
}

func (d *DraftImpl) CreateWithTX(ctx context.Context, tx *query.QueryTx, database *entity.Database, draftID, onlineID int64, physicalTableName string) (*entity.Database, error) {
	now := time.Now().UnixMilli()

	draftInfo := &model.DraftDatabaseInfo{
		ID:              draftID,
		AppID:           database.AppID,
		SpaceID:         database.SpaceID,
		RelatedOnlineID: onlineID,
		IsVisible:       1, // 默认可见
		PromptDisabled: func() int32 {
			if database.PromptDisabled {
				return 1
			} else {
				return 0
			}
		}(),
		TableName_:        database.TableName,
		TableDesc:         database.Description,
		TableField:        database.FieldList,
		CreatorID:         database.CreatorID,
		IconURI:           database.IconURI,
		PhysicalTableName: physicalTableName,
		RwMode:            int64(database.RwMode),
		CreatedAt:         now,
		UpdatedAt:         now,
	}

	table := tx.DraftDatabaseInfo

	err := table.WithContext(ctx).Create(draftInfo)
	if err != nil {
		return nil, err
	}

	database.CreatedAtMs = now
	database.UpdatedAtMs = now

	return database, nil
}

// Get 获取草稿数据库信息
func (d *DraftImpl) Get(ctx context.Context, id int64) (*entity.Database, error) {
	res := d.query.DraftDatabaseInfo

	info, err := res.WithContext(ctx).Where(res.ID.Eq(id)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("draft database not found, id=%d", id)
		}
		return nil, fmt.Errorf("query draft database failed: %v", err)
	}

	// 构建返回的数据库对象
	db := &entity.Database{
		ID:        info.ID,
		SpaceID:   info.SpaceID,
		CreatorID: info.CreatorID,
		IconURI:   info.IconURI,

		AppID:           info.AppID,
		IsVisible:       info.IsVisible == 1,
		PromptDisabled:  info.PromptDisabled == 1,
		TableName:       info.TableName_,
		TableDesc:       info.TableDesc,
		FieldList:       info.TableField,
		Status:          entity.TableStatus_Draft,
		ActualTableName: info.PhysicalTableName,
		RwMode:          entity.DatabaseRWMode(info.RwMode),
		OnlineID:        &info.RelatedOnlineID,
	}

	return db, nil
}

func (d *DraftImpl) MGet(ctx context.Context, ids []int64) ([]*entity.Database, error) {
	if len(ids) == 0 {
		return []*entity.Database{}, nil
	}

	res := d.query.DraftDatabaseInfo

	records, err := res.WithContext(ctx).
		Where(res.ID.In(ids...)).
		Find()
	if err != nil {
		return nil, fmt.Errorf("batch query draft database failed: %v", err)
	}

	databases := make([]*entity.Database, 0, len(records))
	for _, info := range records {

		db := &entity.Database{
			ID:        info.ID,
			SpaceID:   info.SpaceID,
			CreatorID: info.CreatorID,
			IconURI:   info.IconURI,

			AppID:           info.AppID,
			IsVisible:       info.IsVisible == 1,
			PromptDisabled:  info.PromptDisabled == 1,
			TableName:       info.TableName_,
			TableDesc:       info.TableDesc,
			FieldList:       info.TableField,
			Status:          entity.TableStatus_Draft,
			ActualTableName: info.PhysicalTableName,
			RwMode:          entity.DatabaseRWMode(info.RwMode),
			OnlineID:        &info.RelatedOnlineID,

			CreatedAtMs: info.CreatedAt,
			UpdatedAtMs: info.UpdatedAt,
		}

		databases = append(databases, db)
	}

	return databases, nil
}

// UpdateWithTX 使用事务更新草稿数据库信息
func (d *DraftImpl) UpdateWithTX(ctx context.Context, tx *query.QueryTx, database *entity.Database) (*entity.Database, error) {
	fieldJson, err := json.Marshal(database.FieldList)
	if err != nil {
		return nil, fmt.Errorf("marshal field list failed: %v", err)
	}

	fieldJsonStr := string(fieldJson)
	now := time.Now().UnixMilli()

	updates := map[string]interface{}{ // todo lj 检查哪些可能被更新
		"app_id":      database.AppID,
		"table_name":  database.TableName,
		"table_desc":  database.Description,
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

	// 执行更新
	res := tx.DraftDatabaseInfo
	_, err = res.WithContext(ctx).Where(res.ID.Eq(database.ID)).Updates(updates)
	if err != nil {
		return nil, fmt.Errorf("update draft database failed: %v", err)
	}

	database.UpdatedAtMs = now
	return database, nil
}

func (d *DraftImpl) DeleteWithTX(ctx context.Context, tx *query.QueryTx, id int64) error {
	// 逻辑删除（更新状态为已删除）
	now := time.Now().UnixMilli()
	updates := map[string]interface{}{
		"updated_at": now,
		"deleted_at": now,
	}

	res := tx.DraftDatabaseInfo
	_, err := res.WithContext(ctx).Where(res.ID.Eq(id)).Updates(updates)
	if err != nil {
		return fmt.Errorf("delete draft database failed: %v", err)
	}

	return nil
}

// List 列出符合条件的数据库信息
func (d *DraftImpl) List(ctx context.Context, filter *entity.DatabaseFilter, page *entity.Pagination, orderBy []*entity.OrderBy) ([]*entity.Database, int64, error) {
	res := d.query.DraftDatabaseInfo

	q := res.WithContext(ctx)

	// 添加过滤条件
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

	limit := int64(50)
	if page != nil && page.Limit > 0 {
		limit = int64(page.Limit)
	}

	offset := 0
	if page != nil && page.Offset > 0 {
		offset = page.Offset
	}

	if len(orderBy) > 0 {
		for _, order := range orderBy {
			switch order.Field {
			case "created_at":
				if order.Direction == entity.SortDirection_Desc {
					q = q.Order(res.CreatedAt.Desc())
				} else {
					q = q.Order(res.CreatedAt)
				}
			case "updated_at":
				if order.Direction == entity.SortDirection_Desc {
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
		db := &entity.Database{
			ID:        info.ID,
			SpaceID:   info.SpaceID,
			CreatorID: info.CreatorID,
			IconURI:   info.IconURI,

			AppID:           info.AppID,
			IsVisible:       info.IsVisible == 1,
			PromptDisabled:  info.PromptDisabled == 1,
			TableName:       info.TableName_,
			TableDesc:       info.TableDesc,
			FieldList:       info.TableField,
			Status:          entity.TableStatus_Draft,
			ActualTableName: info.PhysicalTableName,
			RwMode:          entity.DatabaseRWMode(info.RwMode),
			TableType:       ptr.Of(entity.TableType_DraftTable),
			OnlineID:        &info.RelatedOnlineID,
		}

		databases = append(databases, db)
	}

	return databases, count, nil
}
