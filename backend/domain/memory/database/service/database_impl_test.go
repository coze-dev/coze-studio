package service

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/api/model/table"
	entity2 "code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/repository"
	"code.byted.org/flow/opencoze/backend/infra/contract/rdb"
	"code.byted.org/flow/opencoze/backend/infra/contract/rdb/entity"
	rdb2 "code.byted.org/flow/opencoze/backend/infra/impl/rdb"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"
	storageMock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

func setupTestEnv(t *testing.T) (*gorm.DB, rdb.RDB, *mock.MockIDGenerator, repository.DraftDAO, repository.OnlineDAO, Database) {
	dsn := "root:root@tcp(127.0.0.1:3306)/opencoze?charset=utf8mb4&parseTime=True&loc=Local"
	if os.Getenv("CI_JOB_NAME") != "" {
		dsn = strings.ReplaceAll(dsn, "127.0.0.1", "mysql")
	}
	gormDB, err := gorm.Open(mysql.Open(dsn))
	assert.NoError(t, err)

	ctrl := gomock.NewController(t)
	idGen := mock.NewMockIDGenerator(ctrl)

	baseID := time.Now().UnixNano()
	idGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(ctx context.Context) (int64, error) {
		id := baseID
		baseID++
		return id, nil
	}).AnyTimes()

	idGen.EXPECT().GenMultiIDs(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, count int) ([]int64, error) {
		ids := make([]int64, count)
		for i := 0; i < count; i++ {
			ids[i] = baseID
			baseID++
		}
		return ids, nil
	}).AnyTimes()

	rdbService := rdb2.NewService(gormDB, idGen)
	draftDAO := dal.NewDraftDatabaseDAO(gormDB, idGen)
	onlineDAO := dal.NewOnlineDatabaseDAO(gormDB, idGen)

	mockStorage := storageMock.NewMockStorage(ctrl)
	mockStorage.EXPECT().GetObjectUrl(gomock.Any(), gomock.Any()).Return("URL_ADDRESS", nil).AnyTimes()
	mockStorage.EXPECT().GetObject(gomock.Any(), gomock.Any()).Return([]byte("test text"), nil).AnyTimes()
	mockStorage.EXPECT().PutObject(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).AnyTimes()

	dbService := NewService(rdbService, gormDB, idGen, mockStorage, nil)

	return gormDB, rdbService, idGen, draftDAO, onlineDAO, dbService
}

func cleanupTestEnv(t *testing.T, db *gorm.DB, additionalTables ...string) {
	sqlDB, err := db.DB()
	assert.NoError(t, err)

	daosToClean := []string{"online_database_info", "draft_database_info"}
	for _, tableName := range daosToClean {
		_, err := sqlDB.Exec(fmt.Sprintf("DELETE FROM `%s` WHERE 1=1", tableName))
		if err != nil {
			t.Logf("Failed to clean table %s: %v", tableName, err)
		}
	}

	rows, err := sqlDB.Query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name LIKE 'table_%'")
	assert.NoError(t, err, "Failed to query tables")
	defer rows.Close()

	var tablesToDrop []string
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			t.Logf("Error scanning table name: %v", err)
			continue
		}
		tablesToDrop = append(tablesToDrop, tableName)
	}

	tablesToDrop = append(tablesToDrop, additionalTables...)

	for _, tableName := range tablesToDrop {
		_, err := sqlDB.Exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", tableName))
		if err != nil {
			t.Logf("Failed to drop table %s: %v", tableName, err)
		}
	}
}

