package database

import (
	"context"
)

type CustomSQLRequest struct {
	DatabaseInfoID int64
	SQL            string
	Params         []string
}

type Object = map[string]any

type Response struct {
	RowNumber *int64
	Objects   []Object
}

type DatasetOperator string
type ClauseRelation string

const (
	ClauseRelationAND ClauseRelation = "and"
	ClauseRelationOR  ClauseRelation = "or"
)

const (
	OperatorEqual          DatasetOperator = "="
	OperatorNotEqual       DatasetOperator = "!="
	OperatorGreater        DatasetOperator = ">"
	OperatorLesser         DatasetOperator = "<"
	OperatorGreaterOrEqual DatasetOperator = ">="
	OperatorLesserOrEqual  DatasetOperator = "<="
	OperatorIn             DatasetOperator = "in"
	OperatorNotIn          DatasetOperator = "not_in"
	OperatorIsNull         DatasetOperator = "is_null"
	OperatorIsNotNull      DatasetOperator = "is_not_null"
	OperatorLike           DatasetOperator = "like"
	OperatorNotLike        DatasetOperator = "not_like"
)

type ClauseGroup struct {
	Single *Clause
	Multi  *MultiClause
}
type Clause struct {
	Left     string
	Operator DatasetOperator
}
type MultiClause struct {
	Clauses  []*Clause
	Relation ClauseRelation
}

type Condition struct {
	Left     string
	Operator DatasetOperator
	Right    any
}

type ConditionGroup struct {
	Conditions []*Condition
	Relation   ClauseRelation
}

type DeleteRequest struct {
	DatabaseInfoID int64
	ConditionGroup *ConditionGroup
}

type QueryRequest struct {
	DatabaseInfoID int64
	SelectFields   []string
	Limit          int64
	ConditionGroup *ConditionGroup
	OrderClauses   []*OrderClause
}

type OrderClause struct {
	FieldID string
	IsAsc   bool
}
type UpdateRequest struct {
	DatabaseInfoID int64
	ConditionGroup *ConditionGroup
	Fields         map[string]any
}

type InsertRequest struct {
	DatabaseInfoID int64
	Fields         map[string]any
}

var (
	CustomSQLExecutorImpl CustomSQLExecutor
	QueryerImpl           Queryer
	UpdaterImpl           Updater
	InserterImpl          Inserter
	DeleterImpl           Deleter
)

type CustomSQLExecutor interface {
	Execute(ctx context.Context, request *CustomSQLRequest) (*Response, error)
}

type Queryer interface {
	Query(ctx context.Context, request *QueryRequest) (*Response, error)
}

type Updater interface {
	Update(context.Context, *UpdateRequest) (*Response, error)
}

type Inserter interface {
	Insert(ctx context.Context, request *InsertRequest) (*Response, error)
}

type Deleter interface {
	Delete(context.Context, *DeleteRequest) (*Response, error)
}
