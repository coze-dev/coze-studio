package database

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"
	"strconv"

	"github.com/cloudwego/eino/compose"
	"github.com/spf13/cast"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type DatasetOperator string
type ClauseRelation string

const rowNum = "rowNum"
const outputList = "outputList"

const (
	ClauseRelationAND ClauseRelation = "and"
	ClauseRelationOR  ClauseRelation = "or"
)

const (
	OperatorEqual          DatasetOperator = "="
	OperatorNotEqual       DatasetOperator = "!="
	OperatorGreater        DatasetOperator = ">"
	OperatorLesser         DatasetOperator = "<"
	OperatorGreaterOrEqual DatasetOperator = ">="
	OperatorLesserOrEqual  DatasetOperator = "<="
	OperatorIn             DatasetOperator = "in"
	OperatorNotIn          DatasetOperator = "not_in"
	OperatorIsNull         DatasetOperator = "is_null"
	OperatorIsNotNull      DatasetOperator = "is_not_null"
	OperatorLike           DatasetOperator = "like"
	OperatorNotLike        DatasetOperator = "not_like"
)

type OutputConfig struct {
	OutputList map[string]nodes.TypeInfo
}
type Object = map[string]any

type Response struct {
	RowNumber *int
	Objects   []Object
}

type ClauseGroup struct {
	Single *Clause
	Multi  *MultiClause
}
type Clause struct {
	Left     string
	Operator DatasetOperator
}
type MultiClause struct {
	Clauses  []*Clause
	Relation ClauseRelation
}

type Condition struct {
	Left     string
	Operator DatasetOperator
	Right    any
}

type ConditionGroup struct {
	Conditions []*Condition
	Relation   ClauseRelation
}

// formatted convert the interface type according to the datatype type.
// notice: object is currently not supported by database, and ignore it.
func formatted(in any, ty nodes.TypeInfo) (any, error) {
	switch ty.Type {
	case nodes.DataTypeString:
		r, err := cast.ToStringE(in)
		if err != nil {
			return nil, err
		}
		return r, nil
	case nodes.DataTypeNumber:
		r, err := cast.ToFloat64E(in)
		if err != nil {
			return nil, err
		}
		return r, nil
	case nodes.DataTypeInteger:
		r, err := cast.ToInt64E(in)
		if err != nil {
			return nil, err
		}
		return r, nil
	case nodes.DataTypeBoolean:
		r, err := cast.ToBoolE(in)
		if err != nil {
			return nil, err
		}
		return r, nil
	case nodes.DataTypeTime:
		r, err := cast.ToStringE(in)
		if err != nil {
			return nil, err
		}
		return r, nil
	case nodes.DataTypeArray:
		arrayIn := make([]any, 0)
		err := json.Unmarshal([]byte(cast.ToString(in)), &arrayIn)
		if err != nil {
			return nil, err
		}
		switch *ty.ElemType {
		case nodes.DataTypeTime:
			r, err := cast.ToStringSliceE(arrayIn)
			if err != nil {
				return nil, err
			}
			return r, nil
		case nodes.DataTypeString:
			r, err := cast.ToStringSliceE(arrayIn)
			if err != nil {
				return nil, err
			}
			return r, nil
		case nodes.DataTypeInteger:
			r, err := toInt64SliceE(arrayIn)
			if err != nil {
				return nil, err
			}
			return r, nil
		case nodes.DataTypeBoolean:
			r, err := cast.ToBoolSliceE(arrayIn)
			if err != nil {
				return nil, err
			}
			return r, nil

		case nodes.DataTypeNumber:
			r, err := toFloat64SliceE(arrayIn)
			if err != nil {
				return nil, err
			}
			return r, nil
		}
	}
	return nil, fmt.Errorf("unknown data type %v", ty.Type)

}

func objectFormatted(configOutput map[string]nodes.TypeInfo, object Object) (map[string]any, error) {
	ret := make(map[string]any)

	// if config is nil, it agrees to convert to string type as the default value
	if len(configOutput) == 0 {
		for k, v := range object {
			ret[k] = cast.ToString(v)
		}
		return ret, nil
	}

	for k, v := range configOutput {
		if r, ok := object[k]; ok {
			formattedValue, err := formatted(r, v)
			if err != nil {
				return nil, err
			}
			ret[k] = formattedValue
		} else {
			// if key not existed, assign nil
			ret[k] = nil
		}
	}

	return ret, nil
}

