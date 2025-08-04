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

package service

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"math/rand"
	"runtime/debug"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/tealeg/xlsx/v3"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/table"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossvariables"
	entity2 "github.com/coze-dev/coze-studio/backend/domain/memory/database/entity"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/internal/convertor"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/internal/physicaltable"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/internal/sheet"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/repository"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/rdb"
	entity3 "github.com/coze-dev/coze-studio/backend/infra/contract/rdb/entity"
	sqlparsercontract "github.com/coze-dev/coze-studio/backend/infra/contract/sqlparser"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/infra/impl/sqlparser"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type databaseService struct {
	rdb                rdb.RDB
	db                 *gorm.DB
	generator          idgen.IDGenerator
	draftDAO           repository.DraftDAO
	onlineDAO          repository.OnlineDAO
	agentToDatabaseDAO repository.AgentToDatabaseDAO
	storage            storage.Storage
	cache              cache.Cmdable
}

func NewService(rdb rdb.RDB, db *gorm.DB, generator idgen.IDGenerator, storage storage.Storage, cacheCli cache.Cmdable) Database {
	return &databaseService{
		rdb:                rdb,
		db:                 db,
		generator:          generator,
		draftDAO:           repository.NewDraftDatabaseDAO(db, generator),
		onlineDAO:          repository.NewOnlineDatabaseDAO(db, generator),
		agentToDatabaseDAO: repository.NewAgentToDatabaseDAO(db, generator),
		storage:            storage,
		cache:              cacheCli,
	}
}

func (d databaseService) CreateDatabase(ctx context.Context, req *CreateDatabaseRequest) (*CreateDatabaseResponse, error) {
	draftEntity, onlineEntity := req.Database, req.Database
	fieldItems, columns := physicaltable.CreateFieldInfo(req.Database.FieldList)

	// create physical draft table
	draftEntity.FieldList = fieldItems

	draftPhysicalTableRes, err := physicaltable.CreatePhysicalTable(ctx, d.rdb, columns)
	if err != nil {
		return nil, err
	}
	if draftPhysicalTableRes.Table == nil {
		return nil, fmt.Errorf("create draft table failed, columns info is %v", columns)
	}

	draftID, err := d.generator.GenID(ctx)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrMemoryIDGenFailCode, errorx.KV("msg", "CreateDatabase"))
	}

	// create physical online table
	onlineEntity.FieldList = fieldItems

	onlinePhysicalTableRes, err := physicaltable.CreatePhysicalTable(ctx, d.rdb, columns)
	if err != nil {
		return nil, err
	}
	if onlinePhysicalTableRes.Table == nil {
		return nil, fmt.Errorf("create online table failed, columns info is %v", columns)
	}

	onlineID, err := d.generator.GenID(ctx)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrMemoryIDGenFailCode, errorx.KV("msg", "CreateDatabase"))
	}

	// insert draft and online database info
	tx := query.Use(d.db).Begin()
	if tx.Error != nil {
		return nil, fmt.Errorf("start transaction failed, %v", tx.Error)
	}

	if draftEntity.IconURI == "" {
		draftEntity.IconURI = consts.DefaultDatabaseIcon
	}
	if onlineEntity.IconURI == "" {
		onlineEntity.IconURI = consts.DefaultDatabaseIcon
	}

	defer func() {
		if r := recover(); r != nil {
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))
			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}
		}
	}()

	_, err = d.draftDAO.CreateWithTX(ctx, tx, draftEntity, draftID, onlineID, draftPhysicalTableRes.Table.Name)
	if err != nil {
		return nil, err
	}

	onlineEntity, err = d.onlineDAO.CreateWithTX(ctx, tx, onlineEntity, draftID, onlineID, onlinePhysicalTableRes.Table.Name)
	if err != nil {
		return nil, err
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	onlineEntity.ActualTableName = onlinePhysicalTableRes.Table.Name
	onlineEntity.ID = onlineID
	onlineEntity.DraftID = ptr.Of(draftID)
	objURL, uRrr := d.storage.GetObjectUrl(ctx, onlineEntity.IconURI)
	if uRrr == nil {
		onlineEntity.IconURL = objURL
	}

	return &CreateDatabaseResponse{
		Database: onlineEntity,
	}, nil
}

func (d databaseService) UpdateDatabase(ctx context.Context, req *UpdateDatabaseRequest) (*UpdateDatabaseResponse, error) {
	// req.Database.ID is the id of online database
	input := req.Database
	onlineInfo, err := d.onlineDAO.Get(ctx, req.Database.ID)
	if err != nil {
		return nil, fmt.Errorf("get online database info failed: %v", err)
	}

	draftInfo, err := d.draftDAO.Get(ctx, onlineInfo.GetDraftID())
	if err != nil {
		return nil, fmt.Errorf("get draft database info failed: %v", err)
	}

	draftEntity, onlineEntity := *input, *input

	draftEntity.ID = draftInfo.ID
	onlineEntity.ID = onlineInfo.ID

	fieldItems, columns, droppedColumns, err := physicaltable.UpdateFieldInfo(input.FieldList, onlineInfo.FieldList)
	if err != nil {
		return nil, err
	}

	draftEntity.FieldList = fieldItems
	onlineEntity.FieldList = fieldItems

	// get draft and online physical table info
	draftPhysicalTable, err := d.rdb.GetTable(ctx, &rdb.GetTableRequest{
		TableName: draftInfo.ActualTableName,
	})
	if err != nil {
		return nil, fmt.Errorf("get physical table info failed: %v", err)
	}

	onlinePhysicalTable, err := d.rdb.GetTable(ctx, &rdb.GetTableRequest{
		TableName: onlineInfo.ActualTableName,
	})
	if err != nil {
		return nil, fmt.Errorf("get physical table info failed: %v", err)
	}

	err = physicaltable.UpdatePhysicalTableWithDrops(ctx, d.rdb, draftPhysicalTable.Table, columns, droppedColumns, draftInfo.ActualTableName)
	if err != nil {
		return nil, fmt.Errorf("update draft physical table failed: %v", err)
	}

	err = physicaltable.UpdatePhysicalTableWithDrops(ctx, d.rdb, onlinePhysicalTable.Table, columns, droppedColumns, onlineInfo.ActualTableName)
	if err != nil {
		return nil, fmt.Errorf("update online physical table failed: %v", err)
	}

	tx := query.Use(d.db).Begin()
	if tx.Error != nil {
		return nil, fmt.Errorf("start transaction failed, %v", tx.Error)
	}

	if draftEntity.IconURI == "" {
		draftEntity.IconURI = consts.DefaultDatabaseIcon
	}
	if onlineEntity.IconURI == "" {
		onlineEntity.IconURI = consts.DefaultDatabaseIcon
	}

	defer func() {
		if r := recover(); r != nil {
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))
			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}
		}
	}()

	_, err = d.draftDAO.UpdateWithTX(ctx, tx, &draftEntity)
	if err != nil {
		return nil, fmt.Errorf("update draft database info failed: %v", err)
	}

	onlineEntityUpdated, err := d.onlineDAO.UpdateWithTX(ctx, tx, &onlineEntity)
	if err != nil {
		return nil, fmt.Errorf("update online database info failed: %v", err)
	}

	err = tx.Commit()
	if err != nil {
		return nil, fmt.Errorf("commit transaction failed: %v", err)
	}

	return &UpdateDatabaseResponse{
		Database: onlineEntityUpdated,
	}, nil
}

func (d databaseService) DeleteDatabase(ctx context.Context, req *DeleteDatabaseRequest) error {
	onlineInfo, err := d.onlineDAO.Get(ctx, req.ID)
	if err != nil {
		return fmt.Errorf("get online database info failed: %v", err)
	}

	draftInfo, err := d.draftDAO.Get(ctx, onlineInfo.GetDraftID())
	if err != nil {
		return fmt.Errorf("get draft database info failed: %v", err)
	}

	tx := query.Use(d.db).Begin()
	if tx.Error != nil {
		return fmt.Errorf("start transaction failed, %v", tx.Error)
	}

	defer func() {
		if r := recover(); r != nil {
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))
			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}
		}
	}()

	err = d.draftDAO.DeleteWithTX(ctx, tx, draftInfo.ID)
	if err != nil {
		return fmt.Errorf("delete draft database info failed: %v", err)
	}

	err = d.onlineDAO.DeleteWithTX(ctx, tx, onlineInfo.ID)
	if err != nil {
		return fmt.Errorf("delete online database info failed: %v", err)
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("commit transaction failed: %v", err)
	}

	// delete draft physical table
	if draftInfo.ActualTableName != "" {
		_, err = d.rdb.DropTable(ctx, &rdb.DropTableRequest{
			TableName: draftInfo.ActualTableName,
		})
		if err != nil {
			logs.Errorf("drop draft physical table failed: %v, table_name=%s", err, draftInfo.ActualTableName)
		}
	}

	// delete online physical table
	if onlineInfo.ActualTableName != "" {
		_, err = d.rdb.DropTable(ctx, &rdb.DropTableRequest{
			TableName: onlineInfo.ActualTableName,
		})
		if err != nil {
			logs.Errorf("drop online physical table failed: %v, table_name=%s", err, onlineInfo.ActualTableName)
		}
	}

	return nil
}

