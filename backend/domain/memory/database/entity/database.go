package entity

import (
	"github.com/xuri/excelize/v2"

	"code.byted.org/flow/opencoze/backend/api/model/common"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/api/model/table"
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

type AgentToDatabase struct {
	AgentID        int64
	DatabaseID     int64
	TableType      table.TableType
	PromptDisabled bool
}

type AgentToDatabaseBasic struct {
	AgentID    int64
	DatabaseID int64
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
