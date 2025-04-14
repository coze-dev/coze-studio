package database

import (
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/domain/workflow/cross_domain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type InsertConfig struct {
	DatabaseInfoID int64
	OutputConfig   OutputConfig
	InsertFields   map[string]nodes.TypeInfo
	Inserter       database.Inserter
}

type Insert struct {
	config *InsertConfig
}

func NewInsert(ctx context.Context, cfg *InsertConfig) (*Insert, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}
	if cfg.DatabaseInfoID == 0 {
		return nil, errors.New("database info id is required and greater than 0")
	}

	if len(cfg.InsertFields) == 0 {
		return nil, errors.New("insert fields is required")
	}
	if cfg.Inserter == nil {
		return nil, errors.New("inserter is required")
	}
	return &Insert{
		config: cfg,
	}, nil

}

func (is *Insert) Insert(ctx context.Context, input map[string]any) (map[string]any, error) {
	req := &database.InsertRequest{
		DatabaseInfoID: is.config.DatabaseInfoID,
		Fields:         input, // todo: Is it necessary to convert and verify the input parameters according to the configuration?
	}

	response, err := is.config.Inserter.Insert(ctx, req)
	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(is.config.OutputConfig.OutputList, response)
	if err != nil {
		return nil, err
	}
	ret[rowNum] = response.RowNumber

	return ret, nil
}
