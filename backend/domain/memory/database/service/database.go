package service

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/common"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/database"

	"code.byted.org/flow/opencoze/backend/api/model/table"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
)

//go:generate mockgen -destination  ../../../../internal/mock/domain/memory/database/database_mock.go  --package database  -source database.go
type Database interface {
	CreateDatabase(ctx context.Context, req *CreateDatabaseRequest) (*CreateDatabaseResponse, error)
	UpdateDatabase(ctx context.Context, req *UpdateDatabaseRequest) (*UpdateDatabaseResponse, error)
	DeleteDatabase(ctx context.Context, req *DeleteDatabaseRequest) error
	MGetDatabase(ctx context.Context, req *MGetDatabaseRequest) (*MGetDatabaseResponse, error)
	ListDatabase(ctx context.Context, req *ListDatabaseRequest) (*ListDatabaseResponse, error)
	GetDraftDatabaseByOnlineID(ctx context.Context, req *GetDraftDatabaseByOnlineIDRequest) (*GetDraftDatabaseByOnlineIDResponse, error)

	GetDatabaseTemplate(ctx context.Context, req *GetDatabaseTemplateRequest) (*GetDatabaseTemplateResponse, error)
	GetDatabaseTableSchema(ctx context.Context, req *GetDatabaseTableSchemaRequest) (*GetDatabaseTableSchemaResponse, error)
	ValidateDatabaseTableSchema(ctx context.Context, req *ValidateDatabaseTableSchemaRequest) (*ValidateDatabaseTableSchemaResponse, error)
	SubmitDatabaseInsertTask(ctx context.Context, req *SubmitDatabaseInsertTaskRequest) error
	GetDatabaseFileProgressData(ctx context.Context, req *GetDatabaseFileProgressDataRequest) (*GetDatabaseFileProgressDataResponse, error)

	AddDatabaseRecord(ctx context.Context, req *AddDatabaseRecordRequest) error
	UpdateDatabaseRecord(ctx context.Context, req *UpdateDatabaseRecordRequest) error
	DeleteDatabaseRecord(ctx context.Context, req *DeleteDatabaseRecordRequest) error
	ListDatabaseRecord(ctx context.Context, req *ListDatabaseRecordRequest) (*ListDatabaseRecordResponse, error)

	ExecuteSQL(ctx context.Context, req *ExecuteSQLRequest) (*ExecuteSQLResponse, error)

	BindDatabase(ctx context.Context, req *BindDatabaseToAgentRequest) error
	UnBindDatabase(ctx context.Context, req *UnBindDatabaseToAgentRequest) error
	MGetDatabaseByAgentID(ctx context.Context, req *MGetDatabaseByAgentIDRequest) (*MGetDatabaseByAgentIDResponse, error)
	MGetRelationsByAgentID(ctx context.Context, req *MGetRelationsByAgentIDRequest) (*MGetRelationsByAgentIDResponse, error)

	PublishDatabase(ctx context.Context, req *PublishDatabaseRequest) (*PublishDatabaseResponse, error)
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
	Basics []*database.DatabaseBasic
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
	AppID       *int64
	TableType   table.TableType
	OrderBy     []*database.OrderBy

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
	TableType   table.TableType
	ConnectorID *int64
	UserID      int64
	Records     []map[string]string
}

type UpdateDatabaseRecordRequest struct {
	DatabaseID  int64
	TableType   table.TableType
	ConnectorID *int64
	UserID      int64
	Records     []map[string]string
}

type DeleteDatabaseRecordRequest struct {
	DatabaseID  int64
	TableType   table.TableType
	ConnectorID *int64
	UserID      int64
	Records     []map[string]string
}

type ListDatabaseRecordRequest struct {
	DatabaseID  int64
	ConnectorID *int64
	TableType   table.TableType
	UserID      int64

	Limit  int
	Offset int
}

type ListDatabaseRecordResponse struct {
	Records   []map[string]string
	FieldList []*database.FieldItem

	HasMore    bool
	TotalCount int64
}

type ExecuteSQLRequest = database.ExecuteSQLRequest

type ExecuteSQLResponse = database.ExecuteSQLResponse

type BindDatabaseToAgentRequest struct {
	Relations []*entity.AgentToDatabase
}

type UnBindDatabaseToAgentRequest struct {
	BasicRelations []*entity.AgentToDatabaseBasic
}

type MGetDatabaseByAgentIDRequest struct {
	AgentID       int64
	TableType     table.TableType
	NeedSysFields bool
}

type MGetDatabaseByAgentIDResponse struct {
	Databases []*entity.Database
}

type PublishDatabaseRequest = database.PublishDatabaseRequest

type PublishDatabaseResponse = database.PublishDatabaseResponse

type UpdateAgentToDatabaseRequest struct {
	Relation *entity.AgentToDatabase
}

type MGetRelationsByAgentIDRequest struct {
	AgentID       int64
	TableType     table.TableType
	NeedSysFields bool
}

type MGetRelationsByAgentIDResponse struct {
	Relations []*entity.AgentToDatabase
}
type GetDatabaseTableSchemaRequest struct {
	TableSheet    entity.TableSheet
	TableDataType table.TableDataType
	DatabaseID    int64
	TosURL        string
	UserID        int64
}

type GetDatabaseTableSchemaResponse struct {
	SheetList   []*common.DocTableSheet
	TableMeta   []*common.DocTableColumn
	PreviewData []map[int64]string
}

type ValidateDatabaseTableSchemaRequest struct {
	TableSheet    entity.TableSheet
	TableDataType table.TableDataType
	DatabaseID    int64
	TosURL        string
	UserID        int64
	Fields        []*database.FieldItem
}

type ValidateDatabaseTableSchemaResponse struct {
	Valid      bool
	InvalidMsg *string // if valid is false, it will be set
}

func (r *ValidateDatabaseTableSchemaResponse) GetInvalidMsg() string {
	if r.Valid || r.InvalidMsg == nil {
		return ""
	}

	return *r.InvalidMsg
}

type SubmitDatabaseInsertTaskRequest struct {
	DatabaseID  int64
	FileURI     string
	TableType   table.TableType
	TableSheet  entity.TableSheet
	ConnectorID *int64
	UserID      int64
}

type GetDatabaseFileProgressDataRequest struct {
	DatabaseID int64
	TableType  table.TableType
	UserID     int64
}

type GetDatabaseFileProgressDataResponse struct {
	FileName       string
	Progress       int32
	StatusDescript *string
}

type GetDraftDatabaseByOnlineIDRequest struct {
	OnlineID int64
}

type GetDraftDatabaseByOnlineIDResponse struct {
	Database *entity.Database
}
