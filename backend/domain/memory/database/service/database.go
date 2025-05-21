package service

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"math/rand"
	"runtime/debug"
	"strconv"
	"time"

	"code.byted.org/flow/opencoze/backend/types/consts"

	"github.com/tealeg/xlsx/v3"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	resCommon "code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/domain/memory/database"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/dao"
	entity2 "code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/internal/convertor"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/internal/physicaltable"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	sqlparsercontract "code.byted.org/flow/opencoze/backend/infra/contract/sqlparser"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/infra/impl/sqlparser"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type databaseService struct {
	rdb                rdb.RDB
	db                 *gorm.DB
	generator          idgen.IDGenerator
	draftDAO           dao.DraftDAO
	onlineDAO          dao.OnlineDAO
	agentToDatabaseDAO dao.AgentToDatabaseDAO
	storage            storage.Storage
	resNotifierSVC     crossdomain.ResourceDomainNotifier
}

func NewService(rdb rdb.RDB, db *gorm.DB, generator idgen.IDGenerator, storage storage.Storage, resourceDomainNotifier search.ResourceEventbus) database.Database {
	return &databaseService{
		rdb:                rdb,
		db:                 db,
		generator:          generator,
		draftDAO:           dao.NewDraftDatabaseDAO(db, generator),
		onlineDAO:          dao.NewOnlineDatabaseDAO(db, generator),
		agentToDatabaseDAO: dao.NewAgentToDatabaseDAO(db, generator),
		storage:            storage,
		resNotifierSVC:     resourceDomainNotifier,
	}
}

func (d databaseService) CreateDatabase(ctx context.Context, req *database.CreateDatabaseRequest) (*database.CreateDatabaseResponse, error) {
	draftEntity, onlineEntity := req.Database, req.Database

	fieldItems, columns, err := physicaltable.CreateFieldInfo(ctx, d.generator, req.Database.FieldList)
	if err != nil {
		return nil, err
	}

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
		return nil, err
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
		return nil, err
	}

	// insert draft and online database info
	tx := query.Use(d.db).Begin()
	if tx.Error != nil {
		return nil, fmt.Errorf("start transaction failed, %v", tx.Error)
	}

	defer func() {
		if r := recover(); r != nil {
			e := tx.Rollback()
			if e != nil {
				logs.Errorf("rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))
			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
				logs.Errorf("rollback failed, err=%v", e)
			}
		}
	}()

	_, err = d.draftDAO.CreateWithTX(ctx, tx, draftEntity, draftID, onlineID, draftPhysicalTableRes.Table.Name)
	if err != nil {
		return nil, err
	}

	_, err = d.onlineDAO.CreateWithTX(ctx, tx, onlineEntity, draftID, onlineID, onlinePhysicalTableRes.Table.Name)
	if err != nil {
		return nil, err
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	onlineEntity.ActualTableName = onlinePhysicalTableRes.Table.Name
	onlineEntity.ID = onlineID

	err = d.resNotifierSVC.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Created,
		Resource: &searchEntity.Resource{
			ResType:     resCommon.ResType_Database,
			ID:          onlineEntity.ID,
			Name:        onlineEntity.Name,
			Desc:        onlineEntity.Description,
			SpaceID:     onlineEntity.SpaceID,
			OwnerID:     onlineEntity.CreatorID,
			PublishedAt: time.Now().UnixMilli(),
		},
	})
	if err != nil {
		return nil, fmt.Errorf("publish resource failed, err=%w", err)
	}

	return &database.CreateDatabaseResponse{
		Database: onlineEntity,
	}, nil
}