func (d databaseService) MGetDatabase(ctx context.Context, req *MGetDatabaseRequest) (*MGetDatabaseResponse, error) {
	if len(req.Basics) == 0 {
		return &MGetDatabaseResponse{
			Databases: []*entity2.Database{},
		}, nil
	}

	onlineID2NeedSysFields := make(map[int64]bool)
	draftID2NeedSysFields := make(map[int64]bool)

	uniqueOnlineIDs := make([]int64, 0)
	uniqueDraftIDs := make([]int64, 0)
	idMap := make(map[int64]bool)
	for _, basic := range req.Basics {
		if !idMap[basic.ID] {
			idMap[basic.ID] = true
			if basic.TableType == table.TableType_OnlineTable {
				uniqueOnlineIDs = append(uniqueOnlineIDs, basic.ID)
				onlineID2NeedSysFields[basic.ID] = basic.NeedSysFields
			} else {
				uniqueDraftIDs = append(uniqueDraftIDs, basic.ID)
				draftID2NeedSysFields[basic.ID] = basic.NeedSysFields
			}
		}
	}

	onlineDatabases, err := d.onlineDAO.MGet(ctx, uniqueOnlineIDs)
	if err != nil {
		return nil, fmt.Errorf("batch get database info failed: %v", err)
	}

	draftDatabases, err := d.draftDAO.MGet(ctx, uniqueDraftIDs)
	if err != nil {
		return nil, fmt.Errorf("batch get database info failed: %v", err)
	}

	for _, onlineDatabase := range onlineDatabases {
		if needSys, ok := onlineID2NeedSysFields[onlineDatabase.ID]; ok && needSys {
			if onlineDatabase.FieldList == nil {
				onlineDatabase.FieldList = make([]*database.FieldItem, 0, 3)
			}
			onlineDatabase.FieldList = append(onlineDatabase.FieldList, physicaltable.GetDisplayCreateTimeField(), physicaltable.GetDisplayUidField(), physicaltable.GetDisplayIDField())
		}
		if onlineDatabase.IconURI != "" {
			objURL, uRrr := d.storage.GetObjectUrl(ctx, onlineDatabase.IconURI)
			if uRrr == nil {
				onlineDatabase.IconURL = objURL
			}
		}
	}
	for _, draftDatabase := range draftDatabases {
		if needSys, ok := draftID2NeedSysFields[draftDatabase.ID]; ok && needSys {
			if draftDatabase.FieldList == nil {
				draftDatabase.FieldList = make([]*database.FieldItem, 0, 3)
			}
			draftDatabase.FieldList = append(draftDatabase.FieldList, physicaltable.GetDisplayCreateTimeField(), physicaltable.GetDisplayUidField(), physicaltable.GetDisplayIDField())
		}
		if draftDatabase.IconURI != "" {
			objURL, uRrr := d.storage.GetObjectUrl(ctx, draftDatabase.IconURI)
			if uRrr == nil {
				draftDatabase.IconURL = objURL
			}
		}
	}

	databases := make([]*entity2.Database, 0)
	databases = append(databases, onlineDatabases...)
	databases = append(databases, draftDatabases...)

	return &MGetDatabaseResponse{
		Databases: databases,
	}, nil
}

func (d databaseService) ListDatabase(ctx context.Context, req *ListDatabaseRequest) (*ListDatabaseResponse, error) {
	filter := &entity2.DatabaseFilter{
		CreatorID: req.CreatorID,
		SpaceID:   req.SpaceID,
		TableName: req.TableName,
		AppID:     &req.AppID,
	}

	page := &entity2.Pagination{
		Limit:  req.Limit,
		Offset: req.Offset,
	}

	var databases []*entity2.Database
	var err error
	var count int64
	if req.TableType == table.TableType_OnlineTable {
		databases, count, err = d.onlineDAO.List(ctx, filter, page, req.OrderBy)
		if err != nil {
			return nil, fmt.Errorf("list database failed: %v", err)
		}
	} else {
		databases, count, err = d.draftDAO.List(ctx, filter, page, req.OrderBy)
		if err != nil {
			return nil, fmt.Errorf("list database failed: %v", err)
		}
	}

	for _, database := range databases {
		if database.IconURI != "" {
			objURL, uRrr := d.storage.GetObjectUrl(ctx, database.IconURI)
			if uRrr == nil {
				database.IconURL = objURL
			}
		}
	}

	var hasMore bool
	if count <= int64(req.Limit)+int64(req.Offset) {
		hasMore = false
	} else {
		hasMore = true
	}

	return &ListDatabaseResponse{
		Databases:  databases,
		HasMore:    hasMore,
		TotalCount: count,
	}, nil
}

func (d databaseService) AddDatabaseRecord(ctx context.Context, req *AddDatabaseRecordRequest) error {
	var tableInfo *entity2.Database
	var err error

	if req.TableType == table.TableType_OnlineTable {
		tableInfo, err = d.onlineDAO.Get(ctx, req.DatabaseID)
	} else {
		tableInfo, err = d.draftDAO.Get(ctx, req.DatabaseID)
	}

	if err != nil {
		return fmt.Errorf("get table info failed: %v", err)
	}

	if tableInfo.RwMode == table.BotTableRWMode_ReadOnly {
		return errorx.New(errno.ErrMemoryDatabaseCannotAddData)
	}

	physicalTableName := tableInfo.ActualTableName
	if physicalTableName == "" {
		return fmt.Errorf("physical table name is empty")
	}

	fieldList := append(tableInfo.FieldList, physicaltable.GetCreateTimeField(), physicaltable.GetUidField(), physicaltable.GetIDField(), physicaltable.GetConnectIDField())
	fieldMap := slices.ToMap(fieldList, func(e *database.FieldItem) (string, *database.FieldItem) {
		return e.Name, e
	})

	convertedRecords := make([]map[string]interface{}, 0, len(req.Records))
	ids, err := d.generator.GenMultiIDs(ctx, len(req.Records))
	if err != nil {
		return err
	}

	for index, recordMap := range req.Records {
		convertedRecord := make(map[string]interface{})

		cid := consts.CozeConnectorID
		if req.ConnectorID != nil {
			cid = *req.ConnectorID
		}
		convertedRecord[database.DefaultUidColName] = req.UserID
		convertedRecord[database.DefaultCidColName] = cid
		convertedRecord[database.DefaultCreateTimeColName] = time.Now()
		convertedRecord[database.DefaultIDColName] = ids[index]

		if _, ok := recordMap[database.DefaultIDColName]; ok {
			delete(recordMap, database.DefaultIDColName)
		}

		for fieldName, value := range recordMap {
			if _, fOk := fieldMap[fieldName]; !fOk {
				return errorx.New(errno.ErrMemoryDatabaseFieldNotFoundCode, errorx.KV("msg", fmt.Sprintf("field %s not found in table definition", fieldName)))
			}

			fieldInfo, _ := fieldMap[fieldName]
			if value == "" && fieldInfo.MustRequired {
				return fmt.Errorf("field %s's value is required", fieldName)
			}

			physicalFieldName := fieldInfo.PhysicalName
			convertedValue, err := convertor.ConvertValueByType(value, fieldInfo.Type)
			if err != nil {
				return fmt.Errorf("convert value failed for field %s: %v, using original value", fieldName, err)
			}

			convertedRecord[physicalFieldName] = convertedValue
		}

		convertedRecords = append(convertedRecords, convertedRecord)
	}

	_, err = d.rdb.InsertData(ctx, &rdb.InsertDataRequest{
		TableName: physicalTableName,
		Data:      convertedRecords,
	})
	if err != nil {
		return fmt.Errorf("insert data failed: %v", err)
	}

	return nil
}

