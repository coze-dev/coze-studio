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
	"strconv"

	crossdatabase "github.com/coze-dev/coze-studio/backend/crossdomain/database"
	database "github.com/coze-dev/coze-studio/backend/crossdomain/database/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

type QueryConfig struct {
	DatabaseInfoID int64
	QueryFields    []string
	OrderClauses   []*database.OrderClause
	ClauseGroup    *database.ClauseGroup
	Limit          int64
}

func (q *QueryConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeDatabaseQuery,
		Name:    n.Data.Meta.Title,
		Configs: q,
	}

	dsList := n.Data.Inputs.DatabaseInfoList
	if len(dsList) == 0 {
		return nil, fmt.Errorf("database info is requird")
	}
	databaseInfo := dsList[0]

	dsID, err := strconv.ParseInt(databaseInfo.DatabaseInfoID, 10, 64)
	if err != nil {
		return nil, err
	}
	q.DatabaseInfoID = dsID

	selectParam := n.Data.Inputs.SelectParam
	q.Limit = selectParam.Limit

	queryFields := make([]string, 0)
	for _, v := range selectParam.FieldList {
		queryFields = append(queryFields, strconv.FormatInt(v.FieldID, 10))
	}
	q.QueryFields = queryFields

	orderClauses := make([]*database.OrderClause, 0, len(selectParam.OrderByList))
	for _, o := range selectParam.OrderByList {
		orderClauses = append(orderClauses, &database.OrderClause{
			FieldID: strconv.FormatInt(o.FieldID, 10),
			IsAsc:   o.IsAsc,
		})
	}
	q.OrderClauses = orderClauses

	clauseGroup := &database.ClauseGroup{}

	if selectParam.Condition != nil {
		clauseGroup, err = buildClauseGroupFromCondition(selectParam.Condition)
		if err != nil {
			return nil, err
		}
	}

	q.ClauseGroup = clauseGroup

	if err = setDatabaseInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err = convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (q *QueryConfig) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	if q.DatabaseInfoID == 0 {
		return nil, errors.New("database info id is required and greater than 0")
	}

	if q.Limit == 0 {
		return nil, errors.New("limit is required and greater than 0")
	}

	return &Query{
		databaseInfoID: q.DatabaseInfoID,
		queryFields:    q.QueryFields,
		orderClauses:   q.OrderClauses,
		outputTypes:    ns.OutputTypes,
		clauseGroup:    q.ClauseGroup,
		limit:          q.Limit,
	}, nil
}

type Query struct {
	databaseInfoID int64
	queryFields    []string
	orderClauses   []*database.OrderClause
	outputTypes    map[string]*vo.TypeInfo
	clauseGroup    *database.ClauseGroup
	limit          int64
}

func (ds *Query) Invoke(ctx context.Context, in map[string]any) (map[string]any, error) {
	conditionGroup, err := convertClauseGroupToConditionGroup(ctx, ds.clauseGroup, in)
	if err != nil {
		return nil, err
	}

	req := &database.QueryRequest{
		DatabaseInfoID: ds.databaseInfoID,
		OrderClauses:   ds.orderClauses,
		SelectFields:   ds.queryFields,
		Limit:          ds.limit,
		IsDebugRun:     isDebugExecute(ctx),
		UserID:         getExecUserID(ctx),
		ConnectorID:    getConnectorID(ctx),
	}

	req.ConditionGroup = conditionGroup

	response, err := crossdatabase.DefaultSVC().Query(ctx, req)
	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(ds.outputTypes, response)
	if err != nil {
		return nil, err
	}
	return ret, nil
}

func notNeedTakeMapValue(op database.Operator) bool {
	return op == database.OperatorIsNull || op == database.OperatorIsNotNull
}

func (ds *Query) ToCallbackInput(ctx context.Context, in map[string]any) (*nodes.StructuredCallbackInput, error) {
	conditionGroup, err := convertClauseGroupToConditionGroup(ctx, ds.clauseGroup, in)
	if err != nil {
		return nil, err
	}

	return ds.toDatabaseQueryCallbackInput(conditionGroup)
}

func (ds *Query) toDatabaseQueryCallbackInput(conditionGroup *database.ConditionGroup) (
	*nodes.StructuredCallbackInput, error) {
	result := make(map[string]any)

	databaseID := ds.databaseInfoID
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
	fieldList := make([]Field, 0, len(ds.queryFields))
	for _, f := range ds.queryFields {
		fieldList = append(fieldList, Field{FieldID: f})
	}
	type Order struct {
		FieldID string `json:"fieldId"`
		IsAsc   bool   `json:"isAsc"`
	}

	OrderList := make([]Order, 0)
	for _, c := range ds.orderClauses {
		OrderList = append(OrderList, Order{
			FieldID: c.FieldID,
			IsAsc:   c.IsAsc,
		})
	}
	result["selectParam"] = map[string]any{
		"condition":   condition,
		"fieldList":   fieldList,
		"limit":       ds.limit,
		"orderByList": OrderList,
	}

	return &nodes.StructuredCallbackInput{
		Input: result,
	}, nil
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