func TestCreateDatabase(t *testing.T) {
	gormDB, _, _, _, onlineDAO, dbService := setupTestEnv(t)
	defer cleanupTestEnv(t, gormDB)

	req := &CreateDatabaseRequest{
		Database: &database.Database{
			SpaceID:   1,
			CreatorID: 1001,

			TableName: "test_db_create",
			FieldList: []*database.FieldItem{
				{
					Name:         "id",
					Type:         table.FieldItemType_Number,
					MustRequired: true,
				},
				{
					Name:         "name",
					Type:         table.FieldItemType_Text,
					MustRequired: true,
				},
				{
					Name: "score",
					Type: table.FieldItemType_Float,
				},
				{
					Name: "date",
					Type: table.FieldItemType_Date,
				},
			},
		},
	}

	resp, err := dbService.CreateDatabase(context.Background(), req)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.NotNil(t, resp.Database)

	assert.Equal(t, req.Database.TableName, resp.Database.TableName)
	assert.Equal(t, req.Database.TableType, resp.Database.TableType)
	assert.NotEmpty(t, resp.Database.ActualTableName)
	assert.Len(t, resp.Database.FieldList, 4)

	savedDB, err := onlineDAO.Get(context.Background(), resp.Database.ID)
	assert.NoError(t, err)
	assert.Equal(t, resp.Database.ID, savedDB.ID)
	assert.Equal(t, resp.Database.TableName, savedDB.TableName)
}

func TestUpdateDatabase(t *testing.T) {
	gormDB, _, _, _, onlineDAO, dbService := setupTestEnv(t)
	defer cleanupTestEnv(t, gormDB)

	resp, err := createDatabase(dbService)
	assert.NoError(t, err)
	assert.NotNil(t, resp)

	databaseInfo := &entity2.Database{
		ID: resp.Database.ID,

		SpaceID:   1,
		CreatorID: 1001,
		TableName: "test_db_update",
		TableType: ptr.Of(table.TableType_OnlineTable),
		FieldList: []*database.FieldItem{
			{
				Name:         "age",
				Type:         table.FieldItemType_Float,
				MustRequired: true,
			},
		},
	}

	updateReq := &UpdateDatabaseRequest{
		Database: databaseInfo,
	}

	res, err := dbService.UpdateDatabase(context.Background(), updateReq)
	assert.NoError(t, err)
	assert.NotNil(t, res)

	updatedDB, err := onlineDAO.Get(context.Background(), databaseInfo.ID)
	assert.NoError(t, err)
	assert.Len(t, updatedDB.FieldList, 1)
}

func TestDeleteDatabase(t *testing.T) {
	gormDB, _, _, draftDAO, onlineDAO, dbService := setupTestEnv(t)
	defer cleanupTestEnv(t, gormDB)

	resp, err := createDatabase(dbService)
	assert.NoError(t, err)
	assert.NotNil(t, resp)

	deleteReq := &DeleteDatabaseRequest{
		ID: resp.Database.ID,
	}

	err = dbService.DeleteDatabase(context.Background(), deleteReq)

	assert.NoError(t, err)

	_, err = draftDAO.Get(context.Background(), resp.Database.ID)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "not found")

	_, err = onlineDAO.Get(context.Background(), resp.Database.ID)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "not found")
}

func TestListDatabase(t *testing.T) {
	gormDB, _, _, _, _, dbService := setupTestEnv(t)
	defer cleanupTestEnv(t, gormDB)

	for i := 0; i < 3; i++ {
		resp, err := createDatabase(dbService)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
	}

	spaceID := int64(1)
	tableType := table.TableType_OnlineTable
	listReq := &ListDatabaseRequest{
		SpaceID:   &spaceID,
		TableType: tableType,
		Limit:     2,
	}
	resp, err := dbService.ListDatabase(context.Background(), listReq)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.GreaterOrEqual(t, len(resp.Databases), 2)

	listReq = &ListDatabaseRequest{
		SpaceID:   &spaceID,
		TableType: tableType,
		Limit:     2,
		Offset:    2,
	}
	resp, err = dbService.ListDatabase(context.Background(), listReq)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.GreaterOrEqual(t, len(resp.Databases), 1)
}

