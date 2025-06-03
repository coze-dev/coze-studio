package database

import (
	"context"
)

type CustomSQLRequest struct {
	DatabaseInfoID int64
	SQL            string
	Params         []string
	IsDebugRun     bool
}

type Object = map[string]any

type Response struct {
	RowNumber *int64
	Objects   []Object
}

type Operator string
type ClauseRelation string

const (
	ClauseRelationAND ClauseRelation = "and"
	ClauseRelationOR  ClauseRelation = "or"
)

const (
	OperatorEqual          Operator = "="
	OperatorNotEqual       Operator = "!="
	OperatorGreater        Operator = ">"
	OperatorLesser         Operator = "<"
	OperatorGreaterOrEqual Operator = ">="
	OperatorLesserOrEqual  Operator = "<="
	OperatorIn             Operator = "in"
	OperatorNotIn          Operator = "not_in"
	OperatorIsNull         Operator = "is_null"
	OperatorIsNotNull      Operator = "is_not_null"
	OperatorLike           Operator = "like"
	OperatorNotLike        Operator = "not_like"
)

type ClauseGroup struct {
	Single *Clause
	Multi  *MultiClause
}
type Clause struct {
	Left     string
	Operator Operator
}
type MultiClause struct {
	Clauses  []*Clause
	Relation ClauseRelation
}

type Condition struct {
	Left     string
	Operator Operator
	Right    any
}

type ConditionGroup struct {
	Conditions []*Condition
	Relation   ClauseRelation
}

type DeleteRequest struct {
	DatabaseInfoID int64
	ConditionGroup *ConditionGroup
	IsDebugRun     bool
}

type QueryRequest struct {
	DatabaseInfoID int64
	SelectFields   []string
	Limit          int64
	ConditionGroup *ConditionGroup
	OrderClauses   []*OrderClause
	IsDebugRun     bool
}

type OrderClause struct {
	FieldID string
	IsAsc   bool
}
type UpdateRequest struct {
	DatabaseInfoID int64
	ConditionGroup *ConditionGroup
	Fields         map[string]any
	IsDebugRun     bool
}

type InsertRequest struct {
	DatabaseInfoID int64
	Fields         map[string]any
	IsDebugRun     bool
}

func GetDatabaseOperator() DatabaseOperator {
	return databaseOperatorImpl
}
func SetDatabaseOperator(d DatabaseOperator) {
	databaseOperatorImpl = d
}

var (
	databaseOperatorImpl DatabaseOperator
)

//go:generate  mockgen -destination databasemock/database_mock.go --package databasemock -source database.go
type DatabaseOperator interface {
	Execute(ctx context.Context, request *CustomSQLRequest) (*Response, error)
	Query(ctx context.Context, request *QueryRequest) (*Response, error)
	Update(context.Context, *UpdateRequest) (*Response, error)
	Insert(ctx context.Context, request *InsertRequest) (*Response, error)
	Delete(context.Context, *DeleteRequest) (*Response, error)
}
