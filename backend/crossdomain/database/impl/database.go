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

package impl

import (
	"context"
	"fmt"
	"strings"

	"github.com/spf13/cast"

	"github.com/coze-dev/coze-studio/backend/api/model/data/database/table"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	crossdatabase "github.com/coze-dev/coze-studio/backend/crossdomain/database"
	model "github.com/coze-dev/coze-studio/backend/crossdomain/database/model"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/service"
	database "github.com/coze-dev/coze-studio/backend/domain/memory/database/service"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
)

var defaultSVC crossdatabase.Database

type databaseImpl struct {
	DomainSVC database.Database
}

func InitDomainService(c database.Database) crossdatabase.Database {
	defaultSVC = &databaseImpl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (c *databaseImpl) ExecuteSQL(ctx context.Context, req *model.ExecuteSQLRequest) (*model.ExecuteSQLResponse, error) {
	return c.DomainSVC.ExecuteSQL(ctx, req)
}

func (c *databaseImpl) PublishDatabase(ctx context.Context, req *model.PublishDatabaseRequest) (resp *model.PublishDatabaseResponse, err error) {
	return c.DomainSVC.PublishDatabase(ctx, req)
}

func (c *databaseImpl) DeleteDatabase(ctx context.Context, req *model.DeleteDatabaseRequest) error {
	return c.DomainSVC.DeleteDatabase(ctx, req)
}

func (c *databaseImpl) BindDatabase(ctx context.Context, req *model.BindDatabaseToAgentRequest) error {
	return c.DomainSVC.BindDatabase(ctx, req)
}

func (c *databaseImpl) UnBindDatabase(ctx context.Context, req *model.UnBindDatabaseToAgentRequest) error {
	return c.DomainSVC.UnBindDatabase(ctx, req)
}

func (c *databaseImpl) MGetDatabase(ctx context.Context, req *model.MGetDatabaseRequest) (*model.MGetDatabaseResponse, error) {
	return c.DomainSVC.MGetDatabase(ctx, req)
}

func (c *databaseImpl) GetAllDatabaseByAppID(ctx context.Context, req *model.GetAllDatabaseByAppIDRequest) (*model.GetAllDatabaseByAppIDResponse, error) {
	return c.DomainSVC.GetAllDatabaseByAppID(ctx, req)
}

func (d *databaseImpl) Execute(ctx context.Context, request *model.CustomSQLRequest) (*model.Response, error) {
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
		OperateType: model.OperateType_Custom,
		SQL:         &request.SQL,
		TableType:   tableType,
		UserID:      request.UserID,
		ConnectorID: ptr.Of(request.ConnectorID),
	}

	req.SQLParams = make([]*model.SQLParamVal, 0, len(request.Params))
	for i := range request.Params {
		param := request.Params[i]
		req.SQLParams = append(req.SQLParams, &model.SQLParamVal{
			ValueType: table.FieldItemType_Text,
			Value:     &param.Value,
			ISNull:    param.IsNull,
		})
	}
	response, err := d.DomainSVC.ExecuteSQL(ctx, req)
	if err != nil {
		return nil, err
	}

	// if rows affected is nil use 0 instead
	if response.RowsAffected == nil {
		response.RowsAffected = ptr.Of(int64(0))
	}
	return toNodeDateBaseResponse(response), nil
}

func (d *databaseImpl) Delete(ctx context.Context, request *model.DeleteRequest) (*model.Response, error) {
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
		OperateType: model.OperateType_Delete,
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

	response, err := d.DomainSVC.ExecuteSQL(ctx, req)
	if err != nil {
		return nil, err
	}
	return toNodeDateBaseResponse(response), nil
}

