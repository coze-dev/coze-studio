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
	"fmt"
	"reflect"
	"strings"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/rdb"
	entity2 "github.com/coze-dev/coze-studio/backend/infra/contract/rdb/entity"
	sqlparsercontract "github.com/coze-dev/coze-studio/backend/infra/contract/sqlparser"
	"github.com/coze-dev/coze-studio/backend/infra/impl/sqlparser"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type mysqlService struct {
	db        *gorm.DB
	generator idgen.IDGenerator
}

func NewService(db *gorm.DB, generator idgen.IDGenerator) rdb.RDB {
	return &mysqlService{db: db, generator: generator}
}

// CreateTable create table
func (m *mysqlService) CreateTable(ctx context.Context, req *rdb.CreateTableRequest) (*rdb.CreateTableResponse, error) {
	if req == nil || req.Table == nil {
		return nil, fmt.Errorf("invalid request")
	}

	// build column definitions
	columnDefs := make([]string, 0, len(req.Table.Columns))
	for _, col := range req.Table.Columns {
		colDef := fmt.Sprintf("`%s` %s", col.Name, col.DataType)

		if col.Length != nil {
			colDef += fmt.Sprintf("(%d)", *col.Length)
		} else if col.Length == nil && col.DataType == entity2.TypeVarchar {
			colDef += fmt.Sprintf("(%d)", 255)
		}

		if col.NotNull {
			colDef += " NOT NULL"
		}
		if col.DefaultValue != nil {
			if col.DataType == entity2.TypeTimestamp {
				colDef += fmt.Sprintf(" DEFAULT %s", *col.DefaultValue)
			} else if col.DataType == entity2.TypeText {
				// do nothing
			} else {
				colDef += fmt.Sprintf(" DEFAULT '%s'", *col.DefaultValue)
			}
		}
		if col.AutoIncrement {
			colDef += " AUTO_INCREMENT"
		}
		if col.Comment != nil {
			colDef += fmt.Sprintf(" COMMENT '%s'", *col.Comment)
		}

		columnDefs = append(columnDefs, colDef)
	}

	// build index definitions
	for _, idx := range req.Table.Indexes {
		var idxDef string
		switch idx.Type {
		case entity2.PrimaryKey:
			idxDef = fmt.Sprintf("PRIMARY KEY (`%s`)", strings.Join(idx.Columns, "`,`"))
		case entity2.UniqueKey:
			idxDef = fmt.Sprintf("UNIQUE KEY `%s` (`%s`)", idx.Name, strings.Join(idx.Columns, "`,`"))
		default:
			idxDef = fmt.Sprintf("KEY `%s` (`%s`)", idx.Name, strings.Join(idx.Columns, "`,`"))
		}
		columnDefs = append(columnDefs, idxDef)
	}

	tableOptions := make([]string, 0)
	if req.Table.Options != nil {
		if req.Table.Options.Collate != nil {
			tableOptions = append(tableOptions, fmt.Sprintf("COLLATE=%s", *req.Table.Options.Collate))
		}
		if req.Table.Options.AutoIncrement != nil {
			tableOptions = append(tableOptions, fmt.Sprintf("AUTO_INCREMENT=%d", *req.Table.Options.AutoIncrement))
		}
		if req.Table.Options.Comment != nil {
			tableOptions = append(tableOptions, fmt.Sprintf("COMMENT='%s'", *req.Table.Options.Comment))
		}
	}

	tableName := req.Table.Name
	if req.Table.Name == "" {
		genName, err := m.genTableName(ctx)
		if err != nil {
			return nil, err
		}

		tableName = genName
	}

	createSQL := fmt.Sprintf("CREATE TABLE IF NOT EXISTS `%s` (\n  %s\n) %s",
		tableName,
		strings.Join(columnDefs, ",\n  "),
		strings.Join(tableOptions, " "),
	)

	logs.CtxInfof(ctx, "[CreateTable] execute sql is %s, req is %v", createSQL, req)

	err := m.db.WithContext(ctx).Exec(createSQL).Error
	if err != nil {
		return nil, fmt.Errorf("failed to create table: %v", err)
	}

	resTable := req.Table
	resTable.Name = tableName
	return &rdb.CreateTableResponse{Table: resTable}, nil
}

