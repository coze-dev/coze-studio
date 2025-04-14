package database

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"
)

//go:generate  mockgen -destination  ./mock/mock.go  --package mock  -source interface.go
type Database interface {
	CreateDatabase(ctx context.Context, req *CreatDatabaseRequest) (*CreatDatabaseResponse, error)
	UpdateDatabase(ctx context.Context, req *UpdateDatabaseRequest) error
	DeleteDatabase(ctx context.Context, req *DeleteDatabaseRequest) error
	MGetDatabase(ctx context.Context, ids []int64) (*MGetDatabaseResponse, error)
	ListDatabase(ctx context.Context, req *ListDatabaseRequest) (*ListDatabaseResponse, error)

	AddDatabaseRecord(ctx context.Context, req *AddDatabaseRecordRequest) error
	UpdateDatabaseRecord(ctx context.Context, req *UpdateDatabaseRecordRequest) error
	DeleteDatabaseRecord(ctx context.Context, req *DeleteDatabaseRecordRequest) error
	ListDatabaseRecord(ctx context.Context, req *ListDatabaseRecordRequest) (*ListDatabaseRecordResponse, error)

	ExecuteSQL(ctx context.Context, req *ExecuteSQLRequest) (*ExecuteSQLResponse, error)
}

type CreatDatabaseRequest struct {
	Database *entity.Database
}

type CreatDatabaseResponse struct {
	Database *entity.Database
}

type UpdateDatabaseRequest struct {
	Database *entity.Database
}

type DeleteDatabaseRequest struct {
	Database *entity.Database
}

type MGetDatabaseResponse struct {
	Database []*entity.Database
}

type ListDatabaseRequest struct {
	CreatorID   *int64
	SpaceID     *int64
	ConnectorID *int64
	TableName   *string
	TableType   entity.TableType

	Limit  int
	Cursor *string
}

type ListDatabaseResponse struct {
	Databases []*entity.Database

	HasMore    bool
	NextCursor *string
}

type AddDatabaseRecordRequest struct {
	DatabaseID  int64
	TableType   entity.TableType
	ConnectorID *int64
	Records     []map[string]string
}

type UpdateDatabaseRecordRequest struct {
	DatabaseID  int64
	TableType   entity.TableType
	ConnectorID *int64
	Records     []map[string]string
}

type DeleteDatabaseRecordRequest struct {
	DatabaseID  int64
	TableType   entity.TableType
	ConnectorID *int64
	Records     []map[string]string
}

type ListDatabaseRecordRequest struct {
	DatabaseID  int64
	ConnectorID *int64
	TableType   entity.TableType

	Limit  int
	Cursor *string
}

type ListDatabaseRecordResponse struct {
	Records   []map[string]string
	FieldList []*entity.FieldItem

	HasMore    bool
	NextCursor *string
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
	Conditions       []*Condition
	NestedConditions *ComplexCondition
	Logic            entity.Logic
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
