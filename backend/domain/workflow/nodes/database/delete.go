package database

import (
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/domain/workflow/cross_domain/database"
)

type DeleteConfig struct {
	DatabaseInfoID int64
	ClauseGroup    *database.ClauseGroup
	OutputConfig   OutputConfig

	Deleter database.Deleter
}
type Delete struct {
	config *DeleteConfig
}

func NewDelete(ctx context.Context, cfg *DeleteConfig) (*Delete, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}
	if cfg.DatabaseInfoID == 0 {
		return nil, errors.New("database info id is required and greater than 0")
	}

	if cfg.ClauseGroup == nil {
		return nil, errors.New("clauseGroup is required")
	}
	if cfg.Deleter == nil {
		return nil, errors.New("deleter is required")
	}

	return &Delete{
		config: cfg,
	}, nil

}

func (d *Delete) Delete(ctx context.Context, conditionGroup *database.ConditionGroup) (map[string]any, error) {

	request := &database.DeleteRequest{
		DatabaseInfoID: d.config.DatabaseInfoID,
		ConditionGroup: conditionGroup,
	}

	response, err := d.config.Deleter.Delete(ctx, request)
	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(d.config.OutputConfig.OutputList, response)
	if err != nil {
		return nil, err
	}
	ret[rowNum] = response.RowNumber

	return ret, nil
}