// AlterTable alter table
func (m *mysqlService) AlterTable(ctx context.Context, req *rdb.AlterTableRequest) (*rdb.AlterTableResponse, error) {
	if req == nil || len(req.Operations) == 0 {
		return nil, fmt.Errorf("invalid request")
	}

	alterSQL := fmt.Sprintf("ALTER TABLE `%s`", req.TableName)
	operations := make([]string, 0, len(req.Operations))

	for _, op := range req.Operations {
		switch op.Action {
		case entity2.AddColumn:
			if op.Column == nil {
				return nil, fmt.Errorf("column is required for ADD COLUMN operation")
			}
			colDef := fmt.Sprintf("ADD COLUMN `%s` %s", op.Column.Name, op.Column.DataType)
			if op.Column.Length != nil {
				colDef += fmt.Sprintf("(%d)", *op.Column.Length)
			} else if op.Column.Length == nil && op.Column.DataType == entity2.TypeVarchar {
				colDef += fmt.Sprintf("(%d)", 255)
			}

			if op.Column.NotNull {
				colDef += " NOT NULL"
			}

			if op.Column.DefaultValue != nil {
				if op.Column.DataType == entity2.TypeTimestamp {
					colDef += fmt.Sprintf(" DEFAULT %s", *op.Column.DefaultValue)
				} else {
					colDef += fmt.Sprintf(" DEFAULT '%s'", *op.Column.DefaultValue)
				}
			}

			operations = append(operations, colDef)

		case entity2.DropColumn:
			if op.Column == nil {
				return nil, fmt.Errorf("column is required for DROP COLUMN operation")
			}
			operations = append(operations, fmt.Sprintf("DROP COLUMN `%s`", op.Column.Name))

		case entity2.ModifyColumn:
			if op.Column == nil {
				return nil, fmt.Errorf("column is required for MODIFY COLUMN operation")
			}
			colDef := fmt.Sprintf("MODIFY COLUMN `%s` %s", op.Column.Name, op.Column.DataType)
			if op.Column.Length != nil {
				colDef += fmt.Sprintf("(%d)", *op.Column.Length)
			} else if op.Column.Length == nil && op.Column.DataType == entity2.TypeVarchar {
				colDef += fmt.Sprintf("(%d)", 255)
			}
			operations = append(operations, colDef)

		case entity2.RenameColumn:
			if op.Column == nil || op.OldName == nil {
				return nil, fmt.Errorf("column and old name are required for RENAME COLUMN operation")
			}
			operations = append(operations, fmt.Sprintf("RENAME COLUMN `%s` TO `%s`", *op.OldName, op.Column.Name))

		case entity2.AddIndex:
			if op.Index == nil {
				return nil, fmt.Errorf("index is required for ADD INDEX operation")
			}
			var idxDef string
			switch op.Index.Type {
			case entity2.PrimaryKey:
				idxDef = fmt.Sprintf("ADD PRIMARY KEY (`%s`)", strings.Join(op.Index.Columns, "`,`"))
			case entity2.UniqueKey:
				idxDef = fmt.Sprintf("ADD UNIQUE INDEX `%s` (`%s`)", op.Index.Name, strings.Join(op.Index.Columns, "`,`"))
			default:
				idxDef = fmt.Sprintf("ADD INDEX `%s` (`%s`)", op.Index.Name, strings.Join(op.Index.Columns, "`,`"))
			}
			operations = append(operations, idxDef)
		}
	}

	alterSQL += " " + strings.Join(operations, ", ")

	logs.CtxInfof(ctx, "[AlterTable] execute sql is %s, req is %v", alterSQL, req)

	err := m.db.WithContext(ctx).Exec(alterSQL).Error
	if err != nil {
		return nil, fmt.Errorf("failed to alter table: %v", err)
	}

	table, err := m.getTableInfo(ctx, req.TableName)
	if err != nil {
		return nil, fmt.Errorf("failed to get table info: %v", err)
	}

	return &rdb.AlterTableResponse{Table: table}, nil
}

// DropTable drop table
func (m *mysqlService) DropTable(ctx context.Context, req *rdb.DropTableRequest) (*rdb.DropTableResponse, error) {
	if req == nil {
		return nil, fmt.Errorf("invalid request")
	}

	dropSQL := "DROP TABLE"
	if req.IfExists {
		dropSQL += " IF EXISTS"
	}
	dropSQL += fmt.Sprintf(" `%s`", req.TableName)

	logs.CtxInfof(ctx, "[DropTable] execute sql is %s, req is %v", dropSQL, req)

	err := m.db.WithContext(ctx).Exec(dropSQL).Error
	if err != nil {
		return nil, fmt.Errorf("failed to drop table: %v", err)
	}

	return &rdb.DropTableResponse{Success: true}, nil
}

