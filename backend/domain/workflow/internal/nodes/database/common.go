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
	"strconv"
	"strings"
	"time"

	"github.com/cloudwego/eino/compose"

	database "github.com/coze-dev/coze-studio/backend/crossdomain/database/model"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

const rowNum = "rowNum"
const outputList = "outputList"
const TimeFormat = "2006-01-02 15:04:05 -0700 MST"

func toString(in any) (any, error) {
	switch in := in.(type) {
	case []byte:
		return string(in), nil
	case string:
		return in, nil
	case int64:
		return strconv.FormatInt(in, 10), nil
	case float64:
		return strconv.FormatFloat(in, 'f', -1, 64), nil
	case time.Time:
		return in.Format(TimeFormat), nil
	case bool:
		return strconv.FormatBool(in), nil
	case map[string]any, []any:
		return sonic.MarshalString(in)
	default:
		return "", fmt.Errorf("unknown type: %T", in)
	}
}

func toInteger(in any) (any, error) {
	switch in := in.(type) {
	case []byte:
		return strconv.ParseInt(string(in), 10, 64)
	case string:
		return strconv.ParseInt(in, 10, 64)
	case int64:
		return in, nil
	case float64:
		return int64(in), nil
	case time.Time, bool:
		return nil, fmt.Errorf(`type '%T' can't convert to int64'`, in)
	default:
		return nil, fmt.Errorf("unknown type: %T", in)
	}

}

func toNumber(in any) (any, error) {
	switch in := in.(type) {
	case []byte:
		i, err := strconv.ParseFloat(string(in), 64)
		return i, err
	case string:
		return strconv.ParseFloat(in, 64)
	case int64:
		return float64(in), nil
	case float64:
		return in, nil
	case time.Time, bool:
		return nil, fmt.Errorf(`type '%T' can't convert to float64'`, in)
	default:
		return nil, fmt.Errorf("unknown type: %T", in)
	}
}

func toTime(in any) (any, error) {
	switch in := in.(type) {
	case []byte:
		return string(in), nil
	case string:
		return in, nil
	case int64:
		return strconv.FormatInt(in, 10), nil
	case float64:
		return strconv.FormatFloat(in, 'f', -1, 64), nil
	case time.Time:
		return in.Format(TimeFormat), nil
	case bool:
		if in {
			return "1", nil
		}
		return "0", nil
	default:
		return nil, fmt.Errorf("unknown type: %T", in)
	}
}

func toBool(in any) (any, error) {
	switch in := in.(type) {
	case []byte:
		return strconv.ParseBool(string(in))
	case string:
		return strconv.ParseBool(in)
	case int64:
		return strconv.ParseBool(strconv.FormatInt(in, 10))
	case float64:
		return strconv.ParseBool(strconv.FormatFloat(in, 'f', -1, 64))
	case time.Time:
		return strconv.ParseBool(in.Format(TimeFormat))
	case bool:
		return in, nil
	default:
		return nil, fmt.Errorf("unknown type: %T", in)
	}
}