func (d databaseService) UpdateDatabaseRecord(ctx context.Context, req *UpdateDatabaseRecordRequest) error {
	var tableInfo *database.Database
	var err error

	if req.TableType == table.TableType_OnlineTable {
		tableInfo, err = d.onlineDAO.Get(ctx, req.DatabaseID)
	} else {
		tableInfo, err = d.draftDAO.Get(ctx, req.DatabaseID)
	}

	if err != nil {
		return fmt.Errorf("get table info failed: %v", err)
	}

	if tableInfo.RwMode == table.BotTableRWMode_ReadOnly {
		return errorx.New(errno.ErrMemoryDatabaseCannotAddData)
	}

	physicalTableName := tableInfo.ActualTableName
	if physicalTableName == "" {
		return fmt.Errorf("physical table name is empty")
	}

	fieldList := append(tableInfo.FieldList, physicaltable.GetCreateTimeField(), physicaltable.GetUidField(), physicaltable.GetIDField(), physicaltable.GetConnectIDField())
	fieldMap := slices.ToMap(fieldList, func(e *database.FieldItem) (string, *database.FieldItem) {
		return e.Name, e
	})

	for _, record := range req.Records {
		idStr, exists := record[database.DefaultIDColName]
		if !exists {
			return fmt.Errorf("record must contain %s field for update", database.DefaultIDColName)
		}

		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			return fmt.Errorf("invalid ID format: %v", err)
		}

		updateData := make(map[string]interface{})

		for fieldName, valueStr := range record {
			if fieldName == database.DefaultIDColName {
				continue
			}

			if _, fOk := fieldMap[fieldName]; !fOk {
				return errorx.New(errno.ErrMemoryDatabaseFieldNotFoundCode, errorx.KV("msg", fmt.Sprintf("field %s not found in table definition", fieldName)))
			}

			fieldInfo, _ := fieldMap[fieldName]
			if valueStr == "" && fieldInfo.MustRequired {
				return fmt.Errorf("field %s's value is required", fieldName)
			}

			physicalFieldName := fieldInfo.PhysicalName
			convertedValue, err := convertor.ConvertValueByType(valueStr, fieldInfo.Type)
			if err != nil {
				logs.Warnf("convert value failed for field %s: %v, using original value", fieldName, err)
				convertedValue = valueStr
			}
			updateData[physicalFieldName] = convertedValue
		}

		if len(updateData) == 0 {
			continue
		}

		condition := &rdb.ComplexCondition{
			Conditions: []*rdb.Condition{
				{
					Field:    database.DefaultIDColName,
					Operator: entity3.OperatorEqual,
					Value:    id,
				},
			},
		}

		if tableInfo.RwMode == table.BotTableRWMode_LimitedReadWrite {
			cond := &rdb.Condition{
				Field:    database.DefaultUidColName,
				Operator: entity3.OperatorEqual,
				Value:    strconv.FormatInt(req.UserID, 10),
			}

			condition.Conditions = append(condition.Conditions, cond)
		}

		_, err = d.rdb.UpdateData(ctx, &rdb.UpdateDataRequest{
			TableName: physicalTableName,
			Data:      updateData,
			Where:     condition,
		})
		if err != nil {
			return fmt.Errorf("update data failed for ID %d: %v", id, err)
		}
	}

	return nil
}

func (d databaseService) DeleteDatabaseRecord(ctx context.Context, req *DeleteDatabaseRecordRequest) error {
	var tableInfo *entity2.Database
	var err error

	if req.TableType == table.TableType_OnlineTable {
		tableInfo, err = d.onlineDAO.Get(ctx, req.DatabaseID)
	} else {
		tableInfo, err = d.draftDAO.Get(ctx, req.DatabaseID)
	}
	if err != nil {
		return err
	}

	if tableInfo.RwMode == table.BotTableRWMode_ReadOnly {
		return errorx.New(errno.ErrMemoryDatabaseCannotAddData)
	}

	physicalTableName := tableInfo.ActualTableName
	if physicalTableName == "" {
		return fmt.Errorf("physical table name is empty")
	}

	var ids []interface{}
	for _, record := range req.Records {
		idStr, exists := record[database.DefaultIDColName]
		if !exists {
			return fmt.Errorf("record must contain %s field for deletion", database.DefaultIDColName)
		}

		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			return fmt.Errorf("invalid ID format: %v", err)
		}

		ids = append(ids, id)
	}

	condition := &rdb.ComplexCondition{
		Conditions: []*rdb.Condition{
			{
				Field:    database.DefaultIDColName,
				Operator: entity3.OperatorIn,
				Value:    ids,
			},
		},
	}

	if tableInfo.RwMode == table.BotTableRWMode_LimitedReadWrite {
		cond := &rdb.Condition{
			Field:    database.DefaultUidColName,
			Operator: entity3.OperatorEqual,
			Value:    strconv.FormatInt(req.UserID, 10),
		}

		condition.Conditions = append(condition.Conditions, cond)
	}

	_, err = d.rdb.DeleteData(ctx, &rdb.DeleteDataRequest{
		TableName: physicalTableName,
		Where:     condition,
	})
	if err != nil {
		return fmt.Errorf("delete data failed: %v", err)
	}

	return nil
}

func (d databaseService) ListDatabaseRecord(ctx context.Context, req *ListDatabaseRecordRequest) (*ListDatabaseRecordResponse, error) {
	var tableInfo *entity2.Database
	var err error

	if req.TableType == table.TableType_OnlineTable {
		tableInfo, err = d.onlineDAO.Get(ctx, req.DatabaseID)
	} else {
		tableInfo, err = d.draftDAO.Get(ctx, req.DatabaseID)
	}

	if err != nil {
		return nil, fmt.Errorf("get table info failed: %v", err)
	}

	physicalTableName := tableInfo.ActualTableName
	if physicalTableName == "" {
		return nil, fmt.Errorf("physical table name is empty")
	}

	fieldNameToPhysical := make(map[string]string)
	physicalToFieldName := make(map[string]string)
	physicalToFieldType := make(map[string]table.FieldItemType)

	for _, field := range tableInfo.FieldList {
		if field.AlterID > 0 {
			physicalName := physicaltable.GetFieldPhysicsName(field.AlterID)
			fieldNameToPhysical[field.Name] = physicalName
			physicalToFieldName[physicalName] = field.Name
			physicalToFieldType[physicalName] = field.Type
		}
	}

	var complexCondition *rdb.ComplexCondition

	if req.ConnectorID != nil && *req.ConnectorID > 0 {
		cond := &rdb.Condition{
			Field:    database.DefaultCidColName,
			Operator: entity3.OperatorEqual,
			Value:    *req.ConnectorID,
		}

		complexCondition = &rdb.ComplexCondition{
			Conditions: []*rdb.Condition{cond},
		}
	}
	if req.TableType == table.TableType_DraftTable {
		if tableInfo.RwMode == table.BotTableRWMode_LimitedReadWrite {
			cond := &rdb.Condition{
				Field:    database.DefaultUidColName,
				Operator: entity3.OperatorEqual,
				Value:    strconv.FormatInt(req.UserID, 10),
			}

			if complexCondition == nil {
				complexCondition = &rdb.ComplexCondition{
					Conditions: []*rdb.Condition{cond},
				}
			} else {
				complexCondition.Conditions = append(complexCondition.Conditions, cond)
			}
		}
	}

	limit := 50
	if req.Limit > 0 {
		limit = req.Limit
	}

	orderBy := []*rdb.OrderBy{
		{
			Field:     database.DefaultCreateTimeColName,
			Direction: entity3.SortDirectionDesc,
		},
	}

	selectResp, err := d.rdb.SelectData(ctx, &rdb.SelectDataRequest{
		TableName: physicalTableName,
		Fields:    []string{}, // Null means query all fields
		Where:     complexCondition,
		OrderBy:   orderBy,
		Limit:     &limit,
		Offset:    &req.Offset,
	})
	if err != nil {
		return nil, fmt.Errorf("select data failed: %v", err)
	}

	if selectResp.ResultSet == nil {
		return &ListDatabaseRecordResponse{}, nil
	}

	records := convertor.ConvertResultSetToString(selectResp.ResultSet, physicalToFieldName, physicalToFieldType)

	var hasMore bool
	if selectResp.Total <= int64(req.Limit)+int64(req.Offset) {
		hasMore = false
	} else {
		hasMore = true
	}

	return &ListDatabaseRecordResponse{
		Records:    records,
		FieldList:  tableInfo.FieldList,
		HasMore:    hasMore,
		TotalCount: selectResp.Total,
	}, nil
}

func (d databaseService) GetDatabaseTemplate(ctx context.Context, req *GetDatabaseTemplateRequest) (*GetDatabaseTemplateResponse, error) {
	items := req.FieldItems
	tableName := req.TableName

	file := xlsx.NewFile()
	sheet, err := file.AddSheet("Sheet1")
	if err != nil {
		return nil, err
	}
	// add header
	header := sheet.AddRow()
	headerTitles := make([]string, 0)
	for i := range items {
		headerTitles = append(headerTitles, items[i].GetName())
	}
	for _, title := range headerTitles {
		cell := header.AddCell()
		cell.Value = title
	}

	row := sheet.AddRow()
	for _, item := range items {
		row.AddCell().Value = physicaltable.GetTemplateTypeMap()[item.GetType()]
	}
	var buffer bytes.Buffer
	err = file.Write(&buffer)
	if err != nil {
		return nil, err
	}

	binaryData := buffer.Bytes()
	url, err := d.uploadFile(ctx, req.UserID, string(binaryData), tableName, "xlsx", nil)
	if err != nil {
		return nil, err
	}

	return &GetDatabaseTemplateResponse{
		Url: url,
	}, nil
}

func (d databaseService) uploadFile(ctx context.Context, UserId int64, content string, bizType, fileType string, suffix *string) (string, error) {
	secret := createSecret(UserId, fileType)
	fileName := fmt.Sprintf("%d_%d_%s.%s", UserId, time.Now().UnixNano(), secret, fileType)
	if suffix != nil {
		fileName = fmt.Sprintf("%d_%d_%s_%s.%s", UserId, time.Now().UnixNano(), secret, *suffix, fileType)
	}

	objectName := fmt.Sprintf("%s/%s", bizType, fileName)
	err := d.storage.PutObject(ctx, objectName, []byte(content))
	if err != nil {
		return "", err
	}

	url, err := d.storage.GetObjectUrl(ctx, objectName)
	if err != nil {
		return "", err
	}

	return url, nil
}