// GetTable get table schema info
func (m *mysqlService) GetTable(ctx context.Context, req *rdb.GetTableRequest) (*rdb.GetTableResponse, error) {
	if req == nil {
		return nil, fmt.Errorf("invalid request")
	}

	table, err := m.getTableInfo(ctx, req.TableName)
	if err != nil {
		return nil, err
	}

	return &rdb.GetTableResponse{Table: table}, nil
}

func (m *mysqlService) InsertData(ctx context.Context, req *rdb.InsertDataRequest) (*rdb.InsertDataResponse, error) {
	if req == nil || len(req.Data) == 0 {
		return nil, fmt.Errorf("invalid request")
	}

	fields := make([]string, 0)
	for field := range req.Data[0] {
		fields = append(fields, field)
	}

	const batchSize = 1000
	var totalAffected int64

	for i := 0; i < len(req.Data); i += batchSize {
		end := i + batchSize
		if end > len(req.Data) {
			end = len(req.Data)
		}

		currentBatch := req.Data[i:end]

		placeholderGroups := make([]string, 0, len(currentBatch))
		values := make([]interface{}, 0, len(currentBatch)*len(fields))

		for _, row := range currentBatch {
			placeholders := make([]string, len(fields))
			for j := range placeholders {
				placeholders[j] = "?"
			}
			placeholderGroups = append(placeholderGroups, "("+strings.Join(placeholders, ",")+")")

			for _, field := range fields {
				values = append(values, row[field])
			}
		}

		insertSQL := fmt.Sprintf("INSERT INTO `%s` (`%s`) VALUES %s",
			req.TableName,
			strings.Join(fields, "`,`"),
			strings.Join(placeholderGroups, ","),
		)

		logs.CtxInfof(ctx, "[InsertData] execute sql is %s, value is %v in batch %d", insertSQL, values, i)

		result := m.db.WithContext(ctx).Exec(insertSQL, values...)
		if result.Error != nil {
			return nil, result.Error
		}

		affected := result.RowsAffected
		totalAffected += affected
	}

	return &rdb.InsertDataResponse{AffectedRows: totalAffected}, nil
}

// UpdateData Update data
func (m *mysqlService) UpdateData(ctx context.Context, req *rdb.UpdateDataRequest) (*rdb.UpdateDataResponse, error) {
	if req == nil {
		return nil, fmt.Errorf("invalid request")
	}

	setClauses := make([]string, 0)
	values := make([]interface{}, 0)
	for field, value := range req.Data {
		setClauses = append(setClauses, fmt.Sprintf("`%s` = ?", field))
		values = append(values, value)
	}

	whereClause, whereValues, err := m.buildWhereClause(req.Where)
	if err != nil {
		return nil, fmt.Errorf("failed to build where clause: %v", err)
	}
	values = append(values, whereValues...)

	limitClause := ""
	if req.Limit != nil {
		limitClause = fmt.Sprintf(" LIMIT %d", *req.Limit)
	}

	updateSQL := fmt.Sprintf("UPDATE `%s` SET %s%s%s",
		req.TableName,
		strings.Join(setClauses, ", "),
		whereClause,
		limitClause,
	)

	logs.CtxInfof(ctx, "[UpdateData] execute sql is %s, value is %v, req is %v", updateSQL, values, req)

	result := m.db.WithContext(ctx).Exec(updateSQL, values...)
	if result.Error != nil {
		return nil, result.Error
	}

	affectedRows := result.RowsAffected

	return &rdb.UpdateDataResponse{AffectedRows: affectedRows}, nil
}