func (d *databaseImpl) Query(ctx context.Context, request *model.QueryRequest) (*model.Response, error) {
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
		OperateType: model.OperateType_Select,
		TableType:   tableType,
		UserID:      request.UserID,
		ConnectorID: ptr.Of(request.ConnectorID),
	}

	req.SelectFieldList = &model.SelectFieldList{FieldID: make([]string, 0, len(request.SelectFields))}
	for i := range request.SelectFields {
		req.SelectFieldList.FieldID = append(req.SelectFieldList.FieldID, request.SelectFields[i])
	}

	req.OrderByList = make([]model.OrderBy, 0)
	for i := range request.OrderClauses {
		clause := request.OrderClauses[i]
		req.OrderByList = append(req.OrderByList, model.OrderBy{
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

	response, err := d.DomainSVC.ExecuteSQL(ctx, req)
	if err != nil {
		return nil, err
	}
	return toNodeDateBaseResponse(response), nil
}

func (d *databaseImpl) Update(ctx context.Context, request *model.UpdateRequest) (*model.Response, error) {

	var (
		err            error
		condition      *model.ComplexCondition
		params         []*model.SQLParamVal
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
		OperateType: model.OperateType_Update,
		SQLParams:   make([]*model.SQLParamVal, 0),
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

	response, err := d.DomainSVC.ExecuteSQL(ctx, req)
	if err != nil {
		return nil, err
	}
	return toNodeDateBaseResponse(response), nil
}

func (d *databaseImpl) Insert(ctx context.Context, request *model.InsertRequest) (*model.Response, error) {
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
		OperateType: model.OperateType_Insert,
		TableType:   tableType,
		UserID:      request.UserID,
		ConnectorID: ptr.Of(request.ConnectorID),
	}

	req.UpsertRows, req.SQLParams, err = resolveUpsertRow(request.Fields)
	if err != nil {
		return nil, err
	}

	response, err := d.DomainSVC.ExecuteSQL(ctx, req)
	if err != nil {
		return nil, err
	}
	return toNodeDateBaseResponse(response), nil
}

func (d *databaseImpl) getDraftTableID(ctx context.Context, onlineID int64) (int64, error) {
	resp, err := d.DomainSVC.GetDraftDatabaseByOnlineID(ctx, &service.GetDraftDatabaseByOnlineIDRequest{OnlineID: onlineID})
	if err != nil {
		return 0, err
	}

	return resp.Database.ID, nil
}

func buildComplexCondition(conditionGroup *model.ConditionGroup) (*model.ComplexCondition, []*model.SQLParamVal, error) {
	condition := &model.ComplexCondition{}
	logic, err := toLogic(conditionGroup.Relation)
	if err != nil {
		return nil, nil, err
	}
	condition.Logic = logic

	params := make([]*model.SQLParamVal, 0)
	for i := range conditionGroup.Conditions {
		var (
			nCond = conditionGroup.Conditions[i]
			vals  []*model.SQLParamVal
			dCond = &model.Condition{
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

func toOperation(operator model.Operator) (model.Operation, error) {
	switch operator {
	case model.OperatorEqual:
		return model.Operation_EQUAL, nil
	case model.OperatorNotEqual:
		return model.Operation_NOT_EQUAL, nil
	case model.OperatorGreater:
		return model.Operation_GREATER_THAN, nil
	case model.OperatorGreaterOrEqual:
		return model.Operation_GREATER_EQUAL, nil
	case model.OperatorLesser:
		return model.Operation_LESS_THAN, nil
	case model.OperatorLesserOrEqual:
		return model.Operation_LESS_EQUAL, nil
	case model.OperatorIn:
		return model.Operation_IN, nil
	case model.OperatorNotIn:
		return model.Operation_NOT_IN, nil
	case model.OperatorIsNotNull:
		return model.Operation_IS_NOT_NULL, nil
	case model.OperatorIsNull:
		return model.Operation_IS_NULL, nil
	case model.OperatorLike:
		return model.Operation_LIKE, nil
	case model.OperatorNotLike:
		return model.Operation_NOT_LIKE, nil
	default:
		return model.Operation(0), fmt.Errorf("invalid operator %v", operator)
	}
}

func resolveRightValue(operator model.Operation, right any) (string, []*model.SQLParamVal, error) {

	if isInOrNotIn(operator) {
		var (
			vals    = make([]*model.SQLParamVal, 0)
			anyVals = make([]any, 0)
			commas  = make([]string, 0, len(anyVals))
		)

		anyVals = right.([]any)
		for i := range anyVals {
			v := cast.ToString(anyVals[i])
			vals = append(vals, &model.SQLParamVal{ValueType: table.FieldItemType_Text, Value: &v})
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
		return value, []*model.SQLParamVal{{ValueType: table.FieldItemType_Text, Value: &v}}, nil
	}

	return "?", []*model.SQLParamVal{{ValueType: table.FieldItemType_Text, Value: &rightValue}}, nil
}

func resolveUpsertRow(fields map[string]any) ([]*model.UpsertRow, []*model.SQLParamVal, error) {
	upsertRow := &model.UpsertRow{Records: make([]*model.Record, 0, len(fields))}
	params := make([]*model.SQLParamVal, 0)
	for key, value := range fields {
		val, err := cast.ToStringE(value)
		if err != nil {
			return nil, nil, err
		}
		record := &model.Record{
			FieldId:    key,
			FieldValue: "?",
		}
		upsertRow.Records = append(upsertRow.Records, record)
		params = append(params, &model.SQLParamVal{
			ValueType: table.FieldItemType_Text,
			Value:     &val,
		})
	}
	return []*model.UpsertRow{upsertRow}, params, nil
}

func isNullOrNotNull(opt model.Operation) bool {
	return opt == model.Operation_IS_NOT_NULL || opt == model.Operation_IS_NULL
}

func isLikeOrNotLike(opt model.Operation) bool {
	return opt == model.Operation_LIKE || opt == model.Operation_NOT_LIKE
}

func isInOrNotIn(opt model.Operation) bool {
	return opt == model.Operation_IN || opt == model.Operation_NOT_IN
}

func toOrderDirection(isAsc bool) table.SortDirection {
	if isAsc {
		return table.SortDirection_ASC
	}
	return table.SortDirection_Desc
}

func toLogic(relation model.ClauseRelation) (model.Logic, error) {
	switch relation {
	case model.ClauseRelationOR:
		return model.Logic_Or, nil
	case model.ClauseRelationAND:
		return model.Logic_And, nil
	default:
		return model.Logic(0), fmt.Errorf("invalid relation %v", relation)
	}
}

func toNodeDateBaseResponse(response *service.ExecuteSQLResponse) *model.Response {
	objects := make([]model.Object, 0, len(response.Records))
	for i := range response.Records {
		objects = append(objects, response.Records[i])
	}
	return &model.Response{
		Objects:   objects,
		RowNumber: response.RowsAffected,
	}
}
