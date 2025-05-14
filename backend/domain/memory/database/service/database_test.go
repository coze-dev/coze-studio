package service

import (
	"context"
	"fmt"
	"os"
	"strings"
	"testing"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/memory/database"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/dao"
	entity2 "code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/service"
	entity3 "code.byted.org/flow/opencoze/backend/domain/search/entity"
	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"
	database2 "code.byted.org/flow/opencoze/backend/internal/mock/domain/memory/database/crossdomain"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func setupTestEnv(t *testing.T) (*gorm.DB, rdb.RDB, *mock.MockIDGenerator, dao.DraftDAO, dao.OnlineDAO, database.Database) {
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

	notifier := database2.NewMockResourceDomainNotifier(ctrl)
	notifier.EXPECT().PublishResources(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, event *entity3.ResourceDomainEvent) error {
		return nil
	}).AnyTimes()

	rdbService := service.NewService(gormDB, idGen)
	draftDAO := dao.NewDraftDatabaseDAO(gormDB, idGen)
	onlineDAO := dao.NewOnlineDatabaseDAO(gormDB, idGen)

	dbService := NewService(rdbService, gormDB, idGen, nil, notifier)

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

	req := &database.CreateDatabaseRequest{
		Database: &entity2.Database{
			SpaceID:   1,
			CreatorID: 1001,

			TableName: "test_db_create",
			FieldList: []*entity2.FieldItem{
				{
					Name:         "id",
					Type:         entity2.FieldItemType_Number,
					MustRequired: true,
				},
				{
					Name:         "name",
					Type:         entity2.FieldItemType_Text,
					MustRequired: true,
				},
				{
					Name: "score",
					Type: entity2.FieldItemType_Float,
				},
				{
					Name: "date",
					Type: entity2.FieldItemType_Date,
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
		TableType: ptr.Of(entity2.TableType_OnlineTable),
		FieldList: []*entity2.FieldItem{
			{
				Name:         "age",
				Type:         entity2.FieldItemType_Float,
				MustRequired: true,
			},
		},
	}

	updateReq := &database.UpdateDatabaseRequest{
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

	deleteReq := &database.DeleteDatabaseRequest{
		Database: resp.Database,
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
	tableType := entity2.TableType_OnlineTable
	listReq := &database.ListDatabaseRequest{
		SpaceID:   &spaceID,
		TableType: tableType,
		Limit:     2,
	}
	resp, err := dbService.ListDatabase(context.Background(), listReq)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.GreaterOrEqual(t, len(resp.Databases), 2)

	listReq = &database.ListDatabaseRequest{
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

func createDatabase(dbService database.Database) (*database.CreateDatabaseResponse, error) {
	req := &database.CreateDatabaseRequest{
		Database: &entity2.Database{
			SpaceID:   1,
			CreatorID: 1001,

			TableName: "test_db_table_01",
			FieldList: []*entity2.FieldItem{
				{
					Name:         "id",
					Type:         entity2.FieldItemType_Number,
					MustRequired: true,
				},
				{
					Name:         "name",
					Type:         entity2.FieldItemType_Text,
					MustRequired: true,
				},
				{
					Name: "score",
					Type: entity2.FieldItemType_Float,
				},
				{
					Name: "date",
					Type: entity2.FieldItemType_Date,
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

	addRecordReq := &database.AddDatabaseRecordRequest{
		DatabaseID: resp.Database.ID,
		TableType:  entity2.TableType_OnlineTable,
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

	listRecordReq := &database.ListDatabaseRecordRequest{
		DatabaseID: resp.Database.ID,
		TableType:  entity2.TableType_OnlineTable,
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

	updateRecordReq := &database.UpdateDatabaseRecordRequest{
		DatabaseID: resp.Database.ID,
		TableType:  entity2.TableType_OnlineTable,
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

	listReq := &database.ListDatabaseRecordRequest{
		DatabaseID: resp.Database.ID,
		TableType:  entity2.TableType_OnlineTable,
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

	deleteRecordReq := &database.DeleteDatabaseRecordRequest{
		DatabaseID: resp.Database.ID,
		TableType:  entity2.TableType_OnlineTable,
		UserID:     1001,
		Records: []map[string]string{
			{
				entity.DefaultIDColName: bsID,
			},
		},
	}

	err = dbService.DeleteDatabaseRecord(context.Background(), deleteRecordReq)
	assert.NoError(t, err)

	listRecordAfterDeleteReq := &database.ListDatabaseRecordRequest{
		DatabaseID: resp.Database.ID,
		TableType:  entity2.TableType_OnlineTable,
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

	upsertRows := []*database.UpsertRow{
		{
			Records: []*database.Record{
				{
					FieldId:    "id",
					FieldValue: "111",
				},
				{
					FieldId:    "name",
					FieldValue: "Alice",
				},
				{
					FieldId:    "score",
					FieldValue: "85.5",
				},
			},
		},
		{
			Records: []*database.Record{
				{
					FieldId:    "id",
					FieldValue: "112",
				},
				{
					FieldId:    "name",
					FieldValue: "Bob",
				},
				{
					FieldId:    "score",
					FieldValue: "90.5",
				},
			},
		},
	}

	executeInsertReq := &database.ExecuteSQLRequest{
		DatabaseID:  resp.Database.ID,
		TableType:   entity2.TableType_OnlineTable,
		OperateType: entity2.OperateType_Insert,
		UpsertRows:  upsertRows,
		User: &userEntity.UserIdentity{
			UserID:  1001,
			SpaceID: 1,
		},
	}

	insertResp, err := dbService.ExecuteSQL(context.Background(), executeInsertReq)
	assert.NoError(t, err)
	assert.NotNil(t, insertResp)
	assert.NotNil(t, insertResp.RowsAffected)
	assert.Equal(t, int64(2), *insertResp.RowsAffected)

	limit := int64(10)
	selectFields := &database.SelectFieldList{
		FieldID: []string{"name", "score"},
	}

	executeSelectReq := &database.ExecuteSQLRequest{
		DatabaseID:      resp.Database.ID,
		TableType:       entity2.TableType_OnlineTable,
		OperateType:     entity2.OperateType_Select,
		SelectFieldList: selectFields,
		Limit:           &limit,
		User: &userEntity.UserIdentity{
			UserID:  1001,
			SpaceID: 1,
		},
		OrderByList: []database.OrderBy{
			{
				Field:     "id",
				Direction: entity2.SortDirection_Desc,
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
					FieldId:    "id",
					FieldValue: "111",
				},
				{
					FieldId:    "name",
					FieldValue: "Alice2",
				},
				{
					FieldId:    "score",
					FieldValue: "99",
				},
			},
		},
	}

	executeUpdateReq := &database.ExecuteSQLRequest{
		DatabaseID:  resp.Database.ID,
		TableType:   entity2.TableType_OnlineTable,
		OperateType: entity2.OperateType_Update,
		UpsertRows:  updateRows,
		Limit:       &limit,
		User: &userEntity.UserIdentity{
			UserID:  1001,
			SpaceID: 1,
		},
		Condition: &database.ComplexCondition{
			Conditions: []*database.Condition{
				{
					Left:      "id",
					Operation: entity2.Operation_EQUAL,
					Right:     "111",
				},
			},
			Logic: entity2.Logic_And,
		},
	}

	updateResp, err := dbService.ExecuteSQL(context.Background(), executeUpdateReq)
	assert.NoError(t, err)
	assert.NotNil(t, updateResp)
	assert.NotNil(t, updateResp.RowsAffected)

	executeDeleteReq := &database.ExecuteSQLRequest{
		DatabaseID:  resp.Database.ID,
		TableType:   entity2.TableType_OnlineTable,
		OperateType: entity2.OperateType_Delete,
		Limit:       &limit,
		User: &userEntity.UserIdentity{
			UserID:  1001,
			SpaceID: 1,
		},
		Condition: &database.ComplexCondition{
			Conditions: []*database.Condition{
				{
					Left:      "id",
					Operation: entity2.Operation_EQUAL,
					Right:     "111",
				},
			},
			Logic: entity2.Logic_And,
		},
	}

	dResp, err := dbService.ExecuteSQL(context.Background(), executeDeleteReq)
	assert.NoError(t, err)
	assert.NotNil(t, dResp)
	assert.NotNil(t, dResp.RowsAffected)

	selectCustom := &database.ExecuteSQLRequest{
		DatabaseID:  resp.Database.ID,
		TableType:   entity2.TableType_OnlineTable,
		OperateType: entity2.OperateType_Custom,
		Limit:       &limit,
		User: &userEntity.UserIdentity{
			UserID:  1001,
			SpaceID: 1,
		},
		SQL: ptr.Of(fmt.Sprintf("SELECT * FROM %s WHERE score > ?", "test_db_table_01")),
		SQLParams: []*entity2.SQLParamVal{
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
	updateCustom := &database.ExecuteSQLRequest{
		DatabaseID:  resp.Database.ID,
		TableType:   entity2.TableType_OnlineTable,
		OperateType: entity2.OperateType_Custom,
		User: &userEntity.UserIdentity{
			UserID:  1001,
			SpaceID: 1,
		},
		SQL: ptr.Of(fmt.Sprintf("UPDATE %s SET name = 'Bob Updated' WHERE id = ?", "test_db_table_01")),
		SQLParams: []*entity2.SQLParamVal{
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
	deleteCustom := &database.ExecuteSQLRequest{
		DatabaseID:  resp.Database.ID,
		TableType:   entity2.TableType_OnlineTable,
		OperateType: entity2.OperateType_Custom,
		User: &userEntity.UserIdentity{
			UserID:  1001,
			SpaceID: 1,
		},
		SQL: ptr.Of(fmt.Sprintf("DELETE FROM %s WHERE id = ?", "test_db_table_01")),
		SQLParams: []*entity2.SQLParamVal{
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