func createDatabase(dbService Database) (*CreateDatabaseResponse, error) {
	req := &CreateDatabaseRequest{
		Database: &entity2.Database{
			SpaceID:   1,
			CreatorID: 1001,

			TableName: "test_db_table_01",
			FieldList: []*database.FieldItem{
				{
					Name:         "id",
					Type:         table.FieldItemType_Number,
					MustRequired: true,
				},
				{
					Name:         "name",
					Type:         table.FieldItemType_Text,
					MustRequired: true,
				},
				{
					Name: "score",
					Type: table.FieldItemType_Float,
				},
				{
					Name: "date",
					Type: table.FieldItemType_Date,
				},
			},
		},
	}

	return dbService.CreateDatabase(context.Background(), req)
}

func TestCRUDDatabaseRecord(t *testing.T) {
	gormDB, _, _, _, _, dbService := setupTestEnv(t)
	defer cleanupTestEnv(t, gormDB)

	resp, err := createDatabase(dbService)
	assert.NoError(t, err)
	assert.NotNil(t, resp)

	addRecordReq := &AddDatabaseRecordRequest{
		DatabaseID: resp.Database.ID,
		TableType:  table.TableType_OnlineTable,
		UserID:     1001,
		Records: []map[string]string{
			{
				"id":    "1",
				"name":  "John Doe",
				"score": "80.5",
				"date":  "2025-01-01 00:00:00",
			},
			{
				"id":    "2",
				"name":  "Jane Smith",
				"score": "90.5",
				"date":  "2025-01-01 01:00:00",
			},
		},
	}

	err = dbService.AddDatabaseRecord(context.Background(), addRecordReq)
	assert.NoError(t, err)

	listRecordReq := &ListDatabaseRecordRequest{
		DatabaseID: resp.Database.ID,
		TableType:  table.TableType_OnlineTable,
		UserID:     1001,
		Limit:      50,
	}

	listResp, err := dbService.ListDatabaseRecord(context.Background(), listRecordReq)
	assert.NoError(t, err)
	assert.NotNil(t, listResp)
	assert.True(t, len(listResp.Records) == 2)

	foundJohn := false
	foundSmith := false
	bsID := ""
	for _, record := range listResp.Records {
		if record["name"] == "John Doe" && record["score"] == "80.5" {
			foundJohn = true
			bsID = record[entity.DefaultIDColName]
		}
		if record["name"] == "Jane Smith" && record["score"] == "90.5" {
			foundSmith = true
		}
	}
	assert.True(t, foundJohn, "John Doe record not found")
	assert.True(t, foundSmith, "Jane Smith record not found")

	updateRecordReq := &UpdateDatabaseRecordRequest{
		DatabaseID: resp.Database.ID,
		TableType:  table.TableType_OnlineTable,
		UserID:     1001,
		Records: []map[string]string{
			{
				entity.DefaultIDColName: bsID,
				"name":                  "John Updated",
				"score":                 "90",
			},
		},
	}

	err = dbService.UpdateDatabaseRecord(context.Background(), updateRecordReq)
	assert.NoError(t, err)

	listReq := &ListDatabaseRecordRequest{
		DatabaseID: resp.Database.ID,
		TableType:  table.TableType_OnlineTable,
		Limit:      50,
		UserID:     1001,
	}
	listRespAfterUpdate, err := dbService.ListDatabaseRecord(context.Background(), listReq)
	assert.NoError(t, err)
	assert.NotNil(t, listRespAfterUpdate)
	assert.True(t, len(listRespAfterUpdate.Records) > 0)

	foundJohnUpdate := false
	for _, record := range listRespAfterUpdate.Records {
		if record[entity.DefaultIDColName] == bsID {
			foundJohnUpdate = true
			assert.Equal(t, "90", record["score"])
		}
	}
	assert.True(t, foundJohnUpdate, "John Doe update record not found")

	deleteRecordReq := &DeleteDatabaseRecordRequest{
		DatabaseID: resp.Database.ID,
		TableType:  table.TableType_OnlineTable,
		UserID:     1001,
		Records: []map[string]string{
			{
				entity.DefaultIDColName: bsID,
			},
		},
	}

	err = dbService.DeleteDatabaseRecord(context.Background(), deleteRecordReq)
	assert.NoError(t, err)

	listRecordAfterDeleteReq := &ListDatabaseRecordRequest{
		DatabaseID: resp.Database.ID,
		TableType:  table.TableType_OnlineTable,
		Limit:      50,
		UserID:     1001,
	}
	listRespAfterDelete, err := dbService.ListDatabaseRecord(context.Background(), listRecordAfterDeleteReq)
	assert.NoError(t, err)
	assert.NotNil(t, listRespAfterDelete)
	assert.Equal(t, len(listRespAfterDelete.Records), 1)
}

