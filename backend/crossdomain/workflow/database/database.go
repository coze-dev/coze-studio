package database

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cast"

	"code.byted.org/flow/opencoze/backend/domain/memory/database"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	nodedatabase "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
)

type DatabaseRepository struct {
	client database.Database
}

func NewDatabaseRepository(client database.Database) *DatabaseRepository {
	return &DatabaseRepository{
		client: client,
	}
}

func (d *DatabaseRepository) Execute(ctx context.Context, request *nodedatabase.CustomSQLRequest) (*nodedatabase.Response, error) {

	req := &database.ExecuteSQLRequest{
		DatabaseID:  request.DatabaseInfoID,
		OperateType: entity.OperateType_Custom,
		SQL:         &request.SQL,
	}

	req.SQLParams = make([]*entity.SQLParamVal, 0, len(request.Params))
	for i := range request.Params {
		value := request.Params[i]
		req.SQLParams = append(req.SQLParams, &entity.SQLParamVal{
			ValueType: entity.FieldItemType_Text,
			Value:     &value,
		})
	}
	response, err := d.client.ExecuteSQL(ctx, req)
	if err != nil {
		return nil, err
	}
	return toNodeDateBaseResponse(response), nil

}

func (d *DatabaseRepository) Delete(ctx context.Context, request *nodedatabase.DeleteRequest) (*nodedatabase.Response, error) {
	var (
		err error
		req = &database.ExecuteSQLRequest{
			DatabaseID:  request.DatabaseInfoID,
			OperateType: entity.OperateType_Delete,
		}
	)

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
		err error
		req = &database.ExecuteSQLRequest{
			DatabaseID:  request.DatabaseInfoID,
			OperateType: entity.OperateType_Select,
		}
	)
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
		err       error
		condition *database.ComplexCondition
		params    []*entity.SQLParamVal
		req       = &database.ExecuteSQLRequest{
			DatabaseID:  request.DatabaseInfoID,
			OperateType: entity.OperateType_Update,
			SQLParams:   make([]*entity.SQLParamVal, 0),
		}
	)

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
		err error
		req = &database.ExecuteSQLRequest{
			DatabaseID:  request.DatabaseInfoID,
			OperateType: entity.OperateType_Insert,
		}
	)
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

func buildComplexCondition(conditionGroup *nodedatabase.ConditionGroup) (*database.ComplexCondition, []*entity.SQLParamVal, error) {

	condition := &database.ComplexCondition{}
	logic, err := toLogic(conditionGroup.Relation)
	if err != nil {
		return nil, nil, err
	}
	condition.Logic = logic

	params := make([]*entity.SQLParamVal, 0)
	for i := range conditionGroup.Conditions {
		var (
			nCond = conditionGroup.Conditions[i]
			vals  []*entity.SQLParamVal
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

func toOperation(operator nodedatabase.Operator) (entity.Operation, error) {
	switch operator {
	case nodedatabase.OperatorEqual:
		return entity.Operation_EQUAL, nil
	case nodedatabase.OperatorNotEqual:
		return entity.Operation_NOT_EQUAL, nil
	case nodedatabase.OperatorGreater:
		return entity.Operation_GREATER_THAN, nil
	case nodedatabase.OperatorGreaterOrEqual:
		return entity.Operation_GREATER_EQUAL, nil
	case nodedatabase.OperatorLesser:
		return entity.Operation_LESS_THAN, nil
	case nodedatabase.OperatorLesserOrEqual:
		return entity.Operation_LESS_EQUAL, nil
	case nodedatabase.OperatorIn:
		return entity.Operation_IN, nil
	case nodedatabase.OperatorNotIn:
		return entity.Operation_NOT_IN, nil
	case nodedatabase.OperatorIsNotNull:
		return entity.Operation_IS_NOT_NULL, nil
	case nodedatabase.OperatorIsNull:
		return entity.Operation_IS_NULL, nil
	case nodedatabase.OperatorLike:
		return entity.Operation_LIKE, nil
	case nodedatabase.OperatorNotLike:
		return entity.Operation_NOT_LIKE, nil
	default:
		return entity.Operation(0), fmt.Errorf("invalid operator %v", operator)
	}
}

func resolveRightValue(operator entity.Operation, right any) (string, []*entity.SQLParamVal, error) {

	rightValue, err := cast.ToStringE(right)
	if err != nil {
		return "", nil, err
	}

	if isLikeOrNotLike(operator) {
		var (
			value = "?"
			v     = "%s" + rightValue + "%s"
		)
		return value, []*entity.SQLParamVal{{ValueType: entity.FieldItemType_Text, Value: &v}}, nil
	}

	if isInOrNotIn(operator) {
		var (
			vals    = make([]*entity.SQLParamVal, 0)
			anyVals = make([]any, 0)
			commas  = make([]string, 0, len(anyVals))
		)
		err = json.Unmarshal([]byte(rightValue), &anyVals)
		if err != nil {
			return "", nil, err
		}
		for i := range anyVals {
			v := cast.ToString(anyVals[i])
			vals = append(vals, &entity.SQLParamVal{ValueType: entity.FieldItemType_Text, Value: &v})
			commas = append(commas, "?")
		}
		value := "(" + strings.Join(commas, ",") + ")"
		return value, vals, nil
	}

	return "?", []*entity.SQLParamVal{{ValueType: entity.FieldItemType_Text, Value: &rightValue}}, nil
}

func resolveUpsertRow(fields map[string]any) ([]*database.UpsertRow, []*entity.SQLParamVal, error) {
	upsertRow := &database.UpsertRow{Records: make([]*database.Record, 0, len(fields))}
	params := make([]*entity.SQLParamVal, 0)

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
		params = append(params, &entity.SQLParamVal{
			ValueType: entity.FieldItemType_Text,
			Value:     &val,
		})
	}
	return []*database.UpsertRow{upsertRow}, params, nil
}

func isNullOrNotNull(opt entity.Operation) bool {
	return opt == entity.Operation_IS_NOT_NULL || opt == entity.Operation_IS_NULL
}

func isLikeOrNotLike(opt entity.Operation) bool {
	return opt == entity.Operation_LIKE || opt == entity.Operation_NOT_LIKE
}

func isInOrNotIn(opt entity.Operation) bool {
	return opt == entity.Operation_IN || opt == entity.Operation_NOT_IN
}

func toOrderDirection(isAsc bool) entity.SortDirection {
	if isAsc {
		return entity.SortDirection_ASC
	}
	return entity.SortDirection_Desc
}

func toLogic(relation nodedatabase.ClauseRelation) (entity.Logic, error) {
	switch relation {
	case nodedatabase.ClauseRelationOR:
		return entity.Logic_Or, nil
	case nodedatabase.ClauseRelationAND:
		return entity.Logic_And, nil
	default:
		return entity.Logic(0), fmt.Errorf("invalid relation %v", relation)
	}
}

func toNodeDateBaseResponse(response *database.ExecuteSQLResponse) *nodedatabase.Response {
	objects := make([]nodedatabase.Object, 0, len(response.Records))
	for i := range response.Records {
		objects = append(objects, toMapStringAny(response.Records[i]))
	}
	return &nodedatabase.Response{
		Objects:   objects,
		RowNumber: response.RowsAffected,
	}
}