// DeleteData delete data
func (m *mysqlService) DeleteData(ctx context.Context, req *rdb.DeleteDataRequest) (*rdb.DeleteDataResponse, error) {
	if req == nil {
		return nil, fmt.Errorf("invalid request")
	}

	whereClause, whereValues, err := m.buildWhereClause(req.Where)
	if err != nil {
		return nil, fmt.Errorf("failed to build where clause: %v", err)
	}

	limitClause := ""
	if req.Limit != nil {
		limitClause = fmt.Sprintf(" LIMIT %d", *req.Limit)
	}

	deleteSQL := fmt.Sprintf("DELETE FROM `%s`%s%s",
		req.TableName,
		whereClause,
		limitClause,
	)

	logs.CtxInfof(ctx, "[DeleteData] execute sql is %s, value is %v, req is %v", deleteSQL, whereValues, req)

	result := m.db.WithContext(ctx).Exec(deleteSQL, whereValues...)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to delete data: %v", result.Error)
	}

	affectedRows := result.RowsAffected

	return &rdb.DeleteDataResponse{AffectedRows: affectedRows}, nil
}

// SelectData select data
func (m *mysqlService) SelectData(ctx context.Context, req *rdb.SelectDataRequest) (*rdb.SelectDataResponse, error) {
	if req == nil {
		return nil, fmt.Errorf("invalid request")
	}

	fields := "*"
	if len(req.Fields) > 0 {
		fields = strings.Join(req.Fields, ", ")
	}

	whereClause := ""
	whereValues := make([]interface{}, 0)
	if req.Where != nil {
		clause, values, err := m.buildWhereClause(req.Where)
		if err != nil {
			return nil, fmt.Errorf("failed to build where clause: %v", err)
		}
		whereClause = clause
		whereValues = values
	}

	orderByClause := ""
	if len(req.OrderBy) > 0 {
		orders := make([]string, len(req.OrderBy))
		for i, order := range req.OrderBy {
			orders[i] = fmt.Sprintf("%s %s", order.Field, order.Direction)
		}
		orderByClause = " ORDER BY " + strings.Join(orders, ", ")
	}

	limitClause := ""
	if req.Limit != nil {
		limitClause = fmt.Sprintf(" LIMIT %d", *req.Limit)
		if req.Offset != nil {
			limitClause += fmt.Sprintf(" OFFSET %d", *req.Offset)
		}
	}

	selectSQL := fmt.Sprintf("SELECT %s FROM `%s`%s%s%s",
		fields,
		req.TableName,
		whereClause,
		orderByClause,
		limitClause,
	)

	logs.CtxInfof(ctx, "[SelectData] execute sql is %s, value is %v, req is %v", selectSQL, whereValues, req)

	rows, err := m.db.WithContext(ctx).Raw(selectSQL, whereValues...).Rows()
	if err != nil {
		return nil, fmt.Errorf("failed to execute select: %v", err)
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("failed to get columns: %v", err)
	}

	resultSet := &entity2.ResultSet{
		Columns: columns,
		Rows:    make([]map[string]interface{}, 0),
	}

	for rows.Next() {
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		rowData := make(map[string]interface{})
		for i, col := range columns {
			rowData[col] = values[i]
		}
		resultSet.Rows = append(resultSet.Rows, rowData)
	}

	// get total count
	var total int64
	if whereClause != "" {
		countSQL := fmt.Sprintf("SELECT COUNT(*) FROM `%s`%s", req.TableName, whereClause)
		err = m.db.WithContext(ctx).Raw(countSQL, whereValues...).Scan(&total).Error
		if err != nil {
			return nil, fmt.Errorf("failed to get total count: %v", err)
		}
	} else {
		total = int64(len(resultSet.Rows))
	}

	return &rdb.SelectDataResponse{
		ResultSet: resultSet,
		Total:     total,
	}, nil
}