const baseWord = "1Aa2Bb3Cc4Dd5Ee6Ff7Gg8Hh9Ii0JjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz"

func createSecret(uid int64, fileType string) string {
	num := 10
	input := fmt.Sprintf("upload_%d_Ma*9)fhi_%d_gou_%s_rand_%d", uid, time.Now().Unix(), fileType, rand.Intn(100000))
	hash := sha256.Sum256([]byte(fmt.Sprintf("%s", input)))
	hashString := base64.StdEncoding.EncodeToString(hash[:])

	if len(hashString) > num {
		hashString = hashString[:num]
	}

	result := ""
	for _, char := range hashString {
		index := int(char) % 62
		result += string(baseWord[index])
	}
	return result
}

func (d databaseService) ExecuteSQL(ctx context.Context, req *ExecuteSQLRequest) (*ExecuteSQLResponse, error) {
	var tableInfo *entity2.Database
	var err error

	if req.TableType == table.TableType_OnlineTable {
		tableInfo, err = d.onlineDAO.Get(ctx, req.DatabaseID)
	} else {
		tableInfo, err = d.draftDAO.Get(ctx, req.DatabaseID)
	}

	if err != nil {
		return nil, fmt.Errorf("get table info failed: %v", err)
	}

	if tableInfo.RwMode == table.BotTableRWMode_ReadOnly &&
		(req.OperateType == database.OperateType_Insert || req.OperateType == database.OperateType_Update ||
			req.OperateType == database.OperateType_Delete) {
		return nil, errorx.New(errno.ErrMemoryDatabaseCannotAddData)
	}

	physicalTableName := tableInfo.ActualTableName
	if physicalTableName == "" {
		return nil, fmt.Errorf("physical table name is empty")
	}

	fieldNameToPhysical := make(map[string]string)
	physicalToFieldName := make(map[string]string)
	physicalToFieldType := make(map[string]table.FieldItemType)

	for _, field := range tableInfo.FieldList {
		if field.AlterID > 0 {
			physicalName := physicaltable.GetFieldPhysicsName(field.AlterID)
			fieldNameToPhysical[field.Name] = physicalName
			physicalToFieldName[physicalName] = field.Name
			physicalToFieldType[physicalName] = field.Type
		}
	}
	fieldNameToPhysical[database.DefaultIDDisplayColName] = database.DefaultIDColName
	fieldNameToPhysical[database.DefaultUidDisplayColName] = database.DefaultUidColName
	fieldNameToPhysical[database.DefaultCreateTimeDisplayColName] = database.DefaultCreateTimeColName

	var resultSet *entity3.ResultSet
	var rowsAffected int64

	switch req.OperateType {
	case database.OperateType_Custom:
		resultSet, err = d.executeCustomSQL(ctx, req, physicalTableName, tableInfo, fieldNameToPhysical)
		if err != nil {
			return nil, err
		}

	case database.OperateType_Select:
		resultSet, err = d.executeSelectSQL(ctx, req, physicalTableName, tableInfo, fieldNameToPhysical)
		if err != nil {
			return nil, err
		}

	case database.OperateType_Insert:
		resultSet, err = d.executeInsertSQL(ctx, req, physicalTableName, tableInfo)
		if err != nil {
			return nil, err
		}

	case database.OperateType_Update:
		rowsAffected, err = d.executeUpdateSQL(ctx, req, physicalTableName, tableInfo, fieldNameToPhysical)
		if err != nil {
			return nil, err
		}

	case database.OperateType_Delete:
		rowsAffected, err = d.executeDeleteSQL(ctx, req, physicalTableName, tableInfo, fieldNameToPhysical)
		if err != nil {
			return nil, err
		}

	default:
		return nil, fmt.Errorf("unsupported operation type: %v", req.OperateType)
	}

	response := &ExecuteSQLResponse{
		FieldList: tableInfo.FieldList,
	}

	if resultSet != nil && len(resultSet.Rows) > 0 {
		response.Records = convertor.ConvertResultSet(resultSet, physicalToFieldName, physicalToFieldType)
	} else {
		response.Records = make([]map[string]interface{}, 0)
	}

	// process special system fields
	for _, record := range response.Records {
		if val, ok := record[database.DefaultUidColName]; ok {
			delete(record, database.DefaultUidColName)
			record[database.DefaultUidDisplayColName] = val
		}
		if val, ok := record[database.DefaultCreateTimeColName]; ok {
			delete(record, database.DefaultCreateTimeColName)
			record[database.DefaultCreateTimeDisplayColName] = val
		}
		if val, ok := record[database.DefaultIDColName]; ok {
			delete(record, database.DefaultIDColName)
			record[database.DefaultIDDisplayColName] = val
		}
		if _, ok := record[database.DefaultCidColName]; ok {
			delete(record, database.DefaultCidColName)
		}
	}

	if resultSet != nil && resultSet.AffectedRows > 0 {
		response.RowsAffected = &resultSet.AffectedRows
	}

	if rowsAffected > 0 {
		response.RowsAffected = &rowsAffected
	}

	return response, nil
}

func (d databaseService) executeCustomSQL(ctx context.Context, req *ExecuteSQLRequest, physicalTableName string, tableInfo *entity2.Database, fieldNameToPhysical map[string]string) (*entity3.ResultSet, error) {
	var params []interface{}
	if req.SQL == nil || *req.SQL == "" {
		return nil, fmt.Errorf("SQL is empty")
	}

	operation, err := sqlparser.NewSQLParser().GetSQLOperation(*req.SQL)
	if err != nil {
		return nil, err
	}

	if tableInfo.RwMode == table.BotTableRWMode_ReadOnly && (operation == sqlparsercontract.OperationTypeInsert || operation == sqlparsercontract.OperationTypeUpdate || operation == sqlparsercontract.OperationTypeDelete) {
		return nil, fmt.Errorf("unsupported operation type: %v", operation)
	}

	if req.SQLParams != nil {
		params = make([]interface{}, 0, len(req.SQLParams))
		for _, param := range req.SQLParams {
			value := param.Value
			if param.ISNull {
				value = nil
			}
			params = append(params, value)
		}
	}

	tableColumnMapping := map[string]sqlparsercontract.TableColumn{
		tableInfo.TableName: {
			NewTableName: &physicalTableName,
			ColumnMap:    fieldNameToPhysical,
		},
	}

	parsedSQL, err := sqlparser.NewSQLParser().ParseAndModifySQL(*req.SQL, tableColumnMapping)
	if err != nil {
		return nil, fmt.Errorf("parse sql failed: %v", err)
	}

	insertResult := make([]map[string]interface{}, 0)
	if operation == sqlparsercontract.OperationTypeInsert {
		cid := consts.CozeConnectorID
		if req.ConnectorID != nil {
			cid = *req.ConnectorID
		}
		nums, err := sqlparser.NewSQLParser().GetInsertDataNums(parsedSQL)
		if err != nil {
			return nil, err
		}

		ids, err := d.generator.GenMultiIDs(ctx, nums)
		if err != nil {
			return nil, err
		}

		for _, id := range ids {
			insertResult = append(insertResult, map[string]interface{}{
				database.DefaultIDColName: id,
			})
		}

		existingCols := make(map[string]bool)
		if req.SQLType == database.SQLType_Raw {
			iIDs := make([]interface{}, len(ids))
			for i, id := range ids {
				iIDs[i] = id
			}
			parsedSQL, _, err = sqlparser.NewSQLParser().AddColumnsToInsertSQL(parsedSQL, []sqlparsercontract.ColumnValue{
				{
					ColName: database.DefaultCidColName,
					Value:   cid,
				},
				{
					ColName: database.DefaultUidColName,
					Value:   req.UserID,
				},
			}, &sqlparsercontract.PrimaryKeyValue{ColName: database.DefaultIDColName, Values: iIDs}, false)
			if err != nil {
				return nil, fmt.Errorf("add columns to insert sql failed: %v", err)
			}
		} else if req.SQLType == database.SQLType_Parameterized {
			parsedSQL, existingCols, err = sqlparser.NewSQLParser().AddColumnsToInsertSQL(parsedSQL, []sqlparsercontract.ColumnValue{
				{
					ColName: database.DefaultCidColName,
				},
				{
					ColName: database.DefaultUidColName,
				},
			}, &sqlparsercontract.PrimaryKeyValue{ColName: database.DefaultIDColName}, true)
			if err != nil {
				return nil, fmt.Errorf("add columns to insert sql failed: %v", err)
			}

			if nums > 0 {
				if len(params)%nums != 0 {
					return nil, fmt.Errorf("number of params is not a multiple of number of rows")
				}
				paramsPerRow := len(params) / nums
				newParams := make([]interface{}, 0)
				for i := 0; i < nums; i++ {
					newParams = append(newParams, params[i*paramsPerRow:(i+1)*paramsPerRow]...)
					if !existingCols[database.DefaultCidColName] {
						newParams = append(newParams, cid)
					}
					if !existingCols[database.DefaultUidColName] {
						newParams = append(newParams, req.UserID)
					}
					if !existingCols[database.DefaultIDColName] {
						newParams = append(newParams, ids[i])
					}
				}
				params = newParams
			}
		}
	}

	execResp, err := d.rdb.ExecuteSQL(ctx, &rdb.ExecuteSQLRequest{
		SQL:    parsedSQL,
		Params: params,

		SQLType: entity3.SQLType(req.SQLType),
	})
	if err != nil {
		return nil, fmt.Errorf("execute SQL failed: %v", err)
	}

	if operation == sqlparsercontract.OperationTypeInsert {
		if execResp.ResultSet == nil {
			execResp.ResultSet = &entity3.ResultSet{
				Rows: insertResult,
			}
		} else {
			execResp.ResultSet.Rows = insertResult
		}
	}
	return execResp.ResultSet, nil
}

