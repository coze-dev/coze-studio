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

package rdb

import (
	"context"
	"database/sql"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/infra/rdb"
	entity2 "github.com/coze-dev/coze-studio/backend/infra/rdb/entity"
	"github.com/coze-dev/coze-studio/backend/infra/sqlparser"
	sqlparserImpl "github.com/coze-dev/coze-studio/backend/infra/sqlparser/impl/sqlparser"
	mock "github.com/coze-dev/coze-studio/backend/internal/mock/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func setupTestDB(t *testing.T) (*gorm.DB, rdb.RDB) {
	dsn := "root:root@tcp(127.0.0.1:3306)/opencoze?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn))
	assert.NoError(t, err)

	ctrl := gomock.NewController(t)
	idGen := mock.NewMockIDGenerator(ctrl)
	idGen.EXPECT().GenID(gomock.Any()).Return(int64(123), nil).AnyTimes()

	return db, NewService(db, idGen)
}

func cleanupTestDB(_ *testing.T, db *gorm.DB, tableNames ...string) {
	for _, tableName := range tableNames {
		db.WithContext(context.Background()).Exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", tableName))
	}
}

func TestCreateTable(t *testing.T) {
	db, svc := setupTestDB(t)
	defer cleanupTestDB(t, db, "test_table")

	length := 255
	req := &rdb.CreateTableRequest{
		Table: &entity2.Table{
			Name: "test_table",
			Columns: []*entity2.Column{
				{
					Name:     "id",
					DataType: entity2.TypeInt,
					NotNull:  true,
				},
				{
					Name:     "name",
					DataType: entity2.TypeVarchar,
					Length:   &length,
					NotNull:  true,
				},
				{
					Name:     "created_at",
					DataType: entity2.TypeTimestamp,
					NotNull:  true,
					DefaultValue: func() *string {
						val := "CURRENT_TIMESTAMP"
						return &val
					}(),
				},
				{
					Name:         "score",
					DataType:     entity2.TypeDouble,
					NotNull:      true,
					DefaultValue: ptr.Of("60.5"),
				},
			},
			Indexes: []*entity2.Index{
				{
					Name:    "PRIMARY",
					Type:    entity2.PrimaryKey,
					Columns: []string{"id"},
				},
				{
					Name:    "idx_name",
					Type:    entity2.NormalKey,
					Columns: []string{"name"},
				},
			},
			Options: &entity2.TableOption{
				Comment: func() *string {
					comment := "Test table created by unit test"
					return &comment
				}(),
			},
		},
	}

	resp, err := svc.CreateTable(context.Background(), req)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.Equal(t, req.Table.Name, resp.Table.Name)

	var tableExists bool
	err = db.Raw("SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", "test_table").Scan(&tableExists).Error
	assert.NoError(t, err)
	assert.True(t, tableExists)
}

func TestAlterTable(t *testing.T) {
	db, svc := setupTestDB(t)
	defer cleanupTestDB(t, db, "test_table")

	t.Run("success", func(t *testing.T) {
		err := db.Exec(`
			CREATE TABLE IF NOT EXISTS test_table (
				id INT NOT NULL AUTO_INCREMENT,
				name VARCHAR(255) NOT NULL,
			    description VARCHAR(255) NOT NULL,
			    droped VARCHAR(255) NOT NULL,
				PRIMARY KEY (id),
				INDEX idx_name (name)
			) COMMENT='Test table created by unit test'
		`).Error
		assert.NoError(t, err, "Failed to create test table")

		length := 100
		req := &rdb.AlterTableRequest{
			TableName: "test_table",
			Operations: []*rdb.AlterTableOperation{
				{
					Action: entity2.AddColumn,
					Column: &entity2.Column{
						Name:     "email",
						DataType: entity2.TypeVarchar,
						Length:   &length,
						NotNull:  false,
					},
				},
				{
					Action: entity2.ModifyColumn,
					Column: &entity2.Column{
						Name:     "description",
						DataType: entity2.TypeText,
						NotNull:  false,
					},
				},
				{
					Action: entity2.DropColumn,
					Column: &entity2.Column{
						Name:     "droped",
						DataType: entity2.TypeVarchar,
						NotNull:  false,
					},
				},
			},
		}

		resp, err := svc.AlterTable(context.Background(), req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, "test_table", resp.Table.Name)

		var columnExists bool
		err = db.Raw("SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?", "test_table", "email").Scan(&columnExists).Error
		assert.NoError(t, err)
		assert.True(t, columnExists)
	})
}

