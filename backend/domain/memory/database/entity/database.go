package entity

import (
	"github.com/xuri/excelize/v2"

	"code.byted.org/flow/opencoze/backend/api/model/common"
)

type FieldItem struct {
	Name          string
	Desc          string
	Type          FieldItemType
	MustRequired  bool
	AlterID       int64
	IsSystemField bool
	PhysicalName  string
	//ID            int64
}

type Database struct {
	ID          int64
	Name        string
	Description string
	IconURI     string

	CreatorID int64
	SpaceID   int64

	CreatedAtMs int64
	UpdatedAtMs int64
	DeletedAtMs int64

	ProjectID       int64
	IconURL         string
	TableName       string
	TableDesc       string
	Status          TableStatus
	FieldList       []*FieldItem
	ActualTableName string
	RwMode          DatabaseRWMode
	PromptDisabled  bool
	IsVisible       bool
	DraftID         *int64
	OnlineID        *int64
	ExtraInfo       map[string]string
	IsAddedToAgent  *bool
	TableType       *TableType
}

func (d *Database) GetDraftID() int64 {
	if d.DraftID == nil {
		return 0
	}

	return *d.DraftID
}

func (d *Database) GetOnlineID() int64 {
	if d.OnlineID == nil {
		return 0
	}

	return *d.OnlineID
}

type SQLParamVal struct {
	ValueType FieldItemType
	ISNull    bool
	Value     *string
	Name      *string
}

// DatabaseFilter 数据库过滤条件
type DatabaseFilter struct {
	CreatorID *int64
	SpaceID   *int64
	TableName *string
}

// Pagination pagination
type Pagination struct {
	Total int64

	Limit  int
	Offset int
}

type DatabaseBasic struct {
	ID            int64
	TableType     TableType
	NeedSysFields bool
}

type AgentToDatabase struct {
	AgentID        int64
	DatabaseID     int64
	TableType      TableType
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
	ReaderMethod  TableReadDataMethod
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

type OrderBy struct {
	Field     string
	Direction SortDirection
}

type ComplexCondition struct {
	Conditions []*Condition
	//NestedConditions *ComplexCondition
	Logic Logic
}

type Condition struct {
	Left      string
	Operation Operation
	Right     string
}

type UpsertRow struct {
	Records []*Record
}

type Record struct {
	FieldId    string
	FieldValue string
}
