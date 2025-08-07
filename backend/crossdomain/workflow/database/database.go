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
	"fmt"
	"strings"

	"github.com/spf13/cast"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/api/model/table"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/service"
	nodedatabase "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
)

type DatabaseRepository struct {
	client service.Database
}

func NewDatabaseRepository(client service.Database) *DatabaseRepository {
	return &DatabaseRepository{
		client: client,
	}
}

func (d *DatabaseRepository) Execute(ctx context.Context, request *nodedatabase.CustomSQLRequest) (*nodedatabase.Response, error) {
	var (
		err            error
		databaseInfoID = request.DatabaseInfoID
		tableType      = ternary.IFElse[table.TableType](request.IsDebugRun, table.TableType_DraftTable, table.TableType_OnlineTable)
	)

	if request.IsDebugRun {
		databaseInfoID, err = d.getDraftTableID(ctx, databaseInfoID)
		if err != nil {
			return nil, err
		}
	}

	req := &service.ExecuteSQLRequest{
		DatabaseID:  databaseInfoID,
		OperateType: database.OperateType_Custom,
		SQL:         &request.SQL,
		TableType:   tableType,
		UserID:      request.UserID,
		ConnectorID: ptr.Of(request.ConnectorID),
	}

	req.SQLParams = make([]*database.SQLParamVal, 0, len(request.Params))
	for i := range request.Params {
		param := request.Params[i]
		req.SQLParams = append(req.SQLParams, &database.SQLParamVal{
			ValueType: table.FieldItemType_Text,
			Value:     &param.Value,
			ISNull:    param.IsNull,
		})
	}
	response, err := d.client.ExecuteSQL(ctx, req)
	if err != nil {
		return nil, err
	}

	// if rows affected is nil use 0 instead
	if response.RowsAffected == nil {
		response.RowsAffected = ptr.Of(int64(0))
	}
	return toNodeDateBaseResponse(response), nil
}

func (d *DatabaseRepository) Delete(ctx context.Context, request *nodedatabase.DeleteRequest) (*nodedatabase.Response, error) {
	var (
		err            error
		databaseInfoID = request.DatabaseInfoID
		tableType      = ternary.IFElse[table.TableType](request.IsDebugRun, table.TableType_DraftTable, table.TableType_OnlineTable)
	)

	if request.IsDebugRun {
		databaseInfoID, err = d.getDraftTableID(ctx, databaseInfoID)
		if err != nil {
			return nil, err
		}
	}

	req := &service.ExecuteSQLRequest{
		DatabaseID:  databaseInfoID,
		OperateType: database.OperateType_Delete,
		TableType:   tableType,
		UserID:      request.UserID,
		ConnectorID: ptr.Of(request.ConnectorID),
	}

	if request.ConditionGroup != nil {
		req.Condition, req.SQLParams, err = buildComplexCondition(request.ConditionGroup)
		if err != nil {
			return nil, err
		}
	}

	response, err := d.client.ExecuteSQL(ctx, req)
	if err != nil {
		return nil, err
	}
	return toNodeDateBaseResponse(response), nil
}

func (d *DatabaseRepository) Query(ctx context.Context, request *nodedatabase.QueryRequest) (*nodedatabase.Response, error) {
	var (
		err            error
		databaseInfoID = request.DatabaseInfoID
		tableType      = ternary.IFElse[table.TableType](request.IsDebugRun, table.TableType_DraftTable, table.TableType_OnlineTable)
	)

	if request.IsDebugRun {
		databaseInfoID, err = d.getDraftTableID(ctx, databaseInfoID)
		if err != nil {
			return nil, err
		}
	}

	req := &service.ExecuteSQLRequest{
		DatabaseID:  databaseInfoID,
		OperateType: database.OperateType_Select,
		TableType:   tableType,
		UserID:      request.UserID,
		ConnectorID: ptr.Of(request.ConnectorID),
	}

	req.SelectFieldList = &database.SelectFieldList{FieldID: make([]string, 0, len(request.SelectFields))}
	for i := range request.SelectFields {
		req.SelectFieldList.FieldID = append(req.SelectFieldList.FieldID, request.SelectFields[i])
	}

	req.OrderByList = make([]database.OrderBy, 0)
	for i := range request.OrderClauses {
		clause := request.OrderClauses[i]
		req.OrderByList = append(req.OrderByList, database.OrderBy{
			Field:     clause.FieldID,
			Direction: toOrderDirection(clause.IsAsc),
		})
	}

	if request.ConditionGroup != nil {
		req.Condition, req.SQLParams, err = buildComplexCondition(request.ConditionGroup)
		if err != nil {
			return nil, err
		}
	}

	limit := request.Limit
	req.Limit = &limit

	response, err := d.client.ExecuteSQL(ctx, req)
	if err != nil {
		return nil, err
	}
	return toNodeDateBaseResponse(response), nil
}