func TestGetTable(t *testing.T) {
	db, svc := setupTestDB(t)
	defer cleanupTestDB(t, db, "test_info_table")

	t.Run("success", func(t *testing.T) {
		err := db.Exec(`
			CREATE TABLE IF NOT EXISTS test_info_table (
				id INT NOT NULL AUTO_INCREMENT,
				name VARCHAR(255) NOT NULL,
				description TEXT,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				PRIMARY KEY (id),
				INDEX idx_name (name)
			) COMMENT='Table info test'
		`).Error
		assert.NoError(t, err, "Failed to create test table")

		req := &rdb.GetTableRequest{
			TableName: "test_info_table",
		}

		resp, err := svc.GetTable(context.Background(), req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, "test_info_table", resp.Table.Name)
		assert.Equal(t, len(resp.Table.Columns), 4)

		columnMap := make(map[string]*entity2.Column)
		for _, col := range resp.Table.Columns {
			columnMap[col.Name] = col
		}

		assert.Contains(t, columnMap, "id")
		assert.Contains(t, columnMap, "name")
		assert.Contains(t, columnMap, "created_at")
	})
	t.Run("not found", func(t *testing.T) {
		err := db.Exec(`
			CREATE TABLE IF NOT EXISTS test_info_table (
				id INT NOT NULL AUTO_INCREMENT,
				name VARCHAR(255) NOT NULL,
				description TEXT,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				PRIMARY KEY (id),
				INDEX idx_name (name)
			) COMMENT='Table info test'
		`).Error
		assert.NoError(t, err, "Failed to create test table")

		req := &rdb.GetTableRequest{
			TableName: "test_info_table_error_name",
		}

		resp, err := svc.GetTable(context.Background(), req)
		assert.Error(t, err)
		assert.Equal(t, err, sql.ErrNoRows)
		assert.Nil(t, resp)
	})
}

func TestInsertData(t *testing.T) {
	db, svc := setupTestDB(t)
	defer cleanupTestDB(t, db, "test_insert_table")

	err := db.Exec(`
		CREATE TABLE IF NOT EXISTS test_insert_table (
			id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
			name VARCHAR(255) NOT NULL,
			age INT
		)
	`).Error
	assert.NoError(t, err, "Failed to create test table")

	t.Run("success", func(t *testing.T) {
		req := &rdb.InsertDataRequest{
			TableName: "test_insert_table",
			Data: []map[string]interface{}{
				{
					"name": "John Doe",
					"age":  30,
				},
				{
					"name": "Jane Smith",
					"age":  nil,
				},
			},
		}

		resp, err := svc.InsertData(context.Background(), req)

		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, int64(2), resp.AffectedRows)

		var count int
		err = db.Raw("SELECT COUNT(*) FROM test_insert_table").Scan(&count).Error
		assert.NoError(t, err)
		assert.Equal(t, 2, count)
	})

	t.Run("table name error", func(t *testing.T) {
		req := &rdb.InsertDataRequest{
			TableName: "test_insert_table_error_name",
			Data: []map[string]interface{}{
				{
					"name": "John Doe",
					"age":  30,
				},
				{
					"name": "Jane Smith",
					"age":  nil,
				},
			},
		}

		resp, err := svc.InsertData(context.Background(), req)
		assert.Error(t, err)
		assert.Nil(t, resp)
	})
}