func (d databaseService) executeSelectSQL(ctx context.Context, req *ExecuteSQLRequest, physicalTableName string, tableInfo *entity2.Database, fieldNameToPhysical map[string]string) (*entity3.ResultSet, error) {
	selectReq := &rdb.SelectDataRequest{
		TableName: physicalTableName,
		Limit:     int64PtrToIntPtr(req.Limit),
		Offset:    int64PtrToIntPtr(req.Offset),
	}

	fieldList := append(tableInfo.FieldList, physicaltable.GetCreateTimeField(), physicaltable.GetUidField(), physicaltable.GetIDField(), physicaltable.GetConnectIDField())
	fieldMap := slices.ToMap(fieldList, func(e *database.FieldItem) (string, *database.FieldItem) {
		return strconv.FormatInt(e.AlterID, 10), e
	})

	if req.SelectFieldList != nil && !req.SelectFieldList.IsDistinct && len(req.SelectFieldList.FieldID) > 0 {
		fields := make([]string, 0, len(req.SelectFieldList.FieldID))
		for _, fieldID := range req.SelectFieldList.FieldID {
			if _, exists := fieldMap[fieldID]; !exists {
				return nil, fmt.Errorf("fieldID %s does not exist", fieldID)
			}

			field, _ := fieldMap[fieldID]
			fields = append(fields, field.PhysicalName)
		}
		selectReq.Fields = fields
	}

	var complexCond *rdb.ComplexCondition
	var err error
	if req.Condition != nil {
		complexCond, err = convertCondition(ctx, req.Condition, fieldNameToPhysical, req.SQLParams)
		if err != nil {
			return nil, fmt.Errorf("convert condition failed: %v", err)
		}
	}

	// add rw mode
	if tableInfo.RwMode == table.BotTableRWMode_LimitedReadWrite && req.UserID != "" {
		cond := &rdb.Condition{
			Field:    database.DefaultUidColName,
			Operator: entity3.OperatorEqual,
			Value:    req.UserID,
		}

		if complexCond == nil {
			complexCond = &rdb.ComplexCondition{
				Conditions: []*rdb.Condition{cond},
			}
		} else {
			complexCond.Conditions = append(complexCond.Conditions, cond)
		}
	}

	if complexCond != nil {
		selectReq.Where = complexCond
	}

	if len(req.OrderByList) > 0 {
		orderBy := make([]*rdb.OrderBy, 0, len(req.OrderByList))
		for _, order := range req.OrderByList {
			physicalField := order.Field
			if mapped, exists := fieldNameToPhysical[order.Field]; exists {
				physicalField = mapped
			}

			orderBy = append(orderBy, &rdb.OrderBy{
				Field:     physicalField,
				Direction: convertSortDirection(order.Direction),
			})
		}
		selectReq.OrderBy = orderBy
	}

	selectResp, err := d.rdb.SelectData(ctx, selectReq)
	if err != nil {
		return nil, fmt.Errorf("select data failed: %v", err)
	}

	return selectResp.ResultSet, nil
}

func (d databaseService) executeInsertSQL(ctx context.Context, req *ExecuteSQLRequest, physicalTableName string, tableInfo *entity2.Database) (*entity3.ResultSet, error) {
	if len(req.UpsertRows) == 0 {
		return nil, fmt.Errorf("no data to insert")
	}

	insertData := make([]map[string]interface{}, 0, len(req.UpsertRows))
	ids, err := d.generator.GenMultiIDs(ctx, len(req.UpsertRows))
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrMemoryIDGenFailCode, errorx.KV("msg", "executeInsertSQL"))
	}

	fieldList := append(tableInfo.FieldList, physicaltable.GetCreateTimeField(), physicaltable.GetUidField(), physicaltable.GetIDField(), physicaltable.GetConnectIDField())
	fieldMap := slices.ToMap(fieldList, func(e *database.FieldItem) (string, *database.FieldItem) {
		return strconv.FormatInt(e.AlterID, 10), e
	})

	sqlParams := req.SQLParams
	i := 0

	insertResult := make([]map[string]interface{}, 0, len(req.UpsertRows))
	for index, upsertRow := range req.UpsertRows {
		rowData := make(map[string]interface{})

		cid := consts.CozeConnectorID
		if req.ConnectorID != nil {
			cid = *req.ConnectorID
		}

		if req.UserID != "" {
			rowData[database.DefaultUidColName] = req.UserID
		}
		rowData[database.DefaultCidColName] = cid
		rowData[database.DefaultCreateTimeColName] = time.Now()
		rowData[database.DefaultIDColName] = ids[index]

		for _, record := range upsertRow.Records {
			field, exists := fieldMap[record.FieldId]
			if !exists {
				return nil, errorx.New(errno.ErrMemoryDatabaseFieldNotFoundCode)
			}

			fieldVal := sqlParams[i].Value
			if sqlParams[i].ISNull || fieldVal == nil {
				rowData[field.PhysicalName] = nil
				i++
				continue
			}

			convertedValue, err := convertor.ConvertValueByType(*fieldVal, field.Type)
			if err != nil {
				logs.Warnf("convert value failed: %v, using original value", err)
				rowData[field.PhysicalName] = *fieldVal
			} else {
				rowData[field.PhysicalName] = convertedValue
			}
			i++
		}

		insertData = append(insertData, rowData)
		insertResult = append(insertResult, map[string]interface{}{
			database.DefaultIDColName: ids[index],
		})
	}

	insertResp, err := d.rdb.InsertData(ctx, &rdb.InsertDataRequest{
		TableName: physicalTableName,
		Data:      insertData,
	})
	if err != nil {
		return nil, fmt.Errorf("insert data failed: %v", err)
	}

	return &entity3.ResultSet{
		Rows:         insertResult,
		AffectedRows: insertResp.AffectedRows,
	}, nil
}

func (d databaseService) executeUpdateSQL(ctx context.Context, req *ExecuteSQLRequest, physicalTableName string, tableInfo *entity2.Database, fieldNameToPhysical map[string]string) (int64, error) {
	if len(req.UpsertRows) == 0 || req.Condition == nil {
		return -1, fmt.Errorf("missing update data or condition")
	}

	fieldList := append(tableInfo.FieldList, physicaltable.GetCreateTimeField(), physicaltable.GetUidField(), physicaltable.GetIDField(), physicaltable.GetConnectIDField())
	fieldMap := slices.ToMap(fieldList, func(e *database.FieldItem) (string, *database.FieldItem) {
		return strconv.FormatInt(e.AlterID, 10), e
	})

	updateData := make(map[string]interface{})
	index := 0
	for _, record := range req.UpsertRows[0].Records {
		field, exists := fieldMap[record.FieldId]
		if !exists {
			return -1, errorx.New(errno.ErrMemoryDatabaseFieldNotFoundCode)
		}

		param := req.SQLParams[index]
		fieldVal := param.Value
		index++
		if param.ISNull || fieldVal == nil {
			updateData[field.PhysicalName] = nil
			continue
		}

		convertedValue, err := convertor.ConvertValueByType(*fieldVal, field.Type)
		if err != nil {
			logs.Warnf("convert value failed: %v, using original value", err)
			updateData[field.PhysicalName] = *fieldVal
		} else {
			updateData[field.PhysicalName] = convertedValue
		}
	}

	condParams := req.SQLParams[index:]
	complexCond, err := convertCondition(ctx, req.Condition, fieldNameToPhysical, condParams)
	if err != nil {
		return -1, fmt.Errorf("convert condition failed: %v", err)
	}

	// add rw mode
	if tableInfo.RwMode == table.BotTableRWMode_LimitedReadWrite && req.UserID != "" {
		cond := &rdb.Condition{
			Field:    database.DefaultUidColName,
			Operator: entity3.OperatorEqual,
			Value:    req.UserID,
		}

		if complexCond == nil {
			complexCond = &rdb.ComplexCondition{
				Conditions: []*rdb.Condition{cond},
			}
		} else {
			complexCond.Conditions = append(complexCond.Conditions, cond)
		}
	}

	updateResp, err := d.rdb.UpdateData(ctx, &rdb.UpdateDataRequest{
		TableName: physicalTableName,
		Data:      updateData,
		Where:     complexCond,
		Limit:     int64PtrToIntPtr(req.Limit),
	})
	if err != nil {
		return -1, fmt.Errorf("update data failed: %v", err)
	}

	return updateResp.AffectedRows, nil
}

