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

	"github.com/coze-dev/coze-studio/backend/infra/contract/rdb/entity"
)

//go:generate mockgen -destination  ../../../internal/mock/infra/contract/rdb/rdb_mock.go  --package rdb  -source rdb.go
type RDB interface {
	CreateTable(ctx context.Context, req *CreateTableRequest) (*CreateTableResponse, error)
	AlterTable(ctx context.Context, req *AlterTableRequest) (*AlterTableResponse, error)
	DropTable(ctx context.Context, req *DropTableRequest) (*DropTableResponse, error)
	GetTable(ctx context.Context, req *GetTableRequest) (*GetTableResponse, error)

	InsertData(ctx context.Context, req *InsertDataRequest) (*InsertDataResponse, error)
	UpdateData(ctx context.Context, req *UpdateDataRequest) (*UpdateDataResponse, error)
	DeleteData(ctx context.Context, req *DeleteDataRequest) (*DeleteDataResponse, error)
	SelectData(ctx context.Context, req *SelectDataRequest) (*SelectDataResponse, error)
	UpsertData(ctx context.Context, req *UpsertDataRequest) (*UpsertDataResponse, error)

	ExecuteSQL(ctx context.Context, req *ExecuteSQLRequest) (*ExecuteSQLResponse, error)
}

// CreateTableRequest 创建表请求
type CreateTableRequest struct {
	Table *entity.Table
}

// CreateTableResponse 创建表响应
type CreateTableResponse struct {
	Table *entity.Table
}

// AlterTableOperation 修改表操作
type AlterTableOperation struct {
	Action       entity.AlterTableAction
	Column       *entity.Column
	OldName      *string
	Index        *entity.Index
	IndexName    *string
	NewTableName *string
}

// AlterTableRequest 修改表请求
type AlterTableRequest struct {
	TableName  string
	Operations []*AlterTableOperation
}

// AlterTableResponse 修改表响应
type AlterTableResponse struct {
	Table *entity.Table
}

// DropTableRequest 删除表请求
type DropTableRequest struct {
	TableName string
	IfExists  bool
}

// DropTableResponse 删除表响应
type DropTableResponse struct {
	Success bool
}

// GetTableRequest 获取表信息请求
type GetTableRequest struct {
	TableName string
}

// GetTableResponse 获取表信息响应
type GetTableResponse struct {
	Table *entity.Table
}

// InsertDataRequest 插入数据请求
type InsertDataRequest struct {
	TableName string
	Data      []map[string]interface{}
}

// InsertDataResponse 插入数据响应
type InsertDataResponse struct {
	AffectedRows int64
}

// Condition 定义查询条件
type Condition struct {
	Field    string
	Operator entity.Operator
	Value    interface{}
}

// ComplexCondition 复杂条件
type ComplexCondition struct {
	Conditions       []*Condition
	NestedConditions []*ComplexCondition // 与 Conditions互斥 example: WHERE (age >= 18 AND status = 'active') OR (age >= 21 AND status = 'pending')
	Operator         entity.LogicalOperator
}

// UpdateDataRequest 更新数据请求
type UpdateDataRequest struct {
	TableName string
	Data      map[string]interface{}
	Where     *ComplexCondition
	Limit     *int
}

// UpdateDataResponse 更新数据响应
type UpdateDataResponse struct {
	AffectedRows int64
}

// DeleteDataRequest 删除数据请求
type DeleteDataRequest struct {
	TableName string
	Where     *ComplexCondition
	Limit     *int
}

// DeleteDataResponse 删除数据响应
type DeleteDataResponse struct {
	AffectedRows int64
}

type OrderBy struct {
	Field     string               // 排序字段
	Direction entity.SortDirection // 排序方向
}

// SelectDataRequest 查询数据请求
type SelectDataRequest struct {
	TableName string
	Fields    []string // 要查询的字段，如果为空则查询所有字段
	Where     *ComplexCondition
	OrderBy   []*OrderBy // 排序条件
	Limit     *int       // 限制返回行数
	Offset    *int       // 偏移量
}

// SelectDataResponse 查询数据响应
type SelectDataResponse struct {
	ResultSet *entity.ResultSet
	Total     int64 // 符合条件的总记录数（不考虑分页）
}

type UpsertDataRequest struct {
	TableName string
	Data      []map[string]interface{} // 要更新或插入的数据
	Keys      []string                 // 用于标识唯一记录的列名，为空的话默认使用主键
}

type UpsertDataResponse struct {
	AffectedRows  int64 // 受影响的行数
	InsertedRows  int64 // 新插入的行数
	UpdatedRows   int64 // 更新的行数
	UnchangedRows int64 // 不变的行数（没有插入或更新的行数）
}

// ExecuteSQLRequest 执行SQL请求
type ExecuteSQLRequest struct {
	SQL    string
	Params []interface{} // 用于参数化查询

	// SQLType indicates the type of SQL: parameterized or raw SQL. It takes effect if OperateType is 0.
	SQLType entity.SQLType
}

// ExecuteSQLResponse 执行SQL响应
type ExecuteSQLResponse struct {
	ResultSet *entity.ResultSet
}