// formatted convert the interface type according to the datatype type.
// notice: object is currently not supported by database, and ignore it.
func formatted(in any, ty *vo.TypeInfo) any {
	switch ty.Type {
	case vo.DataTypeString:
		r, err := toString(in)
		if err != nil {
			logs.Warnf("formatted string error: %v", err)
			return nil
		}
		return r
	case vo.DataTypeNumber:
		r, err := toNumber(in)
		if err != nil {
			logs.Warnf("formatted number error: %v", err)
			return nil
		}
		return r
	case vo.DataTypeInteger:
		r, err := toInteger(in)
		if err != nil {
			logs.Warnf("formatted integer error: %v", err)
			return nil
		}
		return r
	case vo.DataTypeBoolean:
		r, err := toBool(in)
		if err != nil {
			logs.Warnf("formatted boolean error: %v", err)
		}
		return r
	case vo.DataTypeTime:
		r, err := toTime(in)
		if err != nil {
			logs.Warnf("formatted time error: %v", err)
			return nil
		}
		return r
	case vo.DataTypeArray:
		arrayIn := make([]any, 0)
		inStr, err := toString(in)
		if err != nil {
			logs.Warnf("formatted array error: %v", err)
			return []any{}
		}

		err = sonic.UnmarshalString(inStr.(string), &arrayIn)
		if err != nil {
			logs.Warnf("formatted array unmarshal error: %v", err)
			return []any{}
		}
		result := make([]any, 0)
		switch ty.ElemTypeInfo.Type {
		case vo.DataTypeTime:
			for _, in := range arrayIn {
				r, err := toTime(in)
				if err != nil {
					logs.Warnf("formatted time: %v", err)
					continue
				}
				result = append(result, r)
			}
			return result
		case vo.DataTypeString:
			for _, in := range arrayIn {
				r, err := toString(in)
				if err != nil {
					logs.Warnf("formatted string failed: %v", err)
					continue
				}
				result = append(result, r)
			}
			return result
		case vo.DataTypeInteger:
			for _, in := range arrayIn {
				r, err := toInteger(in)
				if err != nil {
					logs.Warnf("formatted interger failed: %v", err)
					continue
				}
				result = append(result, r)
			}
			return result
		case vo.DataTypeBoolean:
			for _, in := range arrayIn {
				r, err := toBool(in)
				if err != nil {
					logs.Warnf("formatted bool failed: %v", err)
					continue
				}
				result = append(result, r)
			}
			return result
		case vo.DataTypeNumber:
			for _, in := range arrayIn {
				r, err := toNumber(in)
				if err != nil {
					logs.Warnf("formatted number failed: %v", err)
					continue
				}
				result = append(result, r)
			}
			return result
		case vo.DataTypeObject:
			properties := ty.ElemTypeInfo.Properties
			if len(properties) == 0 {
				for idx := range arrayIn {
					in := arrayIn[idx]
					if _, ok := in.(database.Object); ok {
						result = append(result, in)
					}
				}
				return result
			}

			for idx := range arrayIn {
				in := arrayIn[idx]
				object, ok := in.(database.Object)
				if !ok {
					object = make(database.Object)
					for key := range properties {
						object[key] = nil
					}
					result = append(result, object)
				} else {
					result = append(result, objectFormatted(ty.ElemTypeInfo.Properties, object))

				}
			}
			return result

		default:
			return nil
		}

	default:
		return nil
	}

}

func objectFormatted(props map[string]*vo.TypeInfo, object database.Object) map[string]any {
	ret := make(map[string]any)

	// if config is nil, it agrees to convert to string type as the default value
	if len(props) == 0 {
		for k, v := range object {
			val, err := toString(v)
			if err != nil {
				logs.Warnf("formatted string error: %v", err)
				continue
			}
			ret[k] = val

		}
		return ret
	}

	for k, v := range props {
		if r, ok := object[k]; ok && r != nil {
			formattedValue := formatted(r, v)
			ret[k] = formattedValue
		} else {
			// if key not existed, assign nil
			ret[k] = nil
		}
	}

	return ret
}

// responseFormatted convert the object list returned by "response" into the field mapping of the "config output" configuration,
// If the conversion fail, set the output list to null. If there are missing fields, set the missing fields to null.
func responseFormatted(configOutput map[string]*vo.TypeInfo, response *database.Response) (map[string]any, error) {
	ret := make(map[string]any)
	list := make([]any, 0, len(configOutput))

	outputListTypeInfo, ok := configOutput["outputList"]
	if !ok {
		return ret, fmt.Errorf("outputList key is required")
	}
	if outputListTypeInfo.Type != vo.DataTypeArray {
		return nil, fmt.Errorf("output list type info must array,but got %v", outputListTypeInfo.Type)
	}
	if outputListTypeInfo.ElemTypeInfo == nil {
		return nil, fmt.Errorf("output list must be an array and the array must contain element type info")
	}
	if outputListTypeInfo.ElemTypeInfo.Type != vo.DataTypeObject {
		return nil, fmt.Errorf("output list must be an array and element must object, but got %v", outputListTypeInfo.ElemTypeInfo.Type)
	}

	props := outputListTypeInfo.ElemTypeInfo.Properties

	for _, object := range response.Objects {
		list = append(list, objectFormatted(props, object))
	}

	ret[outputList] = list
	if response.RowNumber != nil {
		ret[rowNum] = *response.RowNumber
	} else {
		ret[rowNum] = nil
	}

	return ret, nil
}