func (d databaseService) UpdateDatabase(ctx context.Context, req *database.UpdateDatabaseRequest) (*database.UpdateDatabaseResponse, error) {
	// req.Database.ID is the id of online database
	input := req.Database
	if input == nil {
		return nil, fmt.Errorf("input database is nil")
	}

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

	defer func() {
		if r := recover(); r != nil {
			e := tx.Rollback()
			if e != nil {
				logs.Errorf("rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))
			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
				logs.Errorf("rollback failed, err=%v", e)
			}
		}
	}()

	err = d.draftDAO.UpdateWithTX(ctx, tx, &draftEntity)
	if err != nil {
		return nil, fmt.Errorf("update draft database info failed: %v", err)
	}

	err = d.onlineDAO.UpdateWithTX(ctx, tx, &onlineEntity)
	if err != nil {
		return nil, fmt.Errorf("update online database info failed: %v", err)
	}

	err = tx.Commit()
	if err != nil {
		return nil, fmt.Errorf("commit transaction failed: %v", err)
	}

	err = d.resNotifierSVC.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Updated,
		Resource: &searchEntity.Resource{
			ResType:     resCommon.ResType_Database,
			ID:          onlineEntity.ID,
			Name:        onlineEntity.Name,
			Desc:        onlineEntity.Description,
			SpaceID:     onlineEntity.SpaceID,
			OwnerID:     onlineEntity.CreatorID,
			PublishedAt: time.Now().UnixMilli(),
		},
	})
	if err != nil {
		return nil, fmt.Errorf("publish resource failed, err=%w", err)
	}

	return &database.UpdateDatabaseResponse{
		Database: &onlineEntity,
	}, nil
}

func (d databaseService) DeleteDatabase(ctx context.Context, req *database.DeleteDatabaseRequest) error {
	onlineInfo, err := d.onlineDAO.Get(ctx, req.Database.ID)
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
				logs.Errorf("rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))
			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
				logs.Errorf("rollback failed, err=%v", e)
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

	err = d.resNotifierSVC.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Deleted,
		Resource: &searchEntity.Resource{
			ResType:     resCommon.ResType_Database,
			ID:          onlineInfo.ID,
			Name:        onlineInfo.Name,
			Desc:        onlineInfo.Description,
			SpaceID:     onlineInfo.SpaceID,
			OwnerID:     onlineInfo.CreatorID,
			PublishedAt: time.Now().UnixMilli(),
		},
	})
	if err != nil {
		return fmt.Errorf("publish resource failed, err=%w", err)
	}

	return nil
}

func (d databaseService) MGetDatabase(ctx context.Context, req *database.MGetDatabaseRequest) (*database.MGetDatabaseResponse, error) {
	if len(req.Basics) == 0 {
		return &database.MGetDatabaseResponse{
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
			if basic.TableType == entity2.TableType_OnlineTable {
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
				onlineDatabase.FieldList = make([]*entity2.FieldItem, 0, 3)
			}
			onlineDatabase.FieldList = append(onlineDatabase.FieldList, physicaltable.GetCreateTimeField(), physicaltable.GetUidField(), physicaltable.GetIDField(), physicaltable.GetConnectIDField())
		}
	}
	for _, draftDatabase := range draftDatabases {
		if needSys, ok := draftID2NeedSysFields[draftDatabase.ID]; ok && needSys {
			if draftDatabase.FieldList == nil {
				draftDatabase.FieldList = make([]*entity2.FieldItem, 0, 3)
			}
			draftDatabase.FieldList = append(draftDatabase.FieldList, physicaltable.GetCreateTimeField(), physicaltable.GetUidField(), physicaltable.GetIDField(), physicaltable.GetConnectIDField())
		}
	}

	databases := make([]*entity2.Database, 0)
	databases = append(databases, onlineDatabases...)
	databases = append(databases, draftDatabases...)

	return &database.MGetDatabaseResponse{
		Databases: databases,
	}, nil
}