func (d databaseService) executeDeleteSQL(ctx context.Context, req *ExecuteSQLRequest, physicalTableName string, tableInfo *entity2.Database, fieldNameToPhysical map[string]string) (int64, error) {
	if req.Condition == nil {
		return -1, fmt.Errorf("missing delete condition")
	}

	complexCond, err := convertCondition(ctx, req.Condition, fieldNameToPhysical, req.SQLParams)
	if err != nil {
		return -1, fmt.Errorf("convert condition failed: %v", err)
	}

	// add rw mode
	if tableInfo.RwMode == table.BotTableRWMode_LimitedReadWrite && req.UserID != "" {
		cond := &rdb.Condition{
			Field:    database.DefaultUidColName,
			Operator: entity3.OperatorEqual,
			Value:    req.UserID,
		}

		if complexCond == nil {
			complexCond = &rdb.ComplexCondition{
				Conditions: []*rdb.Condition{cond},
			}
		} else {
			complexCond.Conditions = append(complexCond.Conditions, cond)
		}
	}

	deleteResp, err := d.rdb.DeleteData(ctx, &rdb.DeleteDataRequest{
		TableName: physicalTableName,
		Where:     complexCond,
		Limit:     int64PtrToIntPtr(req.Limit),
	})
	if err != nil {
		return -1, fmt.Errorf("delete data failed: %v", err)
	}

	return deleteResp.AffectedRows, nil
}

func int64PtrToIntPtr(i64ptr *int64) *int {
	if i64ptr == nil {
		return nil
	}

	i := int(*i64ptr)
	return &i
}

func convertSortDirection(direction table.SortDirection) entity3.SortDirection {
	if direction == table.SortDirection_Desc {
		return entity3.SortDirectionDesc
	}
	return entity3.SortDirectionAsc
}

func convertCondition(ctx context.Context, cond *database.ComplexCondition, fieldMap map[string]string, params []*database.SQLParamVal) (*rdb.ComplexCondition, error) {
	if cond == nil {
		return nil, nil
	}

	result := &rdb.ComplexCondition{
		Operator: convertor.ConvertLogicOperator(cond.Logic),
	}

	index := 0
	if len(cond.Conditions) > 0 {
		conditions := make([]*rdb.Condition, 0, len(cond.Conditions))
		for _, c := range cond.Conditions {
			leftField := c.Left
			if mapped, exists := fieldMap[c.Left]; exists {
				leftField = mapped
			}

			if c.Operation == database.Operation_IS_NULL || c.Operation == database.Operation_IS_NOT_NULL {
				conditions = append(conditions, &rdb.Condition{
					Field:    leftField,
					Operator: convertor.ConvertOperator(c.Operation),
				})
				continue
			}

			if c.Operation == database.Operation_IN || c.Operation == database.Operation_NOT_IN {
				// c.Right: example: (?,?)
				qCount := 0
				for i := 0; i < len(c.Right); i++ {
					if c.Right[i] == '?' {
						qCount++
					}
				}
				if qCount == 0 {
					return nil, fmt.Errorf("IN/NOT_IN condition right side must contain ? placeholders")
				}
				vals := make([]interface{}, 0, qCount)
				for j := 0; j < qCount; j++ {
					if index >= len(params) {
						return nil, fmt.Errorf("not enough params for IN/NOT_IN condition")
					}
					if params[index].ISNull || params[index].Value == nil {
						index++
						continue
					}
					vals = append(vals, decryptSysUUIDKey(ctx, leftField, *params[index].Value))
					index++
				}
				conditions = append(conditions, &rdb.Condition{
					Field:    leftField,
					Operator: convertor.ConvertOperator(c.Operation),
					Value:    vals,
				})
				continue
			}

			if params[index].ISNull || params[index].Value == nil {
				index++
				continue
			}

			conditions = append(conditions, &rdb.Condition{
				Field:    leftField,
				Operator: convertor.ConvertOperator(c.Operation),
				Value:    decryptSysUUIDKey(ctx, leftField, *params[index].Value),
			})
			index++
		}
		result.Conditions = conditions
	}
	// if cond.NestedConditions != nil {
	//	nested, err := convertCondition(cond.NestedConditions, fieldMap, params)
	//	if err != nil {
	//		return nil, err
	//	}
	//	result.NestedConditions = []*rdb.ComplexCondition{nested}
	// }

	return result, nil
}

func decryptSysUUIDKey(ctx context.Context, leftField, value string) string {
	if leftField == database.DefaultUidDisplayColName || leftField == database.DefaultUidColName {
		decryptVal := crossvariables.DefaultSVC().DecryptSysUUIDKey(ctx, value)
		if decryptVal != nil {
			value = decryptVal.ConnectorUID
		}
	}

	return value
}

func (d databaseService) BindDatabase(ctx context.Context, req *BindDatabaseToAgentRequest) error {
	draft, err := d.MGetDatabase(ctx, &MGetDatabaseRequest{
		Basics: []*database.DatabaseBasic{
			{
				ID:        req.DraftDatabaseID,
				TableType: table.TableType_DraftTable,
			},
		},
	})
	if err != nil {
		return err
	}
	if len(draft.Databases) == 0 {
		return fmt.Errorf("online table not found, id: %d", req.DraftDatabaseID)
	}

	onlineID := draft.Databases[0].GetOnlineID()
	relations := []*database.AgentToDatabase{
		{
			AgentID:    req.AgentID,
			DatabaseID: onlineID,
			TableType:  table.TableType_OnlineTable,
		},
		{
			AgentID:    req.AgentID,
			DatabaseID: req.DraftDatabaseID,
			TableType:  table.TableType_DraftTable,
		},
	}

	_, err = d.agentToDatabaseDAO.BatchCreate(ctx, relations)
	if err != nil {
		return fmt.Errorf("failed to bind databases to agent: %w", err)
	}

	return nil
}

func (d databaseService) UnBindDatabase(ctx context.Context, req *UnBindDatabaseToAgentRequest) error {
	draft, err := d.MGetDatabase(ctx, &MGetDatabaseRequest{
		Basics: []*database.DatabaseBasic{
			{
				ID:        req.DraftDatabaseID,
				TableType: table.TableType_DraftTable,
			},
		},
	})
	if err != nil {
		return err
	}
	if len(draft.Databases) == 0 {
		return fmt.Errorf("online table not found, id: %d", req.DraftDatabaseID)
	}

	onlineID := draft.Databases[0].GetOnlineID()
	relations := []*database.AgentToDatabaseBasic{
		{
			AgentID:    req.AgentID,
			DatabaseID: onlineID,
		},
		{
			AgentID:    req.AgentID,
			DatabaseID: req.DraftDatabaseID,
		},
	}

	err = d.agentToDatabaseDAO.BatchDelete(ctx, relations)
	if err != nil {
		return fmt.Errorf("failed to unbind databases from agent: %w", err)
	}

	return nil
}

func (d databaseService) MGetDatabaseByAgentID(ctx context.Context, req *MGetDatabaseByAgentIDRequest) (*MGetDatabaseByAgentIDResponse, error) {
	if req == nil {
		return nil, fmt.Errorf("invalid request: request is nil")
	}

	relations, err := d.agentToDatabaseDAO.ListByAgentID(ctx, req.AgentID, req.TableType)
	if err != nil {
		return nil, err
	}

	mGetBasics := make([]*database.DatabaseBasic, 0, len(relations))
	for _, relation := range relations {
		mGetBasics = append(mGetBasics, &database.DatabaseBasic{
			ID:            relation.DatabaseID,
			TableType:     req.TableType,
			NeedSysFields: req.NeedSysFields,
		})
	}
	databases, err := d.MGetDatabase(ctx, &MGetDatabaseRequest{Basics: mGetBasics})
	if err != nil {
		return nil, err
	}

	return &MGetDatabaseByAgentIDResponse{
		Databases: databases.Databases,
	}, nil
}

