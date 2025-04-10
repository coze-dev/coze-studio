package database

import (
	"context"
)

type Queryer interface {
	Query(ctx context.Context, request *QueryRequest) (*Response, error)
}

type QueryConfig struct {
	DatabaseInfoID string
	QueryFields    []string
	OrderClauses   []*OrderClause
	OutputConfig   OutputConfig
	ClauseGroup    *ClauseGroup
	Queryer        Queryer
}

type OrderClause struct {
	FieldID string
	IsAsc   bool
}

type QueryRequest struct {
	DatabaseInfoID string
	SelectFields   []string
	ConditionGroup *ConditionGroup
	OrderClauses   []*OrderClause
}

type Query struct {
	config *QueryConfig
}

func (ds *Query) Query(ctx context.Context, conditionGroup *ConditionGroup) (map[string]any, error) {
	req := &QueryRequest{
		DatabaseInfoID: ds.config.DatabaseInfoID,
		OrderClauses:   ds.config.OrderClauses,
		SelectFields:   ds.config.QueryFields,
	}

	req.ConditionGroup = conditionGroup

	response, err := ds.config.Queryer.Query(ctx, req)
	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(ds.config.OutputConfig.OutputList, response)
	if err != nil {
		return nil, err
	}
	return ret, nil
}

func notNeedTakeMapValue(op DatasetOperator) bool {
	return op == OperatorIsNull || op == OperatorIsNotNull
}