func (d databaseService) ListDatabase(ctx context.Context, req *database.ListDatabaseRequest) (*database.ListDatabaseResponse, error) {
	filter := &entity2.DatabaseFilter{
		CreatorID: req.CreatorID,
		SpaceID:   req.SpaceID,
		TableName: req.TableName,
	}

	page := &entity2.Pagination{
		Limit:  req.Limit,
		Offset: req.Offset,
	}

	var databases []*entity2.Database
	var err error
	var count int64
	if req.TableType == entity2.TableType_OnlineTable {
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

	var hasMore bool
	if count <= int64(req.Limit)+int64(req.Offset) {
		hasMore = false
	} else {
		hasMore = true
	}

	return &database.ListDatabaseResponse{
		Databases:  databases,
		HasMore:    hasMore,
		TotalCount: count,
	}, nil
}

func (d databaseService) AddDatabaseRecord(ctx context.Context, req *database.AddDatabaseRecordRequest) error {
	var tableInfo *entity2.Database
	var err error

	if req.TableType == entity2.TableType_OnlineTable {
		tableInfo, err = d.onlineDAO.Get(ctx, req.DatabaseID)
	} else {
		tableInfo, err = d.draftDAO.Get(ctx, req.DatabaseID)
	}

	if err != nil {
		return fmt.Errorf("get table info failed: %v", err)
	}

	if tableInfo.RwMode == entity2.BotTableRWMode_ReadOnly {
		return fmt.Errorf("table is readonly, cannot add records")
	}

	physicalTableName := tableInfo.ActualTableName
	if physicalTableName == "" {
		return fmt.Errorf("physical table name is empty")
	}

	fieldList := append(tableInfo.FieldList, physicaltable.GetCreateTimeField(), physicaltable.GetUidField(), physicaltable.GetIDField(), physicaltable.GetConnectIDField())
	fieldMap := slices.ToMap(fieldList, func(e *entity2.FieldItem) (string, *entity2.FieldItem) {
		return e.Name, e
	})

	convertedRecords := make([]map[string]interface{}, 0, len(req.Records))

	for _, record := range req.Records {
		convertedRecord := make(map[string]interface{})

		cid := consts.CozeConnectorID
		if req.ConnectorID != nil {
			cid = *req.ConnectorID
		}
		convertedRecord[entity.DefaultUidColName] = req.UserID
		convertedRecord[entity.DefaultCidColName] = cid
		convertedRecord[entity.DefaultCreateTimeColName] = time.Now().UTC()

		for fieldName, value := range record {
			if _, fOk := fieldMap[fieldName]; !fOk {
				return fmt.Errorf("field %s not found in table definition", fieldName)
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

func (d databaseService) UpdateDatabaseRecord(ctx context.Context, req *database.UpdateDatabaseRecordRequest) error {
	var tableInfo *entity2.Database
	var err error

	if req.TableType == entity2.TableType_OnlineTable {
		tableInfo, err = d.onlineDAO.Get(ctx, req.DatabaseID)
	} else {
		tableInfo, err = d.draftDAO.Get(ctx, req.DatabaseID)
	}

	if err != nil {
		return fmt.Errorf("get table info failed: %v", err)
	}

	if tableInfo.RwMode == entity2.BotTableRWMode_ReadOnly {
		return fmt.Errorf("table is readonly, cannot add records")
	}

	physicalTableName := tableInfo.ActualTableName
	if physicalTableName == "" {
		return fmt.Errorf("physical table name is empty")
	}

	fieldList := append(tableInfo.FieldList, physicaltable.GetCreateTimeField(), physicaltable.GetUidField(), physicaltable.GetIDField(), physicaltable.GetConnectIDField())
	fieldMap := slices.ToMap(fieldList, func(e *entity2.FieldItem) (string, *entity2.FieldItem) {
		return e.Name, e
	})

	for _, record := range req.Records {
		idStr, exists := record[entity.DefaultIDColName]
		if !exists {
			return fmt.Errorf("record must contain %s field for update", entity.DefaultIDColName)
		}

		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			return fmt.Errorf("invalid ID format: %v", err)
		}

		updateData := make(map[string]interface{})

		for fieldName, valueStr := range record {
			if fieldName == entity.DefaultIDColName {
				continue
			}

			if _, fOk := fieldMap[fieldName]; !fOk {
				return fmt.Errorf("field %s not found in table definition", fieldName)
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
					Field:    entity.DefaultIDColName,
					Operator: entity.OperatorEqual,
					Value:    id,
				},
			},
		}

		if tableInfo.RwMode == entity2.BotTableRWMode_LimitedReadWrite {
			cond := &rdb.Condition{
				Field:    entity.DefaultUidColName,
				Operator: entity.OperatorEqual,
				Value:    req.UserID,
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

func (d databaseService) DeleteDatabaseRecord(ctx context.Context, req *database.DeleteDatabaseRecordRequest) error {
	var tableInfo *entity2.Database
	var err error

	if req.TableType == entity2.TableType_OnlineTable {
		tableInfo, err = d.onlineDAO.Get(ctx, req.DatabaseID)
	} else {
		tableInfo, err = d.draftDAO.Get(ctx, req.DatabaseID)
	}

	if err != nil {
		return fmt.Errorf("get table info failed: %v", err)
	}

	if tableInfo.RwMode == entity2.BotTableRWMode_ReadOnly {
		return fmt.Errorf("table is readonly, cannot add records")
	}

	physicalTableName := tableInfo.ActualTableName
	if physicalTableName == "" {
		return fmt.Errorf("physical table name is empty")
	}

	var ids []interface{}
	for _, record := range req.Records {
		idStr, exists := record[entity.DefaultIDColName]
		if !exists {
			return fmt.Errorf("record must contain %s field for deletion", entity.DefaultIDColName)
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
				Field:    entity.DefaultIDColName,
				Operator: entity.OperatorIn,
				Value:    ids,
			},
		},
	}

	if tableInfo.RwMode == entity2.BotTableRWMode_LimitedReadWrite {
		cond := &rdb.Condition{
			Field:    entity.DefaultUidColName,
			Operator: entity.OperatorEqual,
			Value:    req.UserID,
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

func (d databaseService) ListDatabaseRecord(ctx context.Context, req *database.ListDatabaseRecordRequest) (*database.ListDatabaseRecordResponse, error) {
	var tableInfo *entity2.Database
	var err error

	if req.TableType == entity2.TableType_OnlineTable {
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
	physicalToFieldType := make(map[string]entity2.FieldItemType)

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
			Field:    entity.DefaultCidColName,
			Operator: entity.OperatorEqual,
			Value:    *req.ConnectorID,
		}

		complexCondition = &rdb.ComplexCondition{
			Conditions: []*rdb.Condition{cond},
		}
	}

	if tableInfo.RwMode == entity2.BotTableRWMode_LimitedReadWrite {
		cond := &rdb.Condition{
			Field:    entity.DefaultUidColName,
			Operator: entity.OperatorEqual,
			Value:    req.UserID,
		}

		if complexCondition == nil {
			complexCondition = &rdb.ComplexCondition{
				Conditions: []*rdb.Condition{cond},
			}
		} else {
			complexCondition.Conditions = append(complexCondition.Conditions, cond)
		}
	}

	limit := 50
	if req.Limit > 0 {
		limit = req.Limit
	}

	orderBy := []*rdb.OrderBy{
		{
			Field:     entity.DefaultCreateTimeColName,
			Direction: entity.SortDirectionDesc,
		},
	}

	selectResp, err := d.rdb.SelectData(ctx, &rdb.SelectDataRequest{
		TableName: physicalTableName,
		Fields:    []string{}, // 空表示查询所有字段
		Where:     complexCondition,
		OrderBy:   orderBy,
		Limit:     &limit,
		Offset:    &req.Offset,
	})
	if err != nil {
		return nil, fmt.Errorf("select data failed: %v", err)
	}

	if selectResp.ResultSet == nil {
		return &database.ListDatabaseRecordResponse{}, nil
	}

	records := convertor.ConvertResultSet(selectResp.ResultSet, physicalToFieldName, physicalToFieldType)

	var hasMore bool
	if selectResp.Total <= int64(req.Limit)+int64(req.Offset) {
		hasMore = false
	} else {
		hasMore = true
	}

	return &database.ListDatabaseRecordResponse{
		Records:    records,
		FieldList:  tableInfo.FieldList,
		HasMore:    hasMore,
		TotalCount: selectResp.Total,
	}, nil
}

func (d databaseService) GetDatabaseTemplate(ctx context.Context, req *database.GetDatabaseTemplateRequest) (*database.GetDatabaseTemplateResponse, error) {
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

	return &database.GetDatabaseTemplateResponse{
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

func (d databaseService) ExecuteSQL(ctx context.Context, req *database.ExecuteSQLRequest) (*database.ExecuteSQLResponse, error) {
	var tableInfo *entity2.Database
	var err error

	if req.TableType == entity2.TableType_OnlineTable {
		tableInfo, err = d.onlineDAO.Get(ctx, req.DatabaseID)
	} else {
		tableInfo, err = d.draftDAO.Get(ctx, req.DatabaseID)
	}

	if err != nil {
		return nil, fmt.Errorf("get table info failed: %v", err)
	}

	if tableInfo.RwMode == entity2.BotTableRWMode_ReadOnly && (req.OperateType == entity2.OperateType_Insert || req.OperateType == entity2.OperateType_Update || req.OperateType == entity2.OperateType_Delete) {
		return nil, fmt.Errorf("table is readonly, cannot add records")
	}

	physicalTableName := tableInfo.ActualTableName
	if physicalTableName == "" {
		return nil, fmt.Errorf("physical table name is empty")
	}

	fieldNameToPhysical := make(map[string]string)
	physicalToFieldName := make(map[string]string)
	physicalToFieldType := make(map[string]entity2.FieldItemType)

	for _, field := range tableInfo.FieldList {
		if field.AlterID > 0 {
			physicalName := physicaltable.GetFieldPhysicsName(field.AlterID)
			fieldNameToPhysical[field.Name] = physicalName
			physicalToFieldName[physicalName] = field.Name
			physicalToFieldType[physicalName] = field.Type
		}
	}

	var resultSet *entity.ResultSet
	var rowsAffected int64

	switch req.OperateType {
	case entity2.OperateType_Custom:
		resultSet, err = d.executeCustomSQL(ctx, req, physicalTableName, tableInfo, fieldNameToPhysical)
		if err != nil {
			return nil, err
		}

	case entity2.OperateType_Select:
		resultSet, err = d.executeSelectSQL(ctx, req, physicalTableName, tableInfo, fieldNameToPhysical)
		if err != nil {
			return nil, err
		}

	case entity2.OperateType_Insert:
		rowsAffected, err = d.executeInsertSQL(ctx, req, physicalTableName, tableInfo)
		if err != nil {
			return nil, err
		}

	case entity2.OperateType_Update:
		rowsAffected, err = d.executeUpdateSQL(ctx, req, physicalTableName, tableInfo, fieldNameToPhysical)
		if err != nil {
			return nil, err
		}

	case entity2.OperateType_Delete:
		rowsAffected, err = d.executeDeleteSQL(ctx, req, physicalTableName, tableInfo, fieldNameToPhysical)
		if err != nil {
			return nil, err
		}

	default:
		return nil, fmt.Errorf("unsupported operation type: %v", req.OperateType)
	}

	response := &database.ExecuteSQLResponse{
		FieldList: tableInfo.FieldList,
	}

	if resultSet != nil && len(resultSet.Rows) > 0 {
		response.Records = convertor.ConvertResultSet(resultSet, physicalToFieldName, physicalToFieldType)
	} else {
		response.Records = []map[string]string{}
	}

	if resultSet != nil && resultSet.AffectedRows > 0 {
		response.RowsAffected = &resultSet.AffectedRows
	}

	if rowsAffected > 0 {
		response.RowsAffected = &rowsAffected
	}

	return response, nil
}

func (d databaseService) executeCustomSQL(ctx context.Context, req *database.ExecuteSQLRequest, physicalTableName string, tableInfo *entity2.Database, fieldNameToPhysical map[string]string) (*entity.ResultSet, error) {
	var params []interface{}
	if req.SQL == nil || *req.SQL == "" {
		return nil, fmt.Errorf("SQL is empty")
	}

	operation, err := sqlparser.NewSQLParser().GetSQLOperation(*req.SQL)
	if err != nil {
		return nil, err
	}

	if tableInfo.RwMode == entity2.BotTableRWMode_ReadOnly && (operation == sqlparsercontract.OperationTypeInsert || operation == sqlparsercontract.OperationTypeUpdate || operation == sqlparsercontract.OperationTypeDelete) {
		return nil, fmt.Errorf("unsupported operation type: %v", operation)
	}

	if req.SQLParams != nil {
		params = make([]interface{}, 0, len(req.SQLParams))
		for _, param := range req.SQLParams {
			params = append(params, param.Value)
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

	if req.SQLType == entity2.SQLType_Raw && operation == sqlparsercontract.OperationTypeInsert {
		cid := consts.CozeConnectorID
		if req.ConnectorID != nil {
			cid = *req.ConnectorID
		}
		parsedSQL, err = sqlparser.NewSQLParser().AddColumnsToInsertSQL(parsedSQL, map[string]interface{}{
			entity.DefaultCidColName: cid,
			entity.DefaultUidColName: req.User.UserID,
		})
		if err != nil {
			return nil, fmt.Errorf("add columns to insert sql failed: %v", err)
		}
	}

	execResp, err := d.rdb.ExecuteSQL(ctx, &rdb.ExecuteSQLRequest{
		SQL:    parsedSQL,
		Params: params,

		SQLType: entity.SQLType(req.SQLType),
	})
	if err != nil {
		return nil, fmt.Errorf("execute SQL failed: %v", err)
	}

	return execResp.ResultSet, nil
}

func (d databaseService) executeSelectSQL(ctx context.Context, req *database.ExecuteSQLRequest, physicalTableName string, tableInfo *entity2.Database, fieldNameToPhysical map[string]string) (*entity.ResultSet, error) {
	selectReq := &rdb.SelectDataRequest{
		TableName: physicalTableName,
		Limit:     int64PtrToIntPtr(req.Limit),
		Offset:    int64PtrToIntPtr(req.Offset),
	}

	fieldList := append(tableInfo.FieldList, physicaltable.GetCreateTimeField(), physicaltable.GetUidField(), physicaltable.GetIDField(), physicaltable.GetConnectIDField())
	fieldMap := slices.ToMap(fieldList, func(e *entity2.FieldItem) (string, *entity2.FieldItem) {
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
		complexCond, err = convertCondition(req.Condition, fieldNameToPhysical, req.SQLParams)
		if err != nil {
			return nil, fmt.Errorf("convert condition failed: %v", err)
		}
	}

	// add rw mode
	if tableInfo.RwMode == entity2.BotTableRWMode_LimitedReadWrite && req.User != nil && req.User.UserID != 0 {
		cond := &rdb.Condition{
			Field:    entity.DefaultUidColName,
			Operator: entity.OperatorEqual,
			Value:    req.User.UserID,
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

func (d databaseService) executeInsertSQL(ctx context.Context, req *database.ExecuteSQLRequest, physicalTableName string, tableInfo *entity2.Database) (int64, error) {
	if len(req.UpsertRows) == 0 {
		return -1, fmt.Errorf("no data to insert")
	}

	insertData := make([]map[string]interface{}, 0, len(req.UpsertRows))
	ids, err := d.generator.GenMultiIDs(ctx, len(req.UpsertRows))
	if err != nil {
		return -1, err
	}

	fieldList := append(tableInfo.FieldList, physicaltable.GetCreateTimeField(), physicaltable.GetUidField(), physicaltable.GetIDField(), physicaltable.GetConnectIDField())
	fieldMap := slices.ToMap(fieldList, func(e *entity2.FieldItem) (string, *entity2.FieldItem) {
		return strconv.FormatInt(e.AlterID, 10), e
	})

	sqlParams := req.SQLParams
	i := 0

	for index, upsertRow := range req.UpsertRows {
		rowData := make(map[string]interface{})

		cid := consts.CozeConnectorID
		if req.ConnectorID != nil {
			cid = *req.ConnectorID
		}

		if req.User != nil {
			rowData[entity.DefaultUidColName] = req.User.UserID
		}
		rowData[entity.DefaultCidColName] = cid
		rowData[entity.DefaultCreateTimeColName] = time.Now().UTC()
		rowData[entity.DefaultIDColName] = ids[index]

		for _, record := range upsertRow.Records {
			field, exists := fieldMap[record.FieldId]
			if !exists {
				return -1, fmt.Errorf("field %s not found", record.FieldId)
			}

			fieldVal := sqlParams[i].Value
			if sqlParams[i].ISNull || fieldVal == nil {
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
	}

	insertResp, err := d.rdb.InsertData(ctx, &rdb.InsertDataRequest{
		TableName: physicalTableName,
		Data:      insertData,
	})
	if err != nil {
		return -1, fmt.Errorf("insert data failed: %v", err)
	}

	return insertResp.AffectedRows, nil
}

func (d databaseService) executeUpdateSQL(ctx context.Context, req *database.ExecuteSQLRequest, physicalTableName string, tableInfo *entity2.Database, fieldNameToPhysical map[string]string) (int64, error) {
	if len(req.UpsertRows) == 0 || req.Condition == nil {
		return -1, fmt.Errorf("missing update data or condition")
	}

	fieldList := append(tableInfo.FieldList, physicaltable.GetCreateTimeField(), physicaltable.GetUidField(), physicaltable.GetIDField(), physicaltable.GetConnectIDField())
	fieldMap := slices.ToMap(fieldList, func(e *entity2.FieldItem) (string, *entity2.FieldItem) {
		return strconv.FormatInt(e.AlterID, 10), e
	})

	updateData := make(map[string]interface{})
	index := 0
	for _, record := range req.UpsertRows[0].Records {
		field, exists := fieldMap[record.FieldId]
		if !exists {
			return -1, fmt.Errorf("field %s not found", record.FieldId)
		}

		fieldVal := req.SQLParams[index].Value
		index++
		if fieldVal == nil {
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
	complexCond, err := convertCondition(req.Condition, fieldNameToPhysical, condParams)
	if err != nil {
		return -1, fmt.Errorf("convert condition failed: %v", err)
	}

	// add rw mode
	if tableInfo.RwMode == entity2.BotTableRWMode_LimitedReadWrite && req.User != nil && req.User.UserID != 0 {
		cond := &rdb.Condition{
			Field:    entity.DefaultUidColName,
			Operator: entity.OperatorEqual,
			Value:    req.User.UserID,
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

func (d databaseService) executeDeleteSQL(ctx context.Context, req *database.ExecuteSQLRequest, physicalTableName string, tableInfo *entity2.Database, fieldNameToPhysical map[string]string) (int64, error) {
	if req.Condition == nil {
		return -1, fmt.Errorf("missing delete condition")
	}

	complexCond, err := convertCondition(req.Condition, fieldNameToPhysical, req.SQLParams)
	if err != nil {
		return -1, fmt.Errorf("convert condition failed: %v", err)
	}

	// add rw mode
	if tableInfo.RwMode == entity2.BotTableRWMode_LimitedReadWrite && req.User != nil && req.User.UserID != 0 {
		cond := &rdb.Condition{
			Field:    entity.DefaultUidColName,
			Operator: entity.OperatorEqual,
			Value:    req.User.UserID,
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

func convertSortDirection(direction entity2.SortDirection) entity.SortDirection {
	if direction == entity2.SortDirection_Desc {
		return entity.SortDirectionDesc
	}
	return entity.SortDirectionAsc
}

func convertCondition(cond *database.ComplexCondition, fieldMap map[string]string, params []*entity2.SQLParamVal) (*rdb.ComplexCondition, error) {
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

			if params[index].ISNull || params[index].Value == nil {
				index++
				continue
			}

			conditions = append(conditions, &rdb.Condition{
				Field:    leftField,
				Operator: convertor.ConvertOperator(c.Operation),
				Value:    *params[index].Value,
			})
			index++
		}
		result.Conditions = conditions
	}
	//if cond.NestedConditions != nil {
	//	nested, err := convertCondition(cond.NestedConditions, fieldMap, params)
	//	if err != nil {
	//		return nil, err
	//	}
	//	result.NestedConditions = []*rdb.ComplexCondition{nested}
	//}

	return result, nil
}

func (d databaseService) BindDatabase(ctx context.Context, req *database.BindDatabaseToAgentRequest) error {
	if req == nil {
		return fmt.Errorf("invalid request: request is nil")
	}

	_, err := d.agentToDatabaseDAO.BatchCreate(ctx, req.Relations)
	if err != nil {
		return fmt.Errorf("failed to bind databases to agent: %w", err)
	}

	return nil
}

func (d databaseService) UnBindDatabase(ctx context.Context, req *database.UnBindDatabaseToAgentRequest) error {
	if req == nil {
		return fmt.Errorf("invalid request: request is nil")
	}

	err := d.agentToDatabaseDAO.BatchDelete(ctx, req.BasicRelations)
	if err != nil {
		return fmt.Errorf("failed to unbind databases from agent: %w", err)
	}

	return nil
}

func (d databaseService) MGetDatabaseByAgentID(ctx context.Context, req *database.MGetDatabaseByAgentIDRequest) (*database.MGetDatabaseByAgentIDResponse, error) {
	if req == nil {
		return nil, fmt.Errorf("invalid request: request is nil")
	}

	relations, err := d.agentToDatabaseDAO.ListByAgentID(ctx, req.AgentID, req.TableType)
	if err != nil {
		return nil, err
	}

	mGetBasics := make([]*entity2.DatabaseBasic, 0, len(relations))
	for _, relation := range relations {
		mGetBasics = append(mGetBasics, &entity2.DatabaseBasic{
			ID:            relation.DatabaseID,
			TableType:     req.TableType,
			NeedSysFields: req.NeedSysFields,
		})
	}
	databases, err := d.MGetDatabase(ctx, &database.MGetDatabaseRequest{Basics: mGetBasics})
	if err != nil {
		return nil, err
	}

	return &database.MGetDatabaseByAgentIDResponse{
		Databases: databases.Databases,
	}, nil
}

// PublishDatabase return online database according to draft database info
func (d databaseService) PublishDatabase(ctx context.Context, req *database.PublishDatabaseRequest) (*database.PublishDatabaseResponse, error) {
	if req == nil {
		return nil, fmt.Errorf("invalid request: request is nil")
	}

	relationResp, err := d.MGetRelationsByAgentID(ctx, &database.MGetRelationsByAgentIDRequest{
		AgentID:   req.AgentID,
		TableType: entity2.TableType_DraftTable,
	})
	if err != nil {
		return nil, err
	}
	if len(relationResp.Relations) == 0 {
		return &database.PublishDatabaseResponse{}, nil
	}

	relationMap := slices.ToMap(relationResp.Relations, func(d *entity2.AgentToDatabase) (int64, *entity2.AgentToDatabase) {
		return d.DatabaseID, d
	})

	dBasics := make([]*entity2.DatabaseBasic, 0, len(relationResp.Relations))
	for _, draftR := range relationResp.Relations {
		dBasics = append(dBasics, &entity2.DatabaseBasic{
			ID:            draftR.DatabaseID,
			TableType:     entity2.TableType_DraftTable,
			NeedSysFields: false,
		})
	}

	draftDatabaseResp, err := d.MGetDatabase(ctx, &database.MGetDatabaseRequest{
		Basics: dBasics,
	})
	if err != nil {
		return nil, err
	}

	oBasics := make([]*entity2.DatabaseBasic, 0, len(draftDatabaseResp.Databases))
	for _, draft := range draftDatabaseResp.Databases {
		oBasics = append(oBasics, &entity2.DatabaseBasic{
			ID:            draft.GetOnlineID(),
			TableType:     entity2.TableType_OnlineTable,
			NeedSysFields: false,
		})
	}

	onlineDatabaseResp, err := d.MGetDatabase(ctx, &database.MGetDatabaseRequest{
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

		r, ok := relationMap[online.GetDraftID()]
		if !ok {
			return nil, fmt.Errorf("invalid online draft ID")
		}

		// update agent to online database relation
		err = d.UpdateAgentToDatabase(ctx, &database.UpdateAgentToDatabaseRequest{
			Relation: &entity2.AgentToDatabase{
				AgentID:        req.AgentID,
				DatabaseID:     online.ID,
				TableType:      entity2.TableType_OnlineTable,
				PromptDisabled: r.PromptDisabled,
			},
		})
		if err != nil {
			return nil, err
		}

		results = append(results, &bot_common.Database{
			TableId:        ptr.Of(strconv.FormatInt(online.ID, 10)),
			TableName:      ptr.Of(online.TableName),
			TableDesc:      ptr.Of(online.TableDesc),
			FieldList:      fields,
			PromptDisabled: ptr.Of(r.PromptDisabled),
			RWMode:         ptr.Of(bot_common.BotTableRWMode(online.RwMode)),
		})
	}

	return &database.PublishDatabaseResponse{
		OnlineDatabases: results,
	}, nil
}

func (d databaseService) UpdateAgentToDatabase(ctx context.Context, req *database.UpdateAgentToDatabaseRequest) error {
	if req == nil {
		return fmt.Errorf("invalid request: request is nil")
	}

	return d.agentToDatabaseDAO.Update(ctx, req.Relation)
}

func (d databaseService) MGetRelationsByAgentID(ctx context.Context, req *database.MGetRelationsByAgentIDRequest) (*database.MGetRelationsByAgentIDResponse, error) {
	if req == nil {
		return nil, fmt.Errorf("invalid request: request is nil")
	}

	relations, err := d.agentToDatabaseDAO.ListByAgentID(ctx, req.AgentID, req.TableType)
	if err != nil {
		return nil, err
	}

	return &database.MGetRelationsByAgentIDResponse{
		Relations: relations,
	}, nil
}