// PublishDatabase return online database according to draft database info
func (d databaseService) PublishDatabase(ctx context.Context, req *PublishDatabaseRequest) (*PublishDatabaseResponse, error) {
	if req == nil {
		return nil, fmt.Errorf("invalid request: request is nil")
	}

	relationResp, err := d.MGetRelationsByAgentID(ctx, &MGetRelationsByAgentIDRequest{
		AgentID:   req.AgentID,
		TableType: table.TableType_DraftTable,
	})
	if err != nil {
		return nil, err
	}
	if len(relationResp.Relations) == 0 {
		return &PublishDatabaseResponse{}, nil
	}

	dBasics := make([]*database.DatabaseBasic, 0, len(relationResp.Relations))
	for _, draftR := range relationResp.Relations {
		dBasics = append(dBasics, &database.DatabaseBasic{
			ID:            draftR.DatabaseID,
			TableType:     table.TableType_DraftTable,
			NeedSysFields: false,
		})
	}

	draftDatabaseResp, err := d.MGetDatabase(ctx, &MGetDatabaseRequest{
		Basics: dBasics,
	})
	if err != nil {
		return nil, err
	}

	oBasics := make([]*database.DatabaseBasic, 0, len(draftDatabaseResp.Databases))
	for _, draft := range draftDatabaseResp.Databases {
		oBasics = append(oBasics, &database.DatabaseBasic{
			ID:            draft.GetOnlineID(),
			TableType:     table.TableType_OnlineTable,
			NeedSysFields: false,
		})
	}

	onlineDatabaseResp, err := d.MGetDatabase(ctx, &MGetDatabaseRequest{
		Basics: oBasics,
	})
	if err != nil {
		return nil, err
	}

	results := make([]*bot_common.Database, 0, len(onlineDatabaseResp.Databases))
	for _, online := range onlineDatabaseResp.Databases {
		fields := make([]*bot_common.FieldItem, 0, len(online.FieldList))
		for _, field := range online.FieldList {
			fields = append(fields, &bot_common.FieldItem{
				Name:         ptr.Of(field.Name),
				Desc:         ptr.Of(field.Desc),
				Type:         ptr.Of(bot_common.FieldItemType(field.Type)),
				MustRequired: ptr.Of(field.MustRequired),
				AlterId:      ptr.Of(field.AlterID),
				Id:           ptr.Of(int64(0)),
			})
		}

		results = append(results, &bot_common.Database{
			TableId:   ptr.Of(strconv.FormatInt(online.ID, 10)),
			TableName: ptr.Of(online.TableName),
			TableDesc: ptr.Of(online.TableDesc),
			FieldList: fields,
			RWMode:    ptr.Of(bot_common.BotTableRWMode(online.RwMode)),
		})
	}

	return &PublishDatabaseResponse{
		OnlineDatabases: results,
	}, nil
}

func (d databaseService) MGetRelationsByAgentID(ctx context.Context, req *MGetRelationsByAgentIDRequest) (*MGetRelationsByAgentIDResponse, error) {
	if req == nil {
		return nil, fmt.Errorf("invalid request: request is nil")
	}

	relations, err := d.agentToDatabaseDAO.ListByAgentID(ctx, req.AgentID, req.TableType)
	if err != nil {
		return nil, err
	}

	return &MGetRelationsByAgentIDResponse{
		Relations: relations,
	}, nil
}

func (d databaseService) GetDatabaseTableSchema(ctx context.Context, req *GetDatabaseTableSchemaRequest) (*GetDatabaseTableSchemaResponse, error) {
	parser := &sheet.TosTableParser{
		UserID:         req.UserID,
		DocumentSource: database.DocumentSourceType_Document,
		TosURI:         req.TosURL,
		TosServ:        d.storage,
	}

	res, extra, err := parser.GetTableDataBySheetIDx(ctx, entity2.TableReaderMeta{
		TosMaxLine:    100000,
		HeaderLineIdx: req.TableSheet.HeaderLineIdx,
		SheetId:       req.TableSheet.SheetID,
		StartLineIdx:  req.TableSheet.StartLineIdx,
		ReaderMethod:  database.TableReadDataMethodHead,
		ReadLineCnt:   20,
	})
	if err != nil {
		return nil, err
	}

	res.Columns, err = parser.PredictColumnType(res.Columns, res.SampleData, req.TableSheet.SheetID, req.TableSheet.StartLineIdx)
	if err != nil {
		return nil, err
	}

	resp := &GetDatabaseTableSchemaResponse{}
	if req.TableDataType == table.TableDataType_AllData || req.TableDataType == table.TableDataType_OnlyPreview {
		previewData, tErr := parser.TransferPreviewData(ctx, res.Columns, res.SampleData, 20)
		if tErr != nil {
			return resp, tErr
		}
		resp.PreviewData = previewData
	}
	resp.TableMeta = res.Columns
	resp.SheetList = extra.Sheets

	return resp, nil
}

func (d databaseService) ValidateDatabaseTableSchema(ctx context.Context, req *ValidateDatabaseTableSchemaRequest) (*ValidateDatabaseTableSchemaResponse, error) {
	parser := &sheet.TosTableParser{
		UserID:         req.UserID,
		DocumentSource: database.DocumentSourceType_Document,
		TosURI:         req.TosURL,
		TosServ:        d.storage,
	}

	res, sheetRes, err := parser.GetTableDataBySheetIDx(ctx, entity2.TableReaderMeta{
		TosMaxLine:    100000,
		HeaderLineIdx: req.TableSheet.HeaderLineIdx,
		SheetId:       req.TableSheet.SheetID,
		StartLineIdx:  req.TableSheet.StartLineIdx,
		ReaderMethod:  database.TableReadDataMethodAll,
		ReadLineCnt:   20,
	})
	if err != nil {
		return nil, err
	}

	valid, invalidMsg := sheet.CheckSheetIsValid(req.Fields, res.Columns, sheetRes)
	return &ValidateDatabaseTableSchemaResponse{
		Valid:      valid,
		InvalidMsg: invalidMsg,
	}, nil
}

func (d databaseService) SubmitDatabaseInsertTask(ctx context.Context, req *SubmitDatabaseInsertTaskRequest) error {
	var err error
	failKey := onlineFailReasonKey
	if req.TableType == table.TableType_DraftTable {
		failKey = draftFailReasonKey
	}

	defer func() {
		if r := recover(); r != nil {
			errMsg := fmt.Sprintf("panic: %v", r)
			d.cache.Set(ctx, fmt.Sprintf(failKey, req.DatabaseID, req.UserID), errMsg, redisKeyTimeOut)
			err = fmt.Errorf("panic: %v", r)
			return
		}
		if err != nil {
			d.cache.Set(ctx, fmt.Sprintf(failKey, req.DatabaseID, req.UserID), err.Error(), redisKeyTimeOut)
		}
	}()

	parser := &sheet.TosTableParser{
		UserID:         req.UserID,
		DocumentSource: database.DocumentSourceType_Document,
		TosURI:         req.FileURI,
		TosServ:        d.storage,
	}
	parseData, extra, err := parser.GetTableDataBySheetIDx(ctx, entity2.TableReaderMeta{
		TosMaxLine:    100000,
		SheetId:       req.TableSheet.SheetID,
		HeaderLineIdx: req.TableSheet.HeaderLineIdx,
		StartLineIdx:  req.TableSheet.StartLineIdx,
		ReaderMethod:  database.TableReadDataMethodAll,
	},
	)
	if err != nil {
		return err
	}

	err = d.initializeCache(ctx, req, parseData, extra)
	if err != nil {
		return err
	}

	columns := parseData.Columns

	records := make([]map[string]string, 0, len(parseData.SampleData))
	for _, data := range parseData.SampleData {
		record := make(map[string]string)
		for i, column := range columns {
			record[column.ColumnName] = data[i]
		}
		records = append(records, record)
	}

	batchSize := 20
	go func() {
		defer func() {
			if r := recover(); r != nil {
				errMsg := fmt.Sprintf("panic: %v", r)
				d.cache.Set(ctx, fmt.Sprintf(failKey, req.DatabaseID, req.UserID), errMsg, redisKeyTimeOut)
			}
		}()

		for i := 0; i < len(records); i += batchSize {
			end := i + batchSize
			if end > len(records) {
				end = len(records)
			}
			batchRecords := records[i:end]
			err = d.AddDatabaseRecord(ctx, &AddDatabaseRecordRequest{
				DatabaseID:  req.DatabaseID,
				TableType:   req.TableType,
				ConnectorID: req.ConnectorID,
				UserID:      req.UserID,
				Records:     batchRecords,
			})
			if err != nil {
				d.cache.Set(ctx, fmt.Sprintf(failKey, req.DatabaseID, req.UserID), err.Error(), redisKeyTimeOut)
				return
			}

			err = d.increaseProgress(ctx, req, int64(len(batchRecords)))
			if err != nil {
				d.cache.Set(ctx, fmt.Sprintf(failKey, req.DatabaseID, req.UserID), err.Error(), redisKeyTimeOut)
				return
			}
		}
	}()

	return nil
}

