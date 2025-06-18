package database

import (
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/api/model/table"
)

type ExecuteSQLRequest struct {
	SQL     *string // set if OperateType is 0.
	SQLType SQLType // SQLType indicates the type of SQL: parameterized or raw SQL. It takes effect if OperateType is 0.

	DatabaseID  int64
	UserID      string
	SpaceID     int64
	ConnectorID *int64
	SQLParams   []*SQLParamVal
	TableType   table.TableType
	OperateType OperateType

	// set the following values if OperateType is not 0.
	SelectFieldList *SelectFieldList
	OrderByList     []OrderBy
	Limit           *int64
	Offset          *int64
	Condition       *ComplexCondition
	UpsertRows      []*UpsertRow
}

type ExecuteSQLResponse struct {
	Records      []map[string]string
	FieldList    []*FieldItem
	RowsAffected *int64
}

type PublishDatabaseRequest struct {
	AgentID int64
}

type PublishDatabaseResponse struct {
	OnlineDatabases []*bot_common.Database
}

type SQLParamVal struct {
	ValueType table.FieldItemType
	ISNull    bool
	Value     *string
	Name      *string
}

type OrderBy struct {
	Field     string
	Direction table.SortDirection
}

type UpsertRow struct {
	Records []*Record
}

type Record struct {
	FieldId    string
	FieldValue string
}

type SelectFieldList struct {
	FieldID    []string
	IsDistinct bool
}

type ComplexCondition struct {
	Conditions []*Condition
	// NestedConditions *ComplexCondition
	Logic Logic
}

type Condition struct {
	Left      string
	Operation Operation
	Right     string
}

type FieldItem struct {
	Name          string
	Desc          string
	Type          table.FieldItemType
	MustRequired  bool
	AlterID       int64
	IsSystemField bool
	PhysicalName  string
	// ID            int64
}

type Database struct {
	ID      int64
	IconURI string

	CreatorID int64
	SpaceID   int64

	CreatedAtMs int64
	UpdatedAtMs int64
	DeletedAtMs int64

	AppID           int64
	IconURL         string
	TableName       string
	TableDesc       string
	Status          table.BotTableStatus
	FieldList       []*FieldItem
	ActualTableName string
	RwMode          table.BotTableRWMode
	PromptDisabled  bool
	IsVisible       bool
	DraftID         *int64
	OnlineID        *int64
	ExtraInfo       map[string]string
	IsAddedToAgent  *bool
	TableType       *table.TableType
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

type DatabaseBasic struct {
	ID            int64
	TableType     table.TableType
	NeedSysFields bool
}

type DeleteDatabaseRequest struct {
	ID int64
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

type BindDatabaseToAgentRequest struct {
	DraftDatabaseID int64
	AgentID         int64
}

type UnBindDatabaseToAgentRequest struct {
	DraftDatabaseID int64
	AgentID         int64
}

type MGetDatabaseRequest struct {
	Basics []*DatabaseBasic
}
type MGetDatabaseResponse struct {
	Databases []*Database
}

type GetAllDatabaseByAppIDRequest struct {
	AppID int64
}

type GetAllDatabaseByAppIDResponse struct {
	Databases []*Database // online databases
}