// UpsertData upsert data
func (m *mysqlService) UpsertData(ctx context.Context, req *rdb.UpsertDataRequest) (*rdb.UpsertDataResponse, error) {
	if req == nil || len(req.Data) == 0 {
		return nil, fmt.Errorf("invalid request: empty data")
	}

	keys := req.Keys
	if len(keys) == 0 {
		primaryKeys, err := m.getTablePrimaryKeys(ctx, req.TableName)
		if err != nil {
			return nil, fmt.Errorf("failed to get primary keys: %v", err)
		}

		if len(primaryKeys) == 0 {
			return nil, fmt.Errorf("table %s has no primary key, keys are required for upsert operation", req.TableName)
		}

		keys = primaryKeys
	}

	fields := make([]string, 0)
	for field := range req.Data[0] {
		fields = append(fields, field)
	}

	const batchSize = 1000
	var totalAffected, totalInserted, totalUpdated int64

	for i := 0; i < len(req.Data); i += batchSize {
		end := i + batchSize
		if end > len(req.Data) {
			end = len(req.Data)
		}

		currentBatch := req.Data[i:end]

		placeholderGroups := make([]string, 0, len(currentBatch))
		values := make([]interface{}, 0, len(currentBatch)*len(fields))

		for _, row := range currentBatch {
			placeholders := make([]string, len(fields))
			for j := range placeholders {
				placeholders[j] = "?"
			}
			placeholderGroups = append(placeholderGroups, "("+strings.Join(placeholders, ",")+")")

			for _, field := range fields {
				values = append(values, row[field])
			}
		}

		// ON DUPLICATE KEY UPDATE PART
		updateClauses := make([]string, 0, len(fields))
		for _, field := range fields {
			isKey := false
			for _, key := range keys {
				if field == key {
					isKey = true
					break
				}
			}
			if !isKey {
				updateClauses = append(updateClauses, fmt.Sprintf("`%s`=VALUES(`%s`)", field, field))
			}
		}

		upsertSQL := fmt.Sprintf(
			"INSERT INTO `%s` (`%s`) VALUES %s ON DUPLICATE KEY UPDATE %s",
			req.TableName,
			strings.Join(fields, "`,`"),
			strings.Join(placeholderGroups, ","),
			strings.Join(updateClauses, ","),
		)

		logs.CtxInfof(ctx, "[UpsertData] execute sql is %s, value is %v, batch is %d", upsertSQL, values, i)

		result := m.db.WithContext(ctx).Exec(upsertSQL, values...)
		if result.Error != nil {
			return nil, fmt.Errorf("failed to upsert data: %v", result.Error)
		}

		total, inserted, updated := calculateInsertedUpdated(result.RowsAffected, len(currentBatch))
		totalInserted += inserted
		totalUpdated += updated
		totalAffected += total
	}

	return &rdb.UpsertDataResponse{
		AffectedRows:  totalAffected,
		InsertedRows:  totalInserted,
		UpdatedRows:   totalUpdated,
		UnchangedRows: int64(len(req.Data)) - totalAffected,
	}, nil
}

func (m *mysqlService) getTablePrimaryKeys(ctx context.Context, tableName string) ([]string, error) {
	query := `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND CONSTRAINT_NAME = 'PRIMARY'
        ORDER BY ORDINAL_POSITION
    `

	var primaryKeys []string
	rows, err := m.db.WithContext(ctx).Raw(query, tableName).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var columnName string
		if err := rows.Scan(&columnName); err != nil {
			return nil, err
		}
		primaryKeys = append(primaryKeys, columnName)
	}

	return primaryKeys, nil
}

// calculateInsertedUpdated function remains unchanged
func calculateInsertedUpdated(affectedRows int64, batchSize int) (int64, int64, int64) {
	updated := int64(0)
	inserted := affectedRows
	if affectedRows > int64(batchSize) {
		updated = affectedRows - int64(batchSize)
		inserted = int64(batchSize) - updated
	}

	return inserted + updated, inserted, updated
}

// ExecuteSQL Execute SQL
func (m *mysqlService) ExecuteSQL(ctx context.Context, req *rdb.ExecuteSQLRequest) (*rdb.ExecuteSQLResponse, error) {
	if req == nil {
		return nil, fmt.Errorf("invalid request")
	}

	logs.CtxInfof(ctx, "[ExecuteSQL] req is %v", req)

	var processedSQL string
	var processedParams []interface{}
	var err error

	// Handle SQLType: if raw, do not process params
	if req.SQLType == entity2.SQLType_Raw {
		processedSQL = req.SQL
		processedParams = nil
	} else {
		processedSQL, processedParams, err = m.processSliceParams(req.SQL, req.Params)
		if err != nil {
			return nil, fmt.Errorf("failed to process parameters: %v", err)
		}
	}

	operation, err := sqlparser.NewSQLParser().GetSQLOperation(processedSQL)
	if err != nil {
		return nil, err
	}

	if operation != sqlparsercontract.OperationTypeSelect {
		result := m.db.WithContext(ctx).Exec(processedSQL, processedParams...)
		if result.Error != nil {
			return nil, fmt.Errorf("failed to execute SQL: %v", result.Error)
		}

		resultSet := &entity2.ResultSet{
			Columns:      []string{},
			Rows:         []map[string]interface{}{},
			AffectedRows: result.RowsAffected,
		}

		return &rdb.ExecuteSQLResponse{
			ResultSet: resultSet,
		}, nil
	}

	rows, err := m.db.WithContext(ctx).Raw(processedSQL, processedParams...).Rows()
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %v", err)
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("failed to get columns: %v", err)
	}

	resultSet := &entity2.ResultSet{
		Columns: columns,
		Rows:    make([]map[string]interface{}, 0),
	}

	for rows.Next() {
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		rowData := make(map[string]interface{})
		for i, col := range columns {
			rowData[col] = values[i]
		}
		resultSet.Rows = append(resultSet.Rows, rowData)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error while reading rows: %v", err)
	}

	return &rdb.ExecuteSQLResponse{
		ResultSet: resultSet,
	}, nil
}