func (d databaseService) GetDatabaseFileProgressData(ctx context.Context, req *GetDatabaseFileProgressDataRequest) (*GetDatabaseFileProgressDataResponse, error) {
	totalKey := onlineTotalCountKey
	if req.TableType == table.TableType_DraftTable {
		totalKey = draftTotalCountKey
	}
	progressKey := onlineProgressKey
	if req.TableType == table.TableType_DraftTable {
		progressKey = draftProgressKey
	}
	failKey := onlineFailReasonKey
	if req.TableType == table.TableType_DraftTable {
		failKey = draftFailReasonKey
	}
	currentFileName := onlineCurrentFileName
	if req.TableType == table.TableType_DraftTable {
		currentFileName = draftCurrentFileName
	}
	totalNum, err := d.cache.Get(ctx, fmt.Sprintf(totalKey, req.DatabaseID, req.UserID)).Int64()
	if err != nil && !errors.Is(err, redis.Nil) {
		return nil, err
	}

	progressNum, err := d.cache.Get(ctx, fmt.Sprintf(progressKey, req.DatabaseID, req.UserID)).Int64()
	if err != nil && !errors.Is(err, redis.Nil) {
		return nil, err
	}

	failReason, err := d.cache.Get(ctx, fmt.Sprintf(failKey, req.DatabaseID, req.UserID)).Result()
	if err != nil && !errors.Is(err, redis.Nil) {
		return nil, err
	}

	fileName, err := d.cache.Get(ctx, fmt.Sprintf(currentFileName, req.DatabaseID, req.UserID)).Result()
	if err != nil && !errors.Is(err, redis.Nil) {
		return nil, err
	}

	resp := &GetDatabaseFileProgressDataResponse{}
	if totalNum == 0 {
		resp.FileName = ""
		resp.Progress = 100
	} else {
		resp.FileName = fileName
		resp.Progress = int32(float32(progressNum) / float32(totalNum) * 100)
		resp.StatusDescript = ptr.Of(failReason)
	}
	return resp, nil
}

const (
	draftTotalCountKey    = "database_file_%d_%d_draft_total"
	onlineTotalCountKey   = "database_file_%d_%d_online_total"
	draftProgressKey      = "database_file_%d_%d_draft_progress"
	onlineProgressKey     = "database_file_%d_%d_online_progress"
	draftFailReasonKey    = "database_file_%d_%d_draft_fail_reason"
	onlineFailReasonKey   = "database_file_%d_%d_online_fail_reason"
	draftCurrentFileName  = "database_file_%d_%d_draft_file_name"
	onlineCurrentFileName = "database_file_%d_%d_online_file_name"
	redisKeyTimeOut       = time.Hour * 12
)

func (d databaseService) initializeCache(ctx context.Context, req *SubmitDatabaseInsertTaskRequest, parseData *entity2.TableReaderSheetData, extra *entity2.ExcelExtraInfo) error {
	tableType := req.TableType
	userID := req.UserID
	databaseID := req.DatabaseID

	totalKey := onlineTotalCountKey
	if tableType == table.TableType_DraftTable {
		totalKey = draftTotalCountKey
	}
	currentFileName := onlineCurrentFileName
	if tableType == table.TableType_DraftTable {
		currentFileName = draftCurrentFileName
	}
	progressKey := onlineProgressKey
	if tableType == table.TableType_DraftTable {
		progressKey = draftProgressKey
	}
	failKey := onlineFailReasonKey
	if tableType == table.TableType_DraftTable {
		failKey = draftFailReasonKey
	}

	_, err := d.cache.Set(ctx, fmt.Sprintf(totalKey, databaseID, userID), fmt.Sprintf("%d", len(parseData.SampleData)), redisKeyTimeOut).Result()
	if err != nil {
		return err
	}

	_, err = d.cache.Set(ctx, fmt.Sprintf(progressKey, databaseID, userID), int64(0), redisKeyTimeOut).Result()
	if err != nil {
		return err
	}

	_, err = d.cache.Set(ctx, fmt.Sprintf(failKey, databaseID, userID), "", redisKeyTimeOut).Result()
	if err != nil {
		return err
	}

	_, err = d.cache.Set(ctx, fmt.Sprintf(currentFileName, databaseID, userID), extra.Sheets[req.TableSheet.SheetID].SheetName, redisKeyTimeOut).Result()
	if err != nil {
		return err
	}

	return nil
}

func (d databaseService) increaseProgress(ctx context.Context, req *SubmitDatabaseInsertTaskRequest, successNum int64) error {
	tableType := req.TableType
	userID := req.UserID
	databaseID := req.DatabaseID

	progressKey := onlineProgressKey
	if tableType == table.TableType_DraftTable {
		progressKey = draftProgressKey
	}

	_, err := d.cache.IncrBy(ctx, fmt.Sprintf(progressKey, databaseID, userID), successNum).Result()
	if err != nil {
		return err
	}

	return nil
}

func (d databaseService) GetDraftDatabaseByOnlineID(ctx context.Context, req *GetDraftDatabaseByOnlineIDRequest) (*GetDraftDatabaseByOnlineIDResponse, error) {
	online, err := d.MGetDatabase(ctx, &MGetDatabaseRequest{
		Basics: []*database.DatabaseBasic{
			{
				ID:        req.OnlineID,
				TableType: table.TableType_OnlineTable,
			},
		},
	})
	if err != nil {
		return nil, err
	}
	if len(online.Databases) == 0 {
		return nil, fmt.Errorf("online table not found, id: %d", req.OnlineID)
	}

	draftID := online.Databases[0].GetDraftID()

	draftResp, err := d.MGetDatabase(ctx, &MGetDatabaseRequest{
		Basics: []*database.DatabaseBasic{
			{
				ID:        draftID,
				TableType: table.TableType_DraftTable,
			},
		},
	})
	if err != nil {
		return nil, err
	}
	if len(draftResp.Databases) == 0 {
		return nil, fmt.Errorf("online table not found, id: %d", req.OnlineID)
	}

	return &GetDraftDatabaseByOnlineIDResponse{
		Database: draftResp.Databases[0],
	}, nil
}

// DeleteDatabaseByAppID delete all records and all physical tables by app id
func (d databaseService) DeleteDatabaseByAppID(ctx context.Context, req *DeleteDatabaseByAppIDRequest) (*DeleteDatabaseByAppIDResponse, error) {
	onlineDBInfos, err := d.listDatabasesByAppID(ctx, req.AppID, table.TableType_OnlineTable)
	if err != nil {
		return nil, err
	}

	draftDBInfos, err := d.listDatabasesByAppID(ctx, req.AppID, table.TableType_DraftTable)
	if err != nil {
		return nil, err
	}

	tx := query.Use(d.db).Begin()
	if tx.Error != nil {
		return nil, fmt.Errorf("start transaction failed, %v", tx.Error)
	}

	defer func() {
		if r := recover(); r != nil {
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))
			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}
		}
	}()

	onlineIDs := make([]int64, 0, len(onlineDBInfos))
	for _, db := range onlineDBInfos {
		onlineIDs = append(onlineIDs, db.ID)
	}

	draftIDs := make([]int64, 0, len(draftDBInfos))
	for _, db := range draftDBInfos {
		draftIDs = append(draftIDs, db.ID)
	}

	if err = d.onlineDAO.BatchDeleteWithTX(ctx, tx, onlineIDs); err != nil {
		return nil, err
	}

	if err = d.draftDAO.BatchDeleteWithTX(ctx, tx, draftIDs); err != nil {
		return nil, err
	}

	err = tx.Commit()
	if err != nil {
		return nil, fmt.Errorf("commit transaction failed: %v", err)
	}

	// delete draft and online physical table
	onlinePhysicals := make([]string, 0, len(onlineDBInfos))
	for _, db := range onlineDBInfos {
		onlinePhysicals = append(onlinePhysicals, db.ActualTableName)
	}

	draftPhysicals := make([]string, 0, len(draftDBInfos))
	for _, db := range draftDBInfos {
		draftPhysicals = append(draftPhysicals, db.ActualTableName)
	}

	for _, physical := range onlinePhysicals {
		_, err = d.rdb.DropTable(ctx, &rdb.DropTableRequest{
			TableName: physical,
		})
		if err != nil {
			logs.Errorf("drop online physical table failed: %v, table_name=%s", err, physical)
		}
	}
	for _, physical := range draftPhysicals {
		_, err = d.rdb.DropTable(ctx, &rdb.DropTableRequest{
			TableName: physical,
		})
		if err != nil {
			logs.Errorf("drop draft physical table failed: %v, table_name=%s", err, physical)
		}
	}

	return &DeleteDatabaseByAppIDResponse{
		DeletedDatabaseIDs: onlineIDs,
	}, nil
}

func (d databaseService) listDatabasesByAppID(ctx context.Context, appID int64, tableType table.TableType) ([]*entity2.Database, error) {
	const batchSize = 100
	offset := 0
	dbInfos := make([]*entity2.Database, 0)
	for {
		resp, err := d.ListDatabase(ctx, &ListDatabaseRequest{
			AppID:     appID,
			TableType: tableType,
			Limit:     batchSize,
			Offset:    offset,
		})
		if err != nil {
			return nil, err
		}

		for _, db := range resp.Databases {
			dbInfos = append(dbInfos, db)
		}

		if !resp.HasMore {
			break
		}

		offset += batchSize
	}

	return dbInfos, nil
}

func (d databaseService) GetAllDatabaseByAppID(ctx context.Context, req *GetAllDatabaseByAppIDRequest) (*GetAllDatabaseByAppIDResponse, error) {
	onlineDBs, err := d.listDatabasesByAppID(ctx, req.AppID, table.TableType_OnlineTable)
	if err != nil {
		return nil, err
	}

	return &GetAllDatabaseByAppIDResponse{
		Databases: onlineDBs,
	}, nil
}
