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

package model

type OperateType int64

const (
	OperateType_Custom OperateType = 0
	OperateType_Insert OperateType = 1
	OperateType_Update OperateType = 2
	OperateType_Delete OperateType = 3
	OperateType_Select OperateType = 4
)

type Operation int64

const (
	Operation_EQUAL         Operation = 1
	Operation_NOT_EQUAL     Operation = 2
	Operation_GREATER_THAN  Operation = 3
	Operation_LESS_THAN     Operation = 4
	Operation_GREATER_EQUAL Operation = 5
	Operation_LESS_EQUAL    Operation = 6
	Operation_IN            Operation = 7
	Operation_NOT_IN        Operation = 8
	Operation_IS_NULL       Operation = 9
	Operation_IS_NOT_NULL   Operation = 10
	Operation_LIKE          Operation = 11
	Operation_NOT_LIKE      Operation = 12
)

type Logic int64

const (
	Logic_And Logic = 1
	Logic_Or  Logic = 2
)

// SQLType indicates the type of SQL, e.g., parameterized (with '?') or raw SQL.
type SQLType int32

const (
	SQLType_Parameterized SQLType = 0
	SQLType_Raw           SQLType = 1 // Complete/raw SQL
)

type DocumentSourceType int64

const (
	DocumentSourceType_Document DocumentSourceType = 0
)

type TableReadDataMethod int

var (
	TableReadDataMethodOnlyHeader TableReadDataMethod = 1
	TableReadDataMethodPreview    TableReadDataMethod = 2
	TableReadDataMethodAll        TableReadDataMethod = 3
	TableReadDataMethodHead       TableReadDataMethod = 4
)

type ColumnTypeCategory int64

const (
	ColumnTypeCategoryText   ColumnTypeCategory = 0
	ColumnTypeCategoryNumber ColumnTypeCategory = 1
)

const (
	DefaultCreateTimeColName = "bstudio_create_time"
	DefaultCidColName        = "bstudio_connector_id"
	DefaultUidColName        = "bstudio_connector_uid"
	DefaultIDColName         = "bstudio_id"

	DefaultCreateTimeDisplayColName = "bstudio_create_time"
	DefaultUidDisplayColName        = "uuid"
	DefaultIDDisplayColName         = "id"
)
