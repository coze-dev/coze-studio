package database

import (
	"context"
	"errors"
	"time"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

type InsertConfig struct {
	DatabaseInfoID int64
	OutputConfig   map[string]*vo.TypeInfo
	InputTimeTypes map[string]*vo.TypeInfo
	Inserter       database.DatabaseOperator
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

	if cfg.Inserter == nil {
		return nil, errors.New("inserter is required")
	}
	return &Insert{
		config: cfg,
	}, nil

}

func (is *Insert) Insert(ctx context.Context, input map[string]any) (map[string]any, error) {
	fs, ok := nodes.TakeMapValue(input, compose.FieldPath{"Fields"})
	if !ok {
		return nil, errors.New("cannot get key 'Fields' value from input")
	}

	fields := make(map[string]any)
	for key, value := range fs.(map[string]any) {
		if _, ok := is.config.InputTimeTypes[key]; ok {
			fields[key] = value.(time.Time).Format(time.DateTime)
		} else {
			fields[key] = value
		}
	}

	req := &database.InsertRequest{
		DatabaseInfoID: is.config.DatabaseInfoID,
		Fields:         fields,
		IsDebugRun:     isDebugExecute(ctx),
	}

	response, err := is.config.Inserter.Insert(ctx, req)
	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(is.config.OutputConfig, response)
	if err != nil {
		return nil, err
	}
	ret[rowNum] = response.RowNumber

	return ret, nil
}