// responseFormatted convert the object list returned by "response" into the field mapping of the "config output" configuration,
// If the conversion fail, set the output list to null. If there are missing fields, set the missing fields to null.
func responseFormatted(configOutput map[string]nodes.TypeInfo, response *Response) (map[string]any, error) {
	ret := make(map[string]any)
	list := make([]Object, 0, len(configOutput))
	formattedFailed := false
	for _, object := range response.Objects {
		formattedObject, err := objectFormatted(configOutput, object)
		if err != nil {
			formattedFailed = true
			break
		}
		list = append(list, formattedObject)
	}
	if formattedFailed {
		ret[outputList] = nil
	} else {
		ret[outputList] = list
	}

	ret[rowNum] = response.RowNumber

	return ret, nil
}

func ConvertClauseGroupToConditionGroup(ctx context.Context, clauseGroup *ClauseGroup, input map[string]any) (*ConditionGroup, error) {
	var (
		rightValue any
		ok         bool
	)

	conditionGroup := &ConditionGroup{
		Conditions: make([]*Condition, 0),
		Relation:   ClauseRelationAND,
	}

	if clauseGroup.Single != nil {
		clause := clauseGroup.Single
		if !notNeedTakeMapValue(clause.Operator) {
			rightValue, ok = nodes.TakeMapValue(input, compose.FieldPath{"ClauseGroup", "Single", "Right"})
			if !ok {
				return nil, fmt.Errorf("cannot take single clause from input")
			}
		}
		conditionGroup.Conditions = append(conditionGroup.Conditions, &Condition{
			Left:     clause.Left,
			Operator: clause.Operator,
			Right:    rightValue,
		})

	}

	if clauseGroup.Multi != nil {
		conditionGroup.Relation = clauseGroup.Multi.Relation

		conditionGroup.Conditions = make([]*Condition, len(clauseGroup.Multi.Clauses))
		multiSelect := clauseGroup.Multi
		for idx, clause := range multiSelect.Clauses {
			if !notNeedTakeMapValue(clause.Operator) {
				rightValue, ok = nodes.TakeMapValue(input, compose.FieldPath{"ClauseGroup", "Multi", strconv.Itoa(idx), "Right"})
				if !ok {
					return nil, fmt.Errorf("cannot take multi clause from input")
				}
			}
			conditionGroup.Conditions[idx] = &Condition{
				Left:     clause.Left,
				Operator: clause.Operator,
				Right:    rightValue,
			}

		}
	}

	return conditionGroup, nil
}

func toInt64SliceE(i interface{}) ([]int64, error) {
	if i == nil {
		return []int64{}, fmt.Errorf("unable to cast %#v of type %T to []int", i, i)
	}
	switch v := i.(type) {
	case []int64:
		return v, nil
	}
	kind := reflect.TypeOf(i).Kind()
	switch kind {
	case reflect.Slice, reflect.Array:
		s := reflect.ValueOf(i)
		a := make([]int64, s.Len())
		for j := 0; j < s.Len(); j++ {
			val, err := cast.ToInt64E(s.Index(j).Interface())
			if err != nil {
				return []int64{}, fmt.Errorf("unable to cast %#v of type %T to []int", i, i)
			}
			a[j] = val
		}
		return a, nil
	default:
		return []int64{}, fmt.Errorf("unable to cast %#v of type %T to []int", i, i)
	}
}

func toFloat64SliceE(i interface{}) ([]float64, error) {
	if i == nil {
		return []float64{}, fmt.Errorf("unable to cast %#v of type %T to []int", i, i)
	}
	switch v := i.(type) {
	case []float64:
		return v, nil
	}
	kind := reflect.TypeOf(i).Kind()
	switch kind {
	case reflect.Slice, reflect.Array:
		s := reflect.ValueOf(i)
		a := make([]float64, s.Len())
		for j := 0; j < s.Len(); j++ {
			val, err := cast.ToFloat64E(s.Index(j).Interface())
			if err != nil {
				return []float64{}, fmt.Errorf("unable to cast %#v of type %T to []int", i, i)
			}
			a[j] = val
		}
		return a, nil
	default:
		return []float64{}, fmt.Errorf("unable to cast %#v of type %T to []int", i, i)
	}
}
