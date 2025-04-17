package database

import (
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type QueryConfig struct {
	DatabaseInfoID int64
	QueryFields    []string
	OrderClauses   []*database.OrderClause
	OutputConfig   map[string]*nodes.TypeInfo
	ClauseGroup    *database.ClauseGroup
	Limit          int64
	Queryer        database.Queryer
}

type Query struct {
	config *QueryConfig
}

func NewQuery(ctx context.Context, cfg *QueryConfig) (*Query, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}
	if cfg.DatabaseInfoID == 0 {
		return nil, errors.New("database info id is required and greater than 0")
	}

	if cfg.Limit == 0 {
		return nil, errors.New("limit is required and greater than 0")
	}

	if cfg.Queryer == nil {
		return nil, errors.New("queryer is required")
	}

	return &Query{config: cfg}, nil

}

func (ds *Query) Query(ctx context.Context, conditionGroup *database.ConditionGroup) (map[string]any, error) {
	req := &database.QueryRequest{
		DatabaseInfoID: ds.config.DatabaseInfoID,
		OrderClauses:   ds.config.OrderClauses,
		SelectFields:   ds.config.QueryFields,
	}

	req.ConditionGroup = conditionGroup

	response, err := ds.config.Queryer.Query(ctx, req)
	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(ds.config.OutputConfig, response)
	if err != nil {
		return nil, err
	}
	return ret, nil
}

func notNeedTakeMapValue(op database.DatasetOperator) bool {
	return op == database.OperatorIsNull || op == database.OperatorIsNotNull
}