func TestUpdateData(t *testing.T) {
	db, svc := setupTestDB(t)
	defer cleanupTestDB(t, db, "test_update_table")

	err := db.Exec(`
		CREATE TABLE IF NOT EXISTS test_update_table (
			id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
			name VARCHAR(255) NOT NULL,
			age INT,
			status VARCHAR(20) DEFAULT 'active'
		)
	`).Error
	assert.NoError(t, err, "Failed to create test table")

	err = db.Exec("INSERT INTO test_update_table (name, age) VALUES (?, ?), (?, ?)",
		"John Doe", 30, "Jane Smith", 25).Error
	assert.NoError(t, err, "Failed to insert test data")

	t.Run("success", func(t *testing.T) {
		req := &rdb.UpdateDataRequest{
			TableName: "test_update_table",
			Data: map[string]interface{}{
				"age":    35,
				"status": "updated",
			},
			Where: &rdb.ComplexCondition{
				Conditions: []*rdb.Condition{
					{
						Field:    "name",
						Operator: entity2.OperatorEqual,
						Value:    "John Doe",
					},
				},
				Operator: entity2.AND,
			},
		}

		resp, err := svc.UpdateData(context.Background(), req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, int64(1), resp.AffectedRows)

		type Result struct {
			Age    int
			Status string
		}
		var result Result
		err = db.Raw("SELECT age, status FROM test_update_table WHERE name = ?", "John Doe").Scan(&result).Error
		assert.NoError(t, err)
		assert.Equal(t, 35, result.Age)
		assert.Equal(t, "updated", result.Status)
	})
}

func TestDeleteData(t *testing.T) {
	db, svc := setupTestDB(t)
	defer cleanupTestDB(t, db, "test_delete_table")

	err := db.Exec(`
		CREATE TABLE IF NOT EXISTS test_delete_table (
			id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
			name VARCHAR(255) NOT NULL,
			age INT
		)
	`).Error
	assert.NoError(t, err, "Failed to create test table")

	err = db.Exec("INSERT INTO test_delete_table (name, age) VALUES (?, ?), (?, ?), (?, ?)",
		"John Doe", 30, "Jane Smith", 25, "Bob Johnson", 40).Error
	assert.NoError(t, err, "Failed to insert test data")

	t.Run("success", func(t *testing.T) {
		req := &rdb.DeleteDataRequest{
			TableName: "test_delete_table",
			Where: &rdb.ComplexCondition{
				Conditions: []*rdb.Condition{
					{
						Field:    "age",
						Operator: entity2.OperatorGreaterEqual,
						Value:    30,
					},
				},
				Operator: entity2.AND,
			},
		}

		resp, err := svc.DeleteData(context.Background(), req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, int64(2), resp.AffectedRows)

		var count int
		err = db.Raw("SELECT COUNT(*) FROM test_delete_table").Scan(&count).Error
		assert.NoError(t, err)
		assert.Equal(t, 1, count)
	})
}