func TestExecuteSQLWithOperations(t *testing.T) {
	gormDB, _, _, _, _, dbService := setupTestEnv(t)
	defer cleanupTestEnv(t, gormDB)

	resp, err := createDatabase(dbService)
	assert.NoError(t, err)
	assert.NotNil(t, resp)

	fieldMap := slices.ToMap(resp.Database.FieldList, func(e *database.FieldItem) (string, *database.FieldItem) {
		return e.Name, e
	})

	upsertRows := []*database.UpsertRow{
		{
			Records: []*database.Record{
				{
					FieldId:    strconv.FormatInt(fieldMap["id"].AlterID, 10),
					FieldValue: "?",
				},
				{
					FieldId:    strconv.FormatInt(fieldMap["name"].AlterID, 10),
					FieldValue: "?",
				},
				{
					FieldId:    strconv.FormatInt(fieldMap["score"].AlterID, 10),
					FieldValue: "?",
				},
			},
		},
		{
			Records: []*database.Record{
				{
					FieldId:    strconv.FormatInt(fieldMap["id"].AlterID, 10),
					FieldValue: "?",
				},
				{
					FieldId:    strconv.FormatInt(fieldMap["name"].AlterID, 10),
					FieldValue: "?",
				},
				{
					FieldId:    strconv.FormatInt(fieldMap["score"].AlterID, 10),
					FieldValue: "?",
				},
			},
		},
	}

	executeInsertReq := &ExecuteSQLRequest{
		DatabaseID:  resp.Database.ID,
		TableType:   table.TableType_OnlineTable,
		OperateType: database.OperateType_Insert,
		UpsertRows:  upsertRows,
		SQLParams: []*database.SQLParamVal{
			{
				Value: ptr.Of("111"),
			},
			{
				Value: ptr.Of("Alice"),
			},
			{
				Value: ptr.Of("85.5"),
			},
			{
				Value: ptr.Of("112"),
			},
			{
				Value: ptr.Of("Bob"),
			},
			{
				Value: ptr.Of("90.5"),
			},
		},
		UserID:  1001,
		SpaceID: 1,
	}

	insertResp, err := dbService.ExecuteSQL(context.Background(), executeInsertReq)
	assert.NoError(t, err)
	assert.NotNil(t, insertResp)
	assert.NotNil(t, insertResp.RowsAffected)
	assert.Equal(t, int64(2), *insertResp.RowsAffected)

	limit := int64(10)
	selectFields := &database.SelectFieldList{
		FieldID: []string{strconv.FormatInt(fieldMap["name"].AlterID, 10), strconv.FormatInt(fieldMap["score"].AlterID, 10)},
	}

	executeSelectReq := &ExecuteSQLRequest{
		DatabaseID:      resp.Database.ID,
		TableType:       table.TableType_OnlineTable,
		OperateType:     database.OperateType_Select,
		SelectFieldList: selectFields,
		Limit:           &limit,
		UserID:          1001,
		SpaceID:         1,
		OrderByList: []database.OrderBy{
			{
				Field:     "id",
				Direction: table.SortDirection_Desc,
			},
		},
	}

	selectResp, err := dbService.ExecuteSQL(context.Background(), executeSelectReq)
	assert.NoError(t, err)
	assert.NotNil(t, selectResp)
	assert.NotNil(t, selectResp.Records)
	assert.True(t, len(selectResp.Records) == 2)
	assert.Equal(t, selectResp.Records[0]["name"], "Bob")

	updateRows := []*database.UpsertRow{
		{
			Records: []*database.Record{
				{
					FieldId:    strconv.FormatInt(fieldMap["id"].AlterID, 10),
					FieldValue: "?",
				},
				{
					FieldId:    strconv.FormatInt(fieldMap["name"].AlterID, 10),
					FieldValue: "?",
				},
				{
					FieldId:    strconv.FormatInt(fieldMap["score"].AlterID, 10),
					FieldValue: "?",
				},
			},
		},
	}

	executeUpdateReq := &ExecuteSQLRequest{
		DatabaseID:  resp.Database.ID,
		TableType:   table.TableType_OnlineTable,
		OperateType: database.OperateType_Update,
		UpsertRows:  updateRows,
		Limit:       &limit,
		SQLParams: []*database.SQLParamVal{
			{
				Value: ptr.Of("111"),
			},
			{
				Value: ptr.Of("Alice2"),
			},
			{
				Value: ptr.Of("99"),
			},
			{
				Value: ptr.Of("111"),
			},
		},
		UserID:  1001,
		SpaceID: 1,
		Condition: &database.ComplexCondition{
			Conditions: []*database.Condition{
				{
					Left:      "id",
					Operation: database.Operation_EQUAL,
					Right:     "?",
				},
			},
			Logic: database.Logic_And,
		},
	}

	updateResp, err := dbService.ExecuteSQL(context.Background(), executeUpdateReq)
	assert.NoError(t, err)
	assert.NotNil(t, updateResp)
	assert.NotNil(t, updateResp.RowsAffected)

	executeDeleteReq := &ExecuteSQLRequest{
		DatabaseID:  resp.Database.ID,
		TableType:   table.TableType_OnlineTable,
		OperateType: database.OperateType_Delete,
		Limit:       &limit,
		UserID:      1001,
		SpaceID:     1,
		SQLParams: []*database.SQLParamVal{
			{
				Value: ptr.Of("111"),
			},
		},
		Condition: &database.ComplexCondition{
			Conditions: []*database.Condition{
				{
					Left:      "id",
					Operation: database.Operation_EQUAL,
					Right:     "?",
				},
			},
			Logic: database.Logic_And,
		},
	}

	dResp, err := dbService.ExecuteSQL(context.Background(), executeDeleteReq)
	assert.NoError(t, err)
	assert.NotNil(t, dResp)
	assert.NotNil(t, dResp.RowsAffected)

	selectCustom := &ExecuteSQLRequest{
		DatabaseID:  resp.Database.ID,
		TableType:   table.TableType_OnlineTable,
		OperateType: database.OperateType_Custom,
		Limit:       &limit,
		UserID:      1001,
		SpaceID:     1,
		SQL:         ptr.Of(fmt.Sprintf("SELECT * FROM %s WHERE score > ?", "test_db_table_01")),
		SQLParams: []*database.SQLParamVal{
			{
				Value: ptr.Of("85"),
			},
		},
	}

	selectCustomResp, err := dbService.ExecuteSQL(context.Background(), selectCustom)
	assert.NoError(t, err)
	assert.NotNil(t, selectCustomResp)
	assert.NotNil(t, selectCustomResp.Records)
	assert.True(t, len(selectCustomResp.Records) > 0)

	// Test custom SQL UPDATE
	updateCustom := &ExecuteSQLRequest{
		DatabaseID:  resp.Database.ID,
		TableType:   table.TableType_OnlineTable,
		OperateType: database.OperateType_Custom,
		UserID:      1001,
		SpaceID:     1,
		SQL:         ptr.Of(fmt.Sprintf("UPDATE %s SET name = 'Bob Updated' WHERE id = ?", "test_db_table_01")),
		SQLParams: []*database.SQLParamVal{
			{
				Value: ptr.Of("112"),
			},
		},
	}

	updateCustomResp, err := dbService.ExecuteSQL(context.Background(), updateCustom)
	assert.NoError(t, err)
	assert.NotNil(t, updateCustomResp)
	assert.NotNil(t, updateCustomResp.RowsAffected)
	assert.Equal(t, *updateCustomResp.RowsAffected, int64(1))

	// Test custom SQL DELETE
	deleteCustom := &ExecuteSQLRequest{
		DatabaseID:  resp.Database.ID,
		TableType:   table.TableType_OnlineTable,
		OperateType: database.OperateType_Custom,
		UserID:      1001,
		SpaceID:     1,
		SQL:         ptr.Of(fmt.Sprintf("DELETE FROM %s WHERE id = ?", "test_db_table_01")),
		SQLParams: []*database.SQLParamVal{
			{
				Value: ptr.Of("112"),
			},
		},
	}

	deleteCustomResp, err := dbService.ExecuteSQL(context.Background(), deleteCustom)
	assert.NoError(t, err)
	assert.NotNil(t, deleteCustomResp)
	assert.NotNil(t, deleteCustomResp.RowsAffected)
	assert.Equal(t, *deleteCustomResp.RowsAffected, int64(1))
}

