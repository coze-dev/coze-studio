/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package database

import (
	"context"
	"errors"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

type QueryConfig struct {
	DatabaseInfoID int64
	QueryFields    []string
	OrderClauses   []*database.OrderClause
	OutputConfig   map[string]*vo.TypeInfo
	ClauseGroup    *database.ClauseGroup
	Limit          int64
	Op             database.DatabaseOperator
}

type Query struct {
	config *QueryConfig
}

func NewQuery(_ context.Context, cfg *QueryConfig) (*Query, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}
	if cfg.DatabaseInfoID == 0 {
		return nil, errors.New("database info id is required and greater than 0")
	}

	if cfg.Limit == 0 {
		return nil, errors.New("limit is required and greater than 0")
	}

	if cfg.Op == nil {
		return nil, errors.New("op is required")
	}

	return &Query{config: cfg}, nil

}

func (ds *Query) Query(ctx context.Context, in map[string]any) (map[string]any, error) {
	conditionGroup, err := convertClauseGroupToConditionGroup(ctx, ds.config.ClauseGroup, in)
	if err != nil {
		return nil, err
	}

	req := &database.QueryRequest{
		DatabaseInfoID: ds.config.DatabaseInfoID,
		OrderClauses:   ds.config.OrderClauses,
		SelectFields:   ds.config.QueryFields,
		Limit:          ds.config.Limit,
		IsDebugRun:     isDebugExecute(ctx),
		UserID:         getExecUserID(ctx),
	}

	req.ConditionGroup = conditionGroup

	response, err := ds.config.Op.Query(ctx, req)
	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(ds.config.OutputConfig, response)
	if err != nil {
		return nil, err
	}
	return ret, nil
}

func notNeedTakeMapValue(op database.Operator) bool {
	return op == database.OperatorIsNull || op == database.OperatorIsNotNull
}

func (ds *Query) ToCallbackInput(ctx context.Context, in map[string]any) (map[string]any, error) {
	conditionGroup, err := convertClauseGroupToConditionGroup(ctx, ds.config.ClauseGroup, in)
	if err != nil {
		return nil, err
	}

	return toDatabaseQueryCallbackInput(ds.config, conditionGroup)
}

func toDatabaseQueryCallbackInput(config *QueryConfig, conditionGroup *database.ConditionGroup) (map[string]any, error) {
	result := make(map[string]any)

	databaseID := config.DatabaseInfoID
	result["databaseInfoList"] = []string{fmt.Sprintf("%d", databaseID)}
	result["selectParam"] = map[string]any{}

	condition, err := convertToCondition(conditionGroup)
	if err != nil {
		return nil, err
	}
	type Field struct {
		FieldID    string `json:"fieldId"`
		IsDistinct bool   `json:"isDistinct"`
	}
	fieldList := make([]Field, 0, len(config.QueryFields))
	for _, f := range config.QueryFields {
		fieldList = append(fieldList, Field{FieldID: f})
	}
	type Order struct {
		FieldID string `json:"fieldId"`
		IsAsc   bool   `json:"isAsc"`
	}

	OrderList := make([]Order, 0)
	for _, c := range config.OrderClauses {
		OrderList = append(OrderList, Order{
			FieldID: c.FieldID,
			IsAsc:   c.IsAsc,
		})
	}
	result["selectParam"] = map[string]any{
		"condition":   condition,
		"fieldList":   fieldList,
		"limit":       config.Limit,
		"orderByList": OrderList,
	}

	return result, nil

}

type ConditionItem struct {
	Left      string `json:"left"`
	Operation string `json:"operation"`
	Right     any    `json:"right"`
}
type Condition struct {
	ConditionList []ConditionItem `json:"conditionList"`
	Logic         string          `json:"logic"`
}

func convertToCondition(conditionGroup *database.ConditionGroup) (*Condition, error) {
	logic, err := convertToLogic(conditionGroup.Relation)
	if err != nil {
		return nil, err
	}
	condition := &Condition{
		ConditionList: make([]ConditionItem, 0),
		Logic:         logic,
	}
	for _, c := range conditionGroup.Conditions {
		op, err := convertToOperation(c.Operator)
		if err != nil {
			return nil, fmt.Errorf("invalid operator: %s", c.Operator)
		}
		condition.ConditionList = append(condition.ConditionList, ConditionItem{
			Left:      c.Left,
			Operation: op,
			Right:     c.Right,
		})

	}
	return condition, nil
}

func convertToOperation(Op database.Operator) (string, error) {
	switch Op {
	case database.OperatorEqual:
		return "EQUAL", nil
	case database.OperatorNotEqual:
		return "NOT_EQUAL", nil
	case database.OperatorGreater:
		return "GREATER_THAN", nil
	case database.OperatorLesser:
		return "LESS_THAN", nil
	case database.OperatorGreaterOrEqual:
		return "GREATER_EQUAL", nil
	case database.OperatorLesserOrEqual:
		return "LESS_EQUAL", nil
	case database.OperatorIn:
		return "IN", nil
	case database.OperatorNotIn:
		return "NOT_IN", nil
	case database.OperatorIsNull:
		return "IS_NULL", nil
	case database.OperatorIsNotNull:
		return "IS_NOT_NULL", nil
	case database.OperatorLike:
		return "LIKE", nil
	case database.OperatorNotLike:
		return "NOT LIKE", nil
	}
	return "", fmt.Errorf("not a valid database Operator")

}

func convertToLogic(rel database.ClauseRelation) (string, error) {
	switch rel {
	case database.ClauseRelationOR:
		return "OR", nil
	case database.ClauseRelationAND:
		return "AND", nil
	default:
		return "", fmt.Errorf("unknown clause relation %v", rel)

	}
}
