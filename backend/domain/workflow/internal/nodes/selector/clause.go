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

package selector

import (
	"fmt"
	"reflect"
	"strings"
)

type Predicate interface {
	Resolve() (bool, error)
}

type Clause struct {
	LeftOperant  any
	Op           Operator
	RightOperant any
}

type MultiClause struct {
	Clauses  []*Clause
	Relation ClauseRelation
}

func (c *Clause) Resolve() (bool, error) {
	leftV := c.LeftOperant
	rightV := c.RightOperant

	leftT := reflect.TypeOf(leftV)
	rightT := reflect.TypeOf(rightV)

	if err := c.Op.WillAccept(leftT, rightT); err != nil {
		return false, err
	}

	switch c.Op {
	case OperatorEqual:
		if leftV == nil && rightV == nil {
			return true, nil
		}

		if leftV == nil || rightV == nil {
			return false, nil
		}

		leftV, rightV = alignNumberTypes(leftV, rightV, leftT, rightT)
		return leftV == rightV, nil
	case OperatorNotEqual:
		if leftV == nil && rightV == nil {
			return false, nil
		}

		if leftV == nil || rightV == nil {
			return true, nil
		}

		leftV, rightV = alignNumberTypes(leftV, rightV, leftT, rightT)
		return leftV != rightV, nil
	case OperatorEmpty:
		if leftV == nil {
			return true, nil
		}

		if leftArray, ok := leftV.([]any); ok {
			return len(leftArray) == 0, nil
		}

		if leftObj, ok := leftV.(map[string]any); ok {
			return len(leftObj) == 0, nil
		}

		if leftStr, ok := leftV.(string); ok {
			return len(leftStr) == 0 || leftStr == "None", nil
		}

		if leftInt, ok := leftV.(int64); ok {
			return leftInt == 0, nil
		}

		if leftFloat, ok := leftV.(float64); ok {
			return leftFloat == 0, nil
		}

		if leftBool, ok := leftV.(bool); ok {
			return !leftBool, nil
		}

		return false, nil
	case OperatorNotEmpty:
		empty, err := (&Clause{LeftOperant: leftV, Op: OperatorEmpty}).Resolve()
		return !empty, err
	case OperatorGreater:
		if leftV == nil {
			return false, nil
		}

		if rightV == nil {
			return true, nil
		}

		leftV, rightV = alignNumberTypes(leftV, rightV, leftT, rightT)
		if reflect.TypeOf(leftV).Kind() == reflect.Float64 {
			return leftV.(float64) > rightV.(float64), nil
		}
		return leftV.(int64) > rightV.(int64), nil
	case OperatorGreaterOrEqual:
		if leftV == nil {
			if rightV == nil {
				return true, nil
			}
			return false, nil
		}

		if rightV == nil {
			return true, nil
		}

		leftV, rightV = alignNumberTypes(leftV, rightV, leftT, rightT)
		if reflect.TypeOf(leftV).Kind() == reflect.Float64 {
			return leftV.(float64) >= rightV.(float64), nil
		}
		return leftV.(int64) >= rightV.(int64), nil
	case OperatorLesser:
		if leftV == nil {
			if rightV == nil {
				return false, nil
			}
			return true, nil
		}

		if rightV == nil {
			return false, nil
		}

		leftV, rightV = alignNumberTypes(leftV, rightV, leftT, rightT)
		if reflect.TypeOf(leftV).Kind() == reflect.Float64 {
			return leftV.(float64) < rightV.(float64), nil
		}
		return leftV.(int64) < rightV.(int64), nil
	case OperatorLesserOrEqual:
		if leftV == nil {
			return true, nil
		}

		if rightV == nil {
			return false, nil
		}

		leftV, rightV = alignNumberTypes(leftV, rightV, leftT, rightT)
		if reflect.TypeOf(leftV).Kind() == reflect.Float64 {
			return leftV.(float64) <= rightV.(float64), nil
		}
		return leftV.(int64) <= rightV.(int64), nil
	case OperatorIsTrue:
		if leftV == nil {
			return false, nil
		}

		return leftV.(bool), nil
	case OperatorIsFalse:
		if leftV == nil {
			return true, nil
		}

		return !leftV.(bool), nil
	case OperatorLengthGreater:
		if leftV == nil {
			return false, nil
		}

		return int64(reflect.ValueOf(leftV).Len()) > rightV.(int64), nil
	case OperatorLengthGreaterOrEqual:
		if leftV == nil {
			if rightV.(int64) == 0 {
				return true, nil
			}
			return false, nil
		}

		return int64(reflect.ValueOf(leftV).Len()) >= rightV.(int64), nil
	case OperatorLengthLesser:
		if leftV == nil {
			if rightV.(int64) == 0 {
				return false, nil
			}
			return true, nil
		}

		return int64(reflect.ValueOf(leftV).Len()) < rightV.(int64), nil
	case OperatorLengthLesserOrEqual:
		if leftV == nil {
			return true, nil
		}

		return int64(reflect.ValueOf(leftV).Len()) <= rightV.(int64), nil
	case OperatorContain:
		if leftV == nil { // treat it as empty slice
			return false, nil
		}

		if leftT.Kind() == reflect.String {
			return strings.Contains(fmt.Sprintf("%v", leftV), rightV.(string)), nil
		}

		leftValue := reflect.ValueOf(leftV)
		for i := 0; i < leftValue.Len(); i++ {
			elem := leftValue.Index(i).Interface()
			if elem == rightV {
				return true, nil
			}
		}

		return false, nil
	case OperatorNotContain:
		if leftV == nil { // treat it as empty slice
			return false, nil
		}

		if leftT.Kind() == reflect.String {
			return !strings.Contains(fmt.Sprintf("%v", leftV), rightV.(string)), nil
		}

		leftValue := reflect.ValueOf(leftV)
		for i := 0; i < leftValue.Len(); i++ {
			elem := leftValue.Index(i).Interface()
			if elem == rightV {
				return false, nil
			}
		}

		return true, nil
	case OperatorContainKey:
		if leftV == nil { // treat it as empty map
			return false, nil
		}

		if leftT.Kind() == reflect.Map {
			leftValue := reflect.ValueOf(leftV)
			for _, key := range leftValue.MapKeys() {
				if key.Interface() == rightV {
					return true, nil
				}
			}
		} else { // struct, unreachable now
			for i := 0; i < leftT.NumField(); i++ {
				field := leftT.Field(i)
				if field.IsExported() {
					tag := field.Tag.Get("json")
					if tag == rightV {
						return true, nil
					}
				}
			}
		}

		return false, nil
	case OperatorNotContainKey:
		if leftV == nil { // treat it as empty map
			return false, nil
		}

		if leftT.Kind() == reflect.Map {
			leftValue := reflect.ValueOf(leftV)
			for _, key := range leftValue.MapKeys() {
				if key.Interface() == rightV {
					return false, nil
				}
			}
		} else { // struct, unreachable now
			for i := 0; i < leftT.NumField(); i++ {
				field := leftT.Field(i)
				if field.IsExported() {
					tag := field.Tag.Get("json")
					if tag == rightV {
						return false, nil
					}
				}
			}
		}

		return true, nil
	default:
		return false, fmt.Errorf("unknown operator: %v", c.Op)
	}
}

func (mc *MultiClause) Resolve() (bool, error) {
	if mc.Relation == ClauseRelationAND {
		for _, clause := range mc.Clauses {
			isTrue, err := clause.Resolve()
			if err != nil {
				return false, err
			}
			if !isTrue {
				return false, nil
			}
		}
		return true, nil
	} else if mc.Relation == ClauseRelationOR {
		for _, clause := range mc.Clauses {
			isTrue, err := clause.Resolve()
			if err != nil {
				return false, err
			}
			if isTrue {
				return true, nil
			}
		}
		return false, nil
	} else {
		return false, fmt.Errorf("unknown relation: %v", mc.Relation)
	}
}

func alignNumberTypes(leftV, rightV any, leftT, rightT reflect.Type) (any, any) {
	if leftT == reflect.TypeOf(int64(0)) {
		if rightT == reflect.TypeOf(float64(0)) {
			leftV = float64(leftV.(int64))
		}
	} else if leftT == reflect.TypeOf(float64(0)) {
		if rightT == reflect.TypeOf(int64(0)) {
			rightV = float64(rightV.(int64))
		}
	}

	return leftV, rightV
}