func (m *mysqlService) processSliceParams(sql string, params []interface{}) (string, []interface{}, error) {
	if len(params) == 0 {
		return sql, params, nil
	}

	processedParams := make([]interface{}, 0)
	paramIndex := 0
	resultSQL := ""
	lastPos := 0

	// get all ? positions
	for i := 0; i < len(sql); i++ {
		if sql[i] == '?' && paramIndex < len(params) {
			resultSQL += sql[lastPos:i]
			lastPos = i + 1

			param := params[paramIndex]
			paramIndex++

			if m.isSlice(param) {
				sliceValues, err := m.getSliceValues(param)
				if err != nil {
					return "", nil, err
				}

				if len(sliceValues) == 0 {
					resultSQL += "(NULL)"
				} else {
					// (?, ?, ...)
					placeholders := make([]string, len(sliceValues))
					for j := range placeholders {
						placeholders[j] = "?"
					}
					resultSQL += "(" + strings.Join(placeholders, ", ") + ")"

					processedParams = append(processedParams, sliceValues...)
				}
			} else {
				resultSQL += "?"
				processedParams = append(processedParams, param)
			}
		}
	}

	resultSQL += sql[lastPos:]

	return resultSQL, processedParams, nil
}

func (m *mysqlService) isSlice(param interface{}) bool {
	if param == nil {
		return false
	}

	rv := reflect.ValueOf(param)
	return rv.Kind() == reflect.Slice && rv.Type().Elem().Kind() != reflect.Uint8 // exclude []byte
}

func (m *mysqlService) getSliceValues(param interface{}) ([]interface{}, error) {
	rv := reflect.ValueOf(param)
	if rv.Kind() != reflect.Slice {
		return nil, fmt.Errorf("parameter is not a slice")
	}

	length := rv.Len()
	values := make([]interface{}, length)

	for i := 0; i < length; i++ {
		values[i] = rv.Index(i).Interface()
	}

	return values, nil
}

func (m *mysqlService) genTableName(ctx context.Context) (string, error) {
	id, err := m.generator.GenID(ctx)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("table_%d", id), nil
}

