package database

import (
	"context"
	"errors"
	"fmt"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type DeleteConfig struct {
	DatabaseInfoID int64
	ClauseGroup    *database.ClauseGroup
	OutputConfig   map[string]*vo.TypeInfo

	Deleter database.DatabaseOperator
}
type Delete struct {
	config *DeleteConfig
}

func NewDelete(_ context.Context, cfg *DeleteConfig) (*Delete, error) {
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

func (d *Delete) Delete(ctx context.Context, in map[string]any) (map[string]any, error) {
	conditionGroup, err := ConvertClauseGroupToConditionGroup(ctx, d.config.ClauseGroup, in)
	if err != nil {
		return nil, err
	}
	request := &database.DeleteRequest{
		DatabaseInfoID: d.config.DatabaseInfoID,
		ConditionGroup: conditionGroup,
		IsDebugRun:     isDebugExecute(ctx),
		UserID:         getExecUserID(ctx),
	}

	response, err := d.config.Deleter.Delete(ctx, request)
	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(d.config.OutputConfig, response)
	if err != nil {
		return nil, err
	}
	ret[rowNum] = response.RowNumber

	return ret, nil
}

func (d *Delete) ToCallbackInput(_ context.Context, in map[string]any) (map[string]any, error) {
	conditionGroup, err := ConvertClauseGroupToConditionGroup(context.Background(), d.config.ClauseGroup, in)
	if err != nil {
		return nil, err
	}
	return d.toDatabaseDeleteCallbackInput(conditionGroup)
}

func (d *Delete) toDatabaseDeleteCallbackInput(conditionGroup *database.ConditionGroup) (map[string]any, error) {
	databaseID := d.config.DatabaseInfoID
	result := make(map[string]any)

	result["databaseInfoList"] = []string{fmt.Sprintf("%d", databaseID)}
	result["deleteParam"] = map[string]any{}

	condition, err := convertToCondition(conditionGroup)
	if err != nil {
		return nil, err
	}
	type Field struct {
		FieldID    string `json:"fieldId"`
		IsDistinct bool   `json:"isDistinct"`
	}
	result["deleteParam"] = map[string]any{
		"condition": condition}

	return result, nil
}