func (d *DatabaseRepository) Update(ctx context.Context, request *nodedatabase.UpdateRequest) (*nodedatabase.Response, error) {

	var (
		err            error
		condition      *database.ComplexCondition
		params         []*database.SQLParamVal
		databaseInfoID = request.DatabaseInfoID
		tableType      = ternary.IFElse[table.TableType](request.IsDebugRun, table.TableType_DraftTable, table.TableType_OnlineTable)
	)

	if request.IsDebugRun {
		databaseInfoID, err = d.getDraftTableID(ctx, databaseInfoID)
		if err != nil {
			return nil, err
		}
	}

	req := &service.ExecuteSQLRequest{
		DatabaseID:  databaseInfoID,
		OperateType: database.OperateType_Update,
		SQLParams:   make([]*database.SQLParamVal, 0),
		TableType:   tableType,
		UserID:      request.UserID,
		ConnectorID: ptr.Of(request.ConnectorID),
	}

	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid != nil {
		req.UserID = conv.Int64ToStr(*uid)
	}
	req.UpsertRows, req.SQLParams, err = resolveUpsertRow(request.Fields)
	if err != nil {
		return nil, err
	}

	if request.ConditionGroup != nil {
		condition, params, err = buildComplexCondition(request.ConditionGroup)
		if err != nil {
			return nil, err
		}

		req.Condition = condition
		req.SQLParams = append(req.SQLParams, params...)
	}

	response, err := d.client.ExecuteSQL(ctx, req)
	if err != nil {
		return nil, err
	}
	return toNodeDateBaseResponse(response), nil
}

func (d *DatabaseRepository) Insert(ctx context.Context, request *nodedatabase.InsertRequest) (*nodedatabase.Response, error) {
	var (
		err            error
		databaseInfoID = request.DatabaseInfoID
		tableType      = ternary.IFElse[table.TableType](request.IsDebugRun, table.TableType_DraftTable, table.TableType_OnlineTable)
	)

	if request.IsDebugRun {
		databaseInfoID, err = d.getDraftTableID(ctx, databaseInfoID)
		if err != nil {
			return nil, err
		}
	}

	req := &service.ExecuteSQLRequest{
		DatabaseID:  databaseInfoID,
		OperateType: database.OperateType_Insert,
		TableType:   tableType,
		UserID:      request.UserID,
		ConnectorID: ptr.Of(request.ConnectorID),
	}

	req.UpsertRows, req.SQLParams, err = resolveUpsertRow(request.Fields)
	if err != nil {
		return nil, err
	}

	response, err := d.client.ExecuteSQL(ctx, req)
	if err != nil {
		return nil, err
	}
	return toNodeDateBaseResponse(response), nil
}

func (d *DatabaseRepository) getDraftTableID(ctx context.Context, onlineID int64) (int64, error) {
	resp, err := d.client.GetDraftDatabaseByOnlineID(ctx, &service.GetDraftDatabaseByOnlineIDRequest{OnlineID: onlineID})
	if err != nil {
		return 0, err
	}
	return resp.Database.ID, nil

}

func buildComplexCondition(conditionGroup *nodedatabase.ConditionGroup) (*database.ComplexCondition, []*database.SQLParamVal, error) {
	condition := &database.ComplexCondition{}
	logic, err := toLogic(conditionGroup.Relation)
	if err != nil {
		return nil, nil, err
	}
	condition.Logic = logic

	params := make([]*database.SQLParamVal, 0)
	for i := range conditionGroup.Conditions {
		var (
			nCond = conditionGroup.Conditions[i]
			vals  []*database.SQLParamVal
			dCond = &database.Condition{
				Left: nCond.Left,
			}
		)
		opt, err := toOperation(nCond.Operator)
		if err != nil {
			return nil, nil, err
		}
		dCond.Operation = opt

		if isNullOrNotNull(opt) {
			condition.Conditions = append(condition.Conditions, dCond)
			continue
		}
		dCond.Right, vals, err = resolveRightValue(opt, nCond.Right)
		if err != nil {
			return nil, nil, err
		}
		condition.Conditions = append(condition.Conditions, dCond)

		params = append(params, vals...)

	}
	return condition, params, nil
}

func toMapStringAny(m map[string]string) map[string]any {
	ret := make(map[string]any, len(m))
	for k, v := range m {
		ret[k] = v
	}
	return ret
}