func convertClauseGroupToConditionGroup(_ context.Context, clauseGroup *database.ClauseGroup, input map[string]any) (*database.ConditionGroup, error) {
	var (
		rightValue any
		ok         bool
	)

	conditionGroup := &database.ConditionGroup{
		Conditions: make([]*database.ConditionStr, 0),
		Relation:   database.ClauseRelationAND,
	}

	if clauseGroup.Single != nil {
		clause := clauseGroup.Single
		if !notNeedTakeMapValue(clause.Operator) {
			rightValue, ok = nodes.TakeMapValue(input, compose.FieldPath{"__condition_right_0"})
			if !ok {
				return nil, fmt.Errorf("cannot take single clause from input")
			}
		}

		conditionGroup.Conditions = append(conditionGroup.Conditions, &database.ConditionStr{
			Left:     clause.Left,
			Operator: clause.Operator,
			Right:    rightValue,
		})

	}

	if clauseGroup.Multi != nil {
		conditionGroup.Relation = clauseGroup.Multi.Relation

		conditionGroup.Conditions = make([]*database.ConditionStr, len(clauseGroup.Multi.Clauses))
		multiSelect := clauseGroup.Multi
		for idx, clause := range multiSelect.Clauses {
			if !notNeedTakeMapValue(clause.Operator) {
				rightValue, ok = nodes.TakeMapValue(input, compose.FieldPath{fmt.Sprintf("__condition_right_%d", idx)})
				if !ok {
					return nil, fmt.Errorf("cannot take multi clause from input")
				}
			}
			conditionGroup.Conditions[idx] = &database.ConditionStr{
				Left:     clause.Left,
				Operator: clause.Operator,
				Right:    rightValue,
			}

		}
	}

	return conditionGroup, nil
}

func convertClauseGroupToUpdateInventory(ctx context.Context, clauseGroup *database.ClauseGroup, input map[string]any) (*updateInventory, error) {
	conditionGroup, err := convertClauseGroupToConditionGroup(ctx, clauseGroup, input)
	if err != nil {
		return nil, err
	}
	fields := parseToInput(input)
	inventory := &updateInventory{
		ConditionGroup: conditionGroup,
		Fields:         fields,
	}
	return inventory, nil
}

func isDebugExecute(ctx context.Context) bool {
	execCtx := execute.GetExeCtx(ctx)
	if execCtx == nil {
		panic(fmt.Errorf("unable to get exe context"))
	}
	return execCtx.RootCtx.ExeCfg.Mode == workflowModel.ExecuteModeDebug || execCtx.RootCtx.ExeCfg.Mode == workflowModel.ExecuteModeNodeDebug
}

func getExecUserID(ctx context.Context) string {
	execCtx := execute.GetExeCtx(ctx)
	if execCtx == nil {
		panic(fmt.Errorf("unable to get exe context"))
	}
	if execCtx.RootCtx.ExeCfg.AgentID != nil {
		return execCtx.RootCtx.ExeCfg.ConnectorUID
	}
	uIDStr := strconv.FormatInt(execCtx.RootCtx.ExeCfg.Operator, 10)
	return uIDStr
}

func getConnectorID(ctx context.Context) int64 {
	execCtx := execute.GetExeCtx(ctx)
	if execCtx == nil {
		panic(fmt.Errorf("unable to get exe context"))
	}
	return execCtx.RootCtx.ExeCfg.ConnectorID
}

func parseToInput(input map[string]any) map[string]any {
	result := make(map[string]any, len(input))
	for key, value := range input {
		if strings.HasPrefix(key, "__setting_field_") {
			key = strings.TrimPrefix(key, "__setting_field_")
			result[key] = value
		}
	}
	return result
}