func TestSelectData(t *testing.T) {
	db, svc := setupTestDB(t)
	defer cleanupTestDB(t, db, "test_select_table")

	err := db.Exec(`
		CREATE TABLE IF NOT EXISTS test_select_table (
			id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
			name VARCHAR(255) NOT NULL,
			age BIGINT,
			status VARCHAR(20) DEFAULT 'active',
		    score FLOAT,
		    score2 DOUBLE DEFAULT '90.5',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`).Error
	assert.NoError(t, err, "Failed to create test table")

	err = db.Exec(`
		INSERT INTO test_select_table (name, age, status, score, score2) VALUES
		(?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`,
		"John Doe", 30, "active", 1.1, 89.55554444,
		"Jane Smith", 25, "active", 1.2, 90.55554444,
		"Bob Johnson", 40, "inactive", 1.3, 91.55554444,
		"Alice Brown", 35, "active", nil, 92.55554444).Error
	assert.NoError(t, err, "Failed to insert test data")

	t.Run("success", func(t *testing.T) {
		req := &rdb.SelectDataRequest{
			TableName: "test_select_table",
			Fields:    []string{"id", "name", "age", "created_at", "score", "score2"},
			Where: &rdb.ComplexCondition{
				Conditions: []*rdb.Condition{
					{
						Field:    "status",
						Operator: entity2.OperatorEqual,
						Value:    "active",
					},
					{
						Field:    "age",
						Operator: entity2.OperatorGreaterEqual,
						Value:    25,
					},
				},
				Operator: entity2.AND,
			},
			OrderBy: []*rdb.OrderBy{
				{
					Field:     "age",
					Direction: entity2.SortDirectionDesc,
				},
			},
			Limit:  func() *int { limit := 2; return &limit }(),
			Offset: func() *int { offset := 0; return &offset }(),
		}

		resp, err := svc.SelectData(context.Background(), req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, int64(3), resp.Total)
		assert.Len(t, resp.ResultSet.Rows, 2)

		if len(resp.ResultSet.Rows) > 0 {
			firstRow := resp.ResultSet.Rows[0]
			assert.Equal(t, "Alice Brown", string(firstRow["name"].([]uint8)))
			assert.Equal(t, int64(35), firstRow["age"])

			assert.Equal(t, int64(35), firstRow["age"].(int64))
			assert.Equal(t, nil, firstRow["score"])
			timeR := firstRow["created_at"].(time.Time)
			assert.False(t, timeR.IsZero())
			assert.Nil(t, firstRow["score"])
			assert.Equal(t, 92.55554444, firstRow["score2"].(float64))
		}
	})

	t.Run("success", func(t *testing.T) {
		req := &rdb.SelectDataRequest{
			TableName: "test_select_table",
			Fields:    []string{"id", "name", "age", "created_at", "score"},
			Where: &rdb.ComplexCondition{
				Conditions: []*rdb.Condition{
					{
						Field:    "age",
						Operator: entity2.OperatorIn,
						Value:    []int{30, 25, 18},
					},
				},
				Operator: entity2.AND,
			},
			OrderBy: []*rdb.OrderBy{
				{
					Field:     "age",
					Direction: entity2.SortDirectionDesc,
				},
			},
		}

		resp, err := svc.SelectData(context.Background(), req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, int64(2), resp.Total)
		assert.Len(t, resp.ResultSet.Rows, 2)

		if len(resp.ResultSet.Rows) > 0 {
			firstRow := resp.ResultSet.Rows[0]
			assert.Equal(t, "John Doe", string(firstRow["name"].([]uint8)))
			assert.Equal(t, int64(30), firstRow["age"])

			assert.Equal(t, float32(1.1), firstRow["score"].(float32))
		}
	})
}

func TestExecuteSQL(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		sqlparser.New = sqlparserImpl.NewSQLParser

		db, svc := setupTestDB(t)
		defer cleanupTestDB(t, db, "test_sql_table")

		err := db.Exec(`
			CREATE TABLE IF NOT EXISTS test_sql_table (
				id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
				name VARCHAR(255) NOT NULL,
				age INT
			)
		`).Error
		assert.NoError(t, err, "Failed to create test table")
		err = db.Exec("INSERT INTO test_sql_table (name, age) VALUES (?, ?), (?, ?)",
			"John Doe", 30, "Jane Smith", 25).Error
		assert.NoError(t, err, "Failed to insert test data")

		req := &rdb.ExecuteSQLRequest{
			SQL:    "SELECT id, name, age FROM test_sql_table WHERE age in ? and  name in ? ORDER BY age DESC",
			Params: []interface{}{[]int{30, 25}, []string{"John Doe", "Jane Smith"}},
		}

		resp, err := svc.ExecuteSQL(context.Background(), req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Len(t, resp.ResultSet.Rows, 2)
		assert.Equal(t, []string{"id", "name", "age"}, resp.ResultSet.Columns)

		if len(resp.ResultSet.Rows) > 0 {
			firstRow := resp.ResultSet.Rows[0]
			assert.Equal(t, "John Doe", string(firstRow["name"].([]uint8)))
		}

		rawReq := &rdb.ExecuteSQLRequest{
			SQL: "SELECT id, name, age FROM test_sql_table WHERE age in (30, 25) and  name in (\"John Doe\", \"Jane Smith\") ORDER BY age DESC",
		}

		rawResp, err := svc.ExecuteSQL(context.Background(), rawReq)
		assert.NoError(t, err)
		assert.NotNil(t, rawResp)
		assert.Len(t, rawResp.ResultSet.Rows, 2)
		assert.Equal(t, []string{"id", "name", "age"}, rawResp.ResultSet.Columns)

		if len(rawResp.ResultSet.Rows) > 0 {
			firstRow := rawResp.ResultSet.Rows[0]
			assert.Equal(t, "John Doe", string(firstRow["name"].([]uint8)))
		}
	})

	t.Run("success", func(t *testing.T) {
		db, svc := setupTestDB(t)
		defer cleanupTestDB(t, db, "test_sql_table")

		err := db.Exec(`
			CREATE TABLE IF NOT EXISTS test_sql_table (
				id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
				name VARCHAR(255) NOT NULL,
				age INT
			)
		`).Error
		assert.NoError(t, err, "Failed to create test table")
		err = db.Exec("INSERT INTO test_sql_table (name, age) VALUES (?, ?), (?, ?)",
			"John Doe", 30, "Jane Smith", 25).Error
		assert.NoError(t, err, "Failed to insert test data")

		req := &rdb.ExecuteSQLRequest{
			SQL:    "SELECT id, name, age FROM test_sql_table WHERE age in (?, ?) and  name in (?, ?) ORDER BY age DESC",
			Params: []interface{}{30, 25, "John Doe", "Jane Smith"},
		}

		resp, err := svc.ExecuteSQL(context.Background(), req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, len(resp.ResultSet.Rows), 2)
		assert.Equal(t, []string{"id", "name", "age"}, resp.ResultSet.Columns)

		if len(resp.ResultSet.Rows) > 0 {
			firstRow := resp.ResultSet.Rows[0]
			assert.Equal(t, "John Doe", string(firstRow["name"].([]uint8)))
		}
	})
}

