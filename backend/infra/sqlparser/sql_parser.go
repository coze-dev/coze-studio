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

package sqlparser

// TableColumn represents table and column name mapping
type TableColumn struct {
	NewTableName *string           // if nil, not replace table name
	ColumnMap    map[string]string // Column name mapping: key is original column name, value is new column name
}

type ColumnValue struct {
	ColName string
	Value   interface{}
}

type PrimaryKeyValue struct {
	ColName string
	Values  []interface{}
}

// OperationType represents the type of SQL operation
type OperationType string

// SQL operation types
const (
	OperationTypeSelect   OperationType = "SELECT"
	OperationTypeInsert   OperationType = "INSERT"
	OperationTypeUpdate   OperationType = "UPDATE"
	OperationTypeDelete   OperationType = "DELETE"
	OperationTypeCreate   OperationType = "CREATE"
	OperationTypeAlter    OperationType = "ALTER"
	OperationTypeDrop     OperationType = "DROP"
	OperationTypeTruncate OperationType = "TRUNCATE"
	OperationTypeUnknown  OperationType = "UNKNOWN"
)

type SQLFilterOp string

const (
	SQLFilterOpAnd SQLFilterOp = "AND"
	SQLFilterOpOr  SQLFilterOp = "OR"
)

// SQLParser defines the interface for parsing and modifying SQL statements
type SQLParser interface {
	// ParseAndModifySQL parses SQL and replaces table/column names according to the provided message
	ParseAndModifySQL(sql string, tableColumns map[string]TableColumn) (string, error) // tableColumns Original table name -> new TableInfo

	// GetSQLOperation identifies the operation type in the SQL statement
	GetSQLOperation(sql string) (OperationType, error)

	// AddColumnsToInsertSQL adds columns to the INSERT SQL statement.
	AddColumnsToInsertSQL(origSQL string, addCols []ColumnValue, colVals *PrimaryKeyValue, isParam bool) (string, map[string]bool, error)

	// GetTableName extracts the table name from a SQL statement. Only supports single-table select/insert/update/delete. If it has multiple tables, return first table name.
	GetTableName(sql string) (string, error)

	// GetInsertDataNums extracts the number of rows to be inserted from a SQL statement. Only supports single-table insert.
	GetInsertDataNums(sql string) (int, error)

	// AppendSQLFilter appends a filter condition to the SQL statement.
	AppendSQLFilter(sql string, op SQLFilterOp, filter string) (string, error)

	// AddSelectFieldsToSelectSQL add select fields to select sql
	AddSelectFieldsToSelectSQL(origSQL string, cols []string) (string, error)
}