func (m *mysqlService) getTableInfo(ctx context.Context, tableName string) (*entity2.Table, error) {
	tableInfoSQL := `
        SELECT 
            TABLE_NAME,
            TABLE_COLLATION,
            AUTO_INCREMENT,
            TABLE_COMMENT
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = ?
    `

	var (
		name          string
		collation     *string
		autoIncrement *int64
		comment       *string
	)

	err := m.db.WithContext(ctx).Raw(tableInfoSQL, tableName).Row().Scan(
		&name,
		&collation,
		&autoIncrement,
		&comment,
	)
	if err != nil {
		return nil, err
	}

	columnsSQL := `
        SELECT 
            COLUMN_NAME,
            DATA_TYPE,
            CHARACTER_MAXIMUM_LENGTH,
            IS_NULLABLE,
            COLUMN_DEFAULT,
            EXTRA,
            COLUMN_COMMENT
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
    `

	type columnInfo struct {
		ColumnName    string  `gorm:"column:COLUMN_NAME"`
		DataType      string  `gorm:"column:DATA_TYPE"`
		CharLength    *int    `gorm:"column:CHARACTER_MAXIMUM_LENGTH"`
		IsNullable    string  `gorm:"column:IS_NULLABLE"`
		DefaultValue  *string `gorm:"column:COLUMN_DEFAULT"`
		Extra         string  `gorm:"column:EXTRA"`
		ColumnComment *string `gorm:"column:COLUMN_COMMENT"`
	}

	var columnsData []columnInfo
	err = m.db.WithContext(ctx).Raw(columnsSQL, tableName).Scan(&columnsData).Error
	if err != nil {
		return nil, err
	}

	columns := make([]*entity2.Column, len(columnsData))
	for i, colData := range columnsData {
		column := &entity2.Column{
			Name:          colData.ColumnName,
			DataType:      entity2.DataType(colData.DataType),
			Length:        colData.CharLength,
			NotNull:       colData.IsNullable == "NO",
			DefaultValue:  colData.DefaultValue,
			AutoIncrement: strings.Contains(colData.Extra, "auto_increment"),
			Comment:       colData.ColumnComment,
		}
		columns[i] = column
	}

	indexesSQL := `
        SELECT 
            INDEX_NAME,
            NON_UNIQUE,
            INDEX_TYPE,
            GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX)
        FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = ?
        GROUP BY INDEX_NAME, NON_UNIQUE, INDEX_TYPE
    `

	type indexInfo struct {
		IndexName string `gorm:"column:INDEX_NAME"`
		NonUnique int    `gorm:"column:NON_UNIQUE"`
		IndexType string `gorm:"column:INDEX_TYPE"`
		Columns   string `gorm:"column:GROUP_CONCAT"`
	}

	var indexesData []indexInfo
	err = m.db.WithContext(ctx).Raw(indexesSQL, tableName).Scan(&indexesData).Error
	if err != nil {
		return nil, err
	}

	indexes := make([]*entity2.Index, 0, len(indexesData))
	for _, idxData := range indexesData {
		index := &entity2.Index{
			Name:    idxData.IndexName,
			Type:    entity2.IndexType(idxData.IndexType),
			Columns: strings.Split(idxData.Columns, ","),
		}
		indexes = append(indexes, index)
	}

	return &entity2.Table{
		Name:    name,
		Columns: columns,
		Indexes: indexes,
		Options: &entity2.TableOption{
			Collate:       collation,
			AutoIncrement: autoIncrement,
			Comment:       comment,
		},
	}, nil
}

func (m *mysqlService) buildWhereClause(condition *rdb.ComplexCondition) (string, []interface{}, error) {
	if condition == nil {
		return "", nil, nil
	}

	if condition.Operator == "" {
		condition.Operator = entity2.AND
	}

	var whereClause strings.Builder
	values := make([]interface{}, 0)

	for i, cond := range condition.Conditions {
		if i > 0 {
			whereClause.WriteString(fmt.Sprintf(" %s ", condition.Operator))
		}

		if cond.Operator == entity2.OperatorIn || cond.Operator == entity2.OperatorNotIn {
			if m.isSlice(cond.Value) {
				sliceValues, err := m.getSliceValues(cond.Value)
				if err != nil {
					return "", nil, fmt.Errorf("failed to process slice values: %v", err)
				}

				if len(sliceValues) == 0 {
					whereClause.WriteString(fmt.Sprintf("`%s` %s (NULL)", cond.Field, string(cond.Operator)))
				} else {
					placeholders := make([]string, len(sliceValues))
					for i := range placeholders {
						placeholders[i] = "?"
					}
					whereClause.WriteString(fmt.Sprintf("`%s` %s (%s)", cond.Field, string(cond.Operator), strings.Join(placeholders, ",")))

					values = append(values, sliceValues...)
				}
			} else {
				return "", nil, fmt.Errorf("IN operator requires a slice of values")
			}
		} else if cond.Operator == entity2.OperatorIsNull || cond.Operator == entity2.OperatorIsNotNull {
			whereClause.WriteString(fmt.Sprintf("`%s` %s", cond.Field, cond.Operator))
		} else {
			whereClause.WriteString(fmt.Sprintf("`%s` %s ?", cond.Field, cond.Operator))
			values = append(values, cond.Value)
		}
	}

	if len(condition.NestedConditions) > 0 {
		whereClause.WriteString(" AND (")
		for i, nested := range condition.NestedConditions {
			if i > 0 {
				whereClause.WriteString(fmt.Sprintf(" %s ", nested.Operator))
			}
			nestedClause, nestedValues, err := m.buildWhereClause(nested)
			if err != nil {
				return "", nil, err
			}
			whereClause.WriteString(nestedClause)
			values = append(values, nestedValues...)
		}
		whereClause.WriteString(")")
	}

	if whereClause.Len() > 0 {
		return " WHERE " + whereClause.String(), values, nil
	}
	return "", values, nil
}