func TestUpsertData(t *testing.T) {
	t.Run("insert new records", func(t *testing.T) {
		db, svc := setupTestDB(t)
		defer cleanupTestDB(t, db, "test_upsert_table")

		err := db.Exec(`
		CREATE TABLE IF NOT EXISTS test_upsert_table (
				id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
				name VARCHAR(255) NOT NULL,
				age INT,
				status VARCHAR(20) DEFAULT 'active',
				UNIQUE KEY idx_name (name)
			)
		`).Error
		assert.NoError(t, err, "Failed to create test table")

		req := &rdb.UpsertDataRequest{
			TableName: "test_upsert_table",
			Data: []map[string]interface{}{
				{
					"id":     1,
					"name":   "John Doe",
					"age":    30,
					"status": "active",
				},
				{
					"id":     2,
					"name":   "Jane Smith",
					"age":    25,
					"status": "active",
				},
			},
			Keys: []string{"name"},
		}

		resp, err := svc.UpsertData(context.Background(), req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, int64(2), resp.InsertedRows)
		assert.Equal(t, int64(0), resp.UpdatedRows)

		var count int
		err = db.Raw("SELECT COUNT(*) FROM test_upsert_table WHERE name IN (?, ?)",
			"John Doe", "Jane Smith").Scan(&count).Error
		assert.NoError(t, err)
		assert.Equal(t, 2, count)
	})

	t.Run("error", func(t *testing.T) {
		db, svc := setupTestDB(t)
		defer cleanupTestDB(t, db, "test_upsert_table")

		err := db.Exec(`
		CREATE TABLE IF NOT EXISTS test_upsert_table (
				id INT NOT NULL,
				name VARCHAR(255) NOT NULL,
				age INT,
				status VARCHAR(20) DEFAULT 'active',
				PRIMARY KEY (id),
				UNIQUE KEY idx_name (name)
			)
		`).Error
		assert.NoError(t, err, "Failed to create test table")

		reqInsert := &rdb.UpsertDataRequest{
			TableName: "test_upsert_table",
			Data: []map[string]interface{}{
				{
					"id":     1,
					"name":   "John Doe",
					"age":    30,
					"status": "active",
				},
				{
					"id":     2,
					"name":   "Jane Smith",
					"age":    25,
					"status": "active",
				},
			},
			Keys: []string{"name"},
		}
		_, err = svc.UpsertData(context.Background(), reqInsert)
		assert.NoError(t, err)

		req := &rdb.UpsertDataRequest{
			TableName: "test_upsert_table",
			Data: []map[string]interface{}{
				{
					"name":   "New Person",
					"age":    40,
					"status": "active",
				},
			},
			Keys: []string{"name"},
		}

		resp, err := svc.UpsertData(context.Background(), req)
		assert.Nil(t, resp)
		assert.Error(t, err)
	})

	t.Run("update existing records", func(t *testing.T) {
		db, svc := setupTestDB(t)
		defer cleanupTestDB(t, db, "test_upsert_table")

		err := db.Exec(`
		CREATE TABLE IF NOT EXISTS test_upsert_table (
				id INT NOT NULL,
				name VARCHAR(255) NOT NULL,
				age INT,
				status VARCHAR(20) DEFAULT 'active',
				PRIMARY KEY (id),
				UNIQUE KEY idx_name (name)
			)
		`).Error
		assert.NoError(t, err, "Failed to create test table")

		reqInsert := &rdb.UpsertDataRequest{
			TableName: "test_upsert_table",
			Data: []map[string]interface{}{
				{
					"id":     1,
					"name":   "John Doe",
					"age":    30,
					"status": "active",
				},
				{
					"id":     2,
					"name":   "Jane Smith",
					"age":    25,
					"status": "active",
				},
			},
			Keys: []string{"name"},
		}
		_, err = svc.UpsertData(context.Background(), reqInsert)
		assert.NoError(t, err)

		req := &rdb.UpsertDataRequest{
			TableName: "test_upsert_table",
			Data: []map[string]interface{}{
				{
					"id":     1,
					"name":   "John Doe",
					"age":    35,
					"status": "updated",
				},
				{
					"id":     2,
					"name":   "Jane Smith",
					"age":    25,
					"status": "updated",
				},
				{
					"id":     3,
					"name":   "New Person",
					"age":    40,
					"status": "active",
				},
				{
					"id":     4,
					"name":   "New Person 2",
					"age":    40,
					"status": "active",
				},
				{
					"id":     5,
					"name":   "New Person 3",
					"age":    40,
					"status": "active",
				},
			},
			Keys: []string{"name"},
		}

		resp, err := svc.UpsertData(context.Background(), req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, int64(3), resp.InsertedRows)
		assert.Equal(t, int64(2), resp.UpdatedRows)
	})

	t.Run("use primary key when keys not specified", func(t *testing.T) {
		db, svc := setupTestDB(t)
		defer cleanupTestDB(t, db, "test_upsert_table")

		err := db.Exec(`
		CREATE TABLE IF NOT EXISTS test_upsert_table (
				id INT NOT NULL,
				name VARCHAR(255) NOT NULL,
				age INT,
				status VARCHAR(20) DEFAULT 'active',
				PRIMARY KEY (age),
				UNIQUE KEY idx_name (name)
			)
		`).Error
		assert.NoError(t, err, "Failed to create test table")

		reqInsert := &rdb.UpsertDataRequest{
			TableName: "test_upsert_table",
			Data: []map[string]interface{}{
				{
					"id":     1,
					"name":   "John Doe",
					"age":    30,
					"status": "active",
				},
				{
					"id":     2,
					"name":   "Jane Smith",
					"age":    25,
					"status": "active",
				},
			},
		}
		_, err = svc.UpsertData(context.Background(), reqInsert)
		assert.NoError(t, err)

		req := &rdb.UpsertDataRequest{
			TableName: "test_upsert_table",
			Data: []map[string]interface{}{
				{
					"id":     1,
					"name":   "John Doe Updated",
					"age":    30,
					"status": "primary key updated",
				},
				{
					"id":     3,
					"name":   "New Person",
					"age":    40,
					"status": "active",
				},
				{
					"id":     4,
					"name":   "New Person 2",
					"age":    45,
					"status": "active",
				},
			},
		}

		resp, err := svc.UpsertData(context.Background(), req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, int64(2), resp.InsertedRows)
		assert.Equal(t, int64(1), resp.UpdatedRows)
		req = &rdb.UpsertDataRequest{
			TableName: "test_upsert_table",
			Data: []map[string]interface{}{
				{
					"id":     1,
					"name":   "John Doe Updated",
					"age":    30,
					"status": "primary key updated",
				},
				{
					"id":     3,
					"name":   "New Person",
					"age":    40,
					"status": "active",
				},
				{
					"id":     4,
					"name":   "New Person 2",
					"age":    45,
					"status": "active update",
				},
			},
		}

		resp, err = svc.UpsertData(context.Background(), req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, int64(2), resp.AffectedRows)
		assert.Equal(t, int64(1), resp.UnchangedRows)
	})
}