func TestDeleteDatabaseByAppID(t *testing.T) {
	gormDB, _, _, draftDAO, onlineDAO, dbService := setupTestEnv(t)
	defer cleanupTestEnv(t, gormDB)

	appID := int64(123456)
	dbCount := 3
	var onlineIDs []int64
	var draftIDs []int64
	var physicalTables []string

	for i := 0; i < dbCount; i++ {
		dbName := fmt.Sprintf("test_appid_db_%d_%d", appID, i)
		req := &CreateDatabaseRequest{
			Database: &entity2.Database{
				AppID:     appID,
				SpaceID:   1,
				CreatorID: 1001,
				TableName: dbName,
				FieldList: []*database.FieldItem{
					{
						Name:         "id",
						Type:         table.FieldItemType_Number,
						MustRequired: true,
					},
					{
						Name:         "name",
						Type:         table.FieldItemType_Text,
						MustRequired: true,
					},
					{
						Name: "score",
						Type: table.FieldItemType_Float,
					},
					{
						Name: "date",
						Type: table.FieldItemType_Date,
					},
				},
			},
		}
		resp, err := dbService.CreateDatabase(context.Background(), req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.NotNil(t, resp.Database)
		assert.Equal(t, appID, resp.Database.AppID)
		assert.NotEmpty(t, resp.Database.ActualTableName)
		physicalTables = append(physicalTables, resp.Database.ActualTableName)
		if resp.Database.ID != 0 {
			onlineIDs = append(onlineIDs, resp.Database.ID)
		}
		if resp.Database.DraftID != nil {
			draftIDs = append(draftIDs, *resp.Database.DraftID)
		}
	}

	for _, id := range onlineIDs {
		_, err := onlineDAO.Get(context.Background(), id)
		assert.NoError(t, err)
	}
	for _, id := range draftIDs {
		_, err := draftDAO.Get(context.Background(), id)
		assert.NoError(t, err)
	}

	_, err := dbService.DeleteDatabaseByAppID(context.Background(), &DeleteDatabaseByAppIDRequest{AppID: appID})
	assert.NoError(t, err)

	for _, id := range onlineIDs {
		_, err := onlineDAO.Get(context.Background(), id)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "not found")
	}
	for _, id := range draftIDs {
		_, err := draftDAO.Get(context.Background(), id)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "not found")
	}

	sqlDB, err := gormDB.DB()
	assert.NoError(t, err)
	for _, tableName := range physicalTables {
		var cnt int
		err := sqlDB.QueryRow(fmt.Sprintf("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = '%s'", tableName)).Scan(&cnt)
		assert.NoError(t, err)
		assert.Equal(t, 0, cnt, "physical table %s should be deleted", tableName)
	}
}
