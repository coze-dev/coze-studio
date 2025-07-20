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

package entity

import (
	"github.com/xuri/excelize/v2"

	"github.com/coze-dev/coze-studio/backend/api/model/common"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/database"
)

type Database = database.Database

// DatabaseFilter 数据库过滤条件
type DatabaseFilter struct {
	CreatorID *int64
	SpaceID   *int64
	TableName *string
	AppID     *int64
}

// Pagination pagination
type Pagination struct {
	Total int64

	Limit  int
	Offset int
}

type TableSheet struct {
	SheetID       int64
	HeaderLineIdx int64
	StartLineIdx  int64
}

type TableReaderMeta struct {
	TosMaxLine    int64
	SheetId       int64
	HeaderLineIdx int64
	StartLineIdx  int64
	ReaderMethod  database.TableReadDataMethod
	ReadLineCnt   int64
	Schema        []*common.DocTableColumn
}

type TableReaderSheetData struct {
	Columns    []*common.DocTableColumn
	SampleData [][]string
}

type ExcelExtraInfo struct {
	Sheets        []*common.DocTableSheet
	ExtensionName string // 扩展名
	FileSize      int64  // 文件大小
	SourceFileID  int64
	TosURI        string
}

type LocalTableMeta struct {
	ExcelFile      *excelize.File // xlsx格式文件
	RawLines       [][]string     // csv|xls 的全部内容
	SheetsNameList []string
	SheetsRowCount []int
	ExtensionName  string // 扩展名
	FileSize       int64  // 文件大小
}

type ColumnInfo struct {
	ColumnType         common.ColumnType
	ContainsEmptyValue bool
}

type SelectFieldList struct {
	FieldID    []string
	IsDistinct bool
}
