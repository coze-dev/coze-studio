package database

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/table"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"
)

//go:generate mockgen -destination  ../../../internal/mock/domain/memory/database/database_mock.go  --package database  -source interface.go
type Database interface {
	CreateDatabase(ctx context.Context, req *CreateDatabaseRequest) (*CreateDatabaseResponse, error)
	UpdateDatabase(ctx context.Context, req *UpdateDatabaseRequest) (*UpdateDatabaseResponse, error)
	DeleteDatabase(ctx context.Context, req *DeleteDatabaseRequest) error
	MGetDatabase(ctx context.Context, req *MGetDatabaseRequest) (*MGetDatabaseResponse, error)
	ListDatabase(ctx context.Context, req *ListDatabaseRequest) (*ListDatabaseResponse, error)

	GetDatabaseTemplate(ctx context.Context, req *GetDatabaseTemplateRequest) (*GetDatabaseTemplateResponse, error)

	AddDatabaseRecord(ctx context.Context, req *AddDatabaseRecordRequest) error
	UpdateDatabaseRecord(ctx context.Context, req *UpdateDatabaseRecordRequest) error
	DeleteDatabaseRecord(ctx context.Context, req *DeleteDatabaseRecordRequest) error
	ListDatabaseRecord(ctx context.Context, req *ListDatabaseRecordRequest) (*ListDatabaseRecordResponse, error)

	ExecuteSQL(ctx context.Context, req *ExecuteSQLRequest) (*ExecuteSQLResponse, error)

	BindDatabase(ctx context.Context, req *BindDatabaseToAgentRequest) error
	UnBindDatabase(ctx context.Context, req *UnBindDatabaseToAgentRequest) error
	MGetDatabaseByAgentID(ctx context.Context, req *MGetDatabaseByAgentIDRequest) (*MGetDatabaseByAgentIDResponse, error)
}

type CreateDatabaseRequest struct {
	Database *entity.Database
}

type CreateDatabaseResponse struct {
	Database *entity.Database
}

type UpdateDatabaseRequest struct {
	Database *entity.Database
}

type UpdateDatabaseResponse struct {
	Database *entity.Database
}
type DeleteDatabaseRequest struct {
	Database *entity.Database
}

type MGetDatabaseRequest struct {
	Basics []*entity.DatabaseBasic
}
type MGetDatabaseResponse struct {
	Databases []*entity.Database
}
type GetDatabaseTemplateRequest struct {
	UserID     int64
	TableName  string
	FieldItems []*table.FieldItem
}

type GetDatabaseTemplateResponse struct {
	Url string
}
type ListDatabaseRequest struct {
	CreatorID   *int64
	SpaceID     *int64
	ConnectorID *int64
	TableName   *string
	TableType   entity.TableType
	OrderBy     []*OrderBy

	Limit  int
	Offset int
}

type ListDatabaseResponse struct {
	Databases []*entity.Database

	HasMore    bool
	TotalCount int64
}

type AddDatabaseRecordRequest struct {
	DatabaseID  int64
	TableType   entity.TableType
	ConnectorID *int64
	UserID      int64
	Records     []map[string]string
}

type UpdateDatabaseRecordRequest struct {
	DatabaseID  int64
	TableType   entity.TableType
	ConnectorID *int64
	UserID      int64
	Records     []map[string]string
}

type DeleteDatabaseRecordRequest struct {
	DatabaseID  int64
	TableType   entity.TableType
	ConnectorID *int64
	UserID      int64
	Records     []map[string]string
}

type ListDatabaseRecordRequest struct {
	DatabaseID  int64
	ConnectorID *int64
	TableType   entity.TableType
	UserID      int64

	Limit  int
	Offset int
}

type ListDatabaseRecordResponse struct {
	Records   []map[string]string
	FieldList []*entity.FieldItem

	HasMore    bool
	TotalCount int64
}

type SelectFieldList struct {
	FieldID    []string
	IsDistinct bool
}

type OrderBy struct {
	Field     string
	Direction entity.SortDirection
}

type ComplexCondition struct {
	Conditions []*Condition
	//NestedConditions *ComplexCondition
	Logic entity.Logic
}

type Condition struct {
	Left      string
	Operation entity.Operation
	Right     string
}

type UpsertRow struct {
	Records []*Record
}

type Record struct {
	FieldId    string
	FieldValue string
}

type ExecuteSQLRequest struct {
	SQL         *string // set if OperateType is 0.
	DatabaseID  int64
	User        *userEntity.UserIdentity
	ConnectorID *int64
	SQLParams   []*entity.SQLParamVal
	TableType   entity.TableType
	OperateType entity.OperateType

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
	FieldList    []*entity.FieldItem
	RowsAffected *int64
}

type BindDatabaseToAgentRequest struct {
	Relations []*entity.AgentToDatabase
}

type UnBindDatabaseToAgentRequest struct {
	BasicRelations []*entity.AgentToDatabaseBasic
}

type MGetDatabaseByAgentIDRequest struct {
	AgentID       int64
	TableType     entity.TableType
	NeedSysFields bool
}

type MGetDatabaseByAgentIDResponse struct {
	Databases []*entity.Database
}
