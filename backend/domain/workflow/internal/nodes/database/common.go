package database

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"github.com/cloudwego/eino/compose"
)

const rowNum = "rowNum"
const outputList = "outputList"

func objectFormatted(ctx context.Context, props map[string]*vo.TypeInfo, object database.Object) (map[string]any, error) {
	ret := make(map[string]any)
	const TimeFormat = "2006-01-02 15:04:05 -0700 MST"

	// if config is nil, it agrees to convert to string type as the default value
	if len(props) == 0 {
		for k, v := range object {
			switch v.(type) {
			case []byte:
				ret[k] = string(v.([]byte))
			case float64:
				ret[k] = strconv.FormatFloat(v.(float64), 'f', -1, 64)
			case bool:
				ret[k] = strconv.FormatBool(v.(bool))
			case time.Time:
				ret[k] = v.(time.Time).Format(TimeFormat)
			}
		}
		return ret, nil
	}

	for path, info := range props {
		if val, ok := object[path]; !ok {
			ret[path] = nil
		} else {
			var err error
			value, warnings, err := nodes.Convert(ctx, val, path, info, nodes.NeedReturnDefaultValue(vo.DataTypeArray, vo.DataTypeObject))
			if err != nil {
				return nil, err
			}

			if len(warnings) > 0 {
				logs.CtxWarnf(ctx, "convert inputs warnings: %v", warnings)
			}

			ret[path] = value
		}
	}

	return ret, nil
}

// responseFormatted convert the object list returned by "response" into the field mapping of the "config output" configuration,
// If the conversion fail, set the output list to null. If there are missing fields, set the missing fields to null.
func responseFormatted(ctx context.Context, configOutput map[string]*vo.TypeInfo, response *database.Response) (map[string]any, error) {
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
		result, err := objectFormatted(ctx, props, object)
		if err != nil {
			return nil, err
		}
		list = append(list, result)
	}

	ret[outputList] = list

	if response.RowNumber != nil {
		ret[rowNum] = *response.RowNumber
	} else {
		ret[rowNum] = nil
	}

	return ret, nil
}

func ConvertClauseGroupToConditionGroup(ctx context.Context, clauseGroup *database.ClauseGroup, input map[string]any) (*database.ConditionGroup, error) {
	var (
		rightValue any
		ok         bool
	)

	conditionGroup := &database.ConditionGroup{
		Conditions: make([]*database.Condition, 0),
		Relation:   database.ClauseRelationAND,
	}

	if clauseGroup.Single != nil {
		clause := clauseGroup.Single
		if !notNeedTakeMapValue(clause.Operator) {
			rightValue, ok = nodes.TakeMapValue(input, compose.FieldPath{"SingleRight"})
			if !ok {
				return nil, fmt.Errorf("cannot take single clause from input")
			}
		}

		conditionGroup.Conditions = append(conditionGroup.Conditions, &database.Condition{
			Left:     clause.Left,
			Operator: clause.Operator,
			Right:    rightValue,
		})

	}

	if clauseGroup.Multi != nil {
		conditionGroup.Relation = clauseGroup.Multi.Relation

		conditionGroup.Conditions = make([]*database.Condition, len(clauseGroup.Multi.Clauses))
		multiSelect := clauseGroup.Multi
		for idx, clause := range multiSelect.Clauses {
			if !notNeedTakeMapValue(clause.Operator) {
				rightValue, ok = nodes.TakeMapValue(input, compose.FieldPath{fmt.Sprintf("Multi_%d_Right", idx)})
				if !ok {
					return nil, fmt.Errorf("cannot take multi clause from input")
				}
			}
			conditionGroup.Conditions[idx] = &database.Condition{
				Left:     clause.Left,
				Operator: clause.Operator,
				Right:    rightValue,
			}

		}
	}

	return conditionGroup, nil
}

func ConvertClauseGroupToUpdateInventory(ctx context.Context, clauseGroup *database.ClauseGroup, input map[string]any) (*UpdateInventory, error) {
	conditionGroup, err := ConvertClauseGroupToConditionGroup(ctx, clauseGroup, input)
	if err != nil {
		return nil, err
	}

	f, ok := nodes.TakeMapValue(input, compose.FieldPath{"Fields"})
	if !ok {
		return nil, fmt.Errorf("cannot get key 'Fields' value from input")
	}

	fields, ok := f.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("fields expected to be map[string]any, but got %T", f)
	}

	inventory := &UpdateInventory{
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
	return execCtx.RootCtx.ExeCfg.Mode == vo.ExecuteModeDebug || execCtx.RootCtx.ExeCfg.Mode == vo.ExecuteModeNodeDebug
}

func getExecUserID(ctx context.Context) int64 {
	execCtx := execute.GetExeCtx(ctx)
	if execCtx == nil {
		panic(fmt.Errorf("unable to get exe context"))
	}
	return execCtx.RootCtx.ExeCfg.Operator
}
