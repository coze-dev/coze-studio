package database

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type Inserter interface {
	Insert(ctx context.Context, request *InsertRequest) (*Response, error)
}
type InsertConfig struct {
	DatabaseInfoID string
	OutputConfig   OutputConfig
	InsertFields   map[string]nodes.TypeInfo
	Inserter       Inserter
}

type Insert struct {
	config *InsertConfig
}

type InsertRequest struct {
	DatabaseInfoID string
	Fields         map[string]any
}

func (is *Insert) Insert(ctx context.Context, input map[string]any) (map[string]any, error) {
	req := &InsertRequest{
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