func toOperation(operator nodedatabase.Operator) (database.Operation, error) {
	switch operator {
	case nodedatabase.OperatorEqual:
		return database.Operation_EQUAL, nil
	case nodedatabase.OperatorNotEqual:
		return database.Operation_NOT_EQUAL, nil
	case nodedatabase.OperatorGreater:
		return database.Operation_GREATER_THAN, nil
	case nodedatabase.OperatorGreaterOrEqual:
		return database.Operation_GREATER_EQUAL, nil
	case nodedatabase.OperatorLesser:
		return database.Operation_LESS_THAN, nil
	case nodedatabase.OperatorLesserOrEqual:
		return database.Operation_LESS_EQUAL, nil
	case nodedatabase.OperatorIn:
		return database.Operation_IN, nil
	case nodedatabase.OperatorNotIn:
		return database.Operation_NOT_IN, nil
	case nodedatabase.OperatorIsNotNull:
		return database.Operation_IS_NOT_NULL, nil
	case nodedatabase.OperatorIsNull:
		return database.Operation_IS_NULL, nil
	case nodedatabase.OperatorLike:
		return database.Operation_LIKE, nil
	case nodedatabase.OperatorNotLike:
		return database.Operation_NOT_LIKE, nil
	default:
		return database.Operation(0), fmt.Errorf("invalid operator %v", operator)
	}
}

func resolveRightValue(operator database.Operation, right any) (string, []*database.SQLParamVal, error) {

	if isInOrNotIn(operator) {
		var (
			vals    = make([]*database.SQLParamVal, 0)
			anyVals = make([]any, 0)
			commas  = make([]string, 0, len(anyVals))
		)

		anyVals = right.([]any)
		for i := range anyVals {
			v := cast.ToString(anyVals[i])
			vals = append(vals, &database.SQLParamVal{ValueType: table.FieldItemType_Text, Value: &v})
			commas = append(commas, "?")
		}
		value := "(" + strings.Join(commas, ",") + ")"
		return value, vals, nil
	}

	rightValue, err := cast.ToStringE(right)
	if err != nil {
		return "", nil, err
	}

	if isLikeOrNotLike(operator) {
		var (
			value = "?"
			v     = "%s" + rightValue + "%s"
		)
		return value, []*database.SQLParamVal{{ValueType: table.FieldItemType_Text, Value: &v}}, nil
	}

	return "?", []*database.SQLParamVal{{ValueType: table.FieldItemType_Text, Value: &rightValue}}, nil
}

func resolveUpsertRow(fields map[string]any) ([]*database.UpsertRow, []*database.SQLParamVal, error) {
	upsertRow := &database.UpsertRow{Records: make([]*database.Record, 0, len(fields))}
	params := make([]*database.SQLParamVal, 0)
	for key, value := range fields {
		val, err := cast.ToStringE(value)
		if err != nil {
			return nil, nil, err
		}
		record := &database.Record{
			FieldId:    key,
			FieldValue: "?",
		}
		upsertRow.Records = append(upsertRow.Records, record)
		params = append(params, &database.SQLParamVal{
			ValueType: table.FieldItemType_Text,
			Value:     &val,
		})
	}
	return []*database.UpsertRow{upsertRow}, params, nil
}

func isNullOrNotNull(opt database.Operation) bool {
	return opt == database.Operation_IS_NOT_NULL || opt == database.Operation_IS_NULL
}

func isLikeOrNotLike(opt database.Operation) bool {
	return opt == database.Operation_LIKE || opt == database.Operation_NOT_LIKE
}

func isInOrNotIn(opt database.Operation) bool {
	return opt == database.Operation_IN || opt == database.Operation_NOT_IN
}

func toOrderDirection(isAsc bool) table.SortDirection {
	if isAsc {
		return table.SortDirection_ASC
	}
	return table.SortDirection_Desc
}

func toLogic(relation nodedatabase.ClauseRelation) (database.Logic, error) {
	switch relation {
	case nodedatabase.ClauseRelationOR:
		return database.Logic_Or, nil
	case nodedatabase.ClauseRelationAND:
		return database.Logic_And, nil
	default:
		return database.Logic(0), fmt.Errorf("invalid relation %v", relation)
	}
}

func toNodeDateBaseResponse(response *service.ExecuteSQLResponse) *nodedatabase.Response {
	objects := make([]nodedatabase.Object, 0, len(response.Records))
	for i := range response.Records {
		objects = append(objects, response.Records[i])
	}
	return &nodedatabase.Response{
		Objects:   objects,
		RowNumber: response.RowsAffected,
	}
}
