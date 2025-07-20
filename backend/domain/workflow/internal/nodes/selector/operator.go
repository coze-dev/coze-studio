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

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

type Operator string

const (
	OperatorEqual                Operator = "="
	OperatorNotEqual             Operator = "!="
	OperatorEmpty                Operator = "empty"
	OperatorNotEmpty             Operator = "not_empty"
	OperatorGreater              Operator = ">"
	OperatorGreaterOrEqual       Operator = ">="
	OperatorLesser               Operator = "<"
	OperatorLesserOrEqual        Operator = "<="
	OperatorIsTrue               Operator = "true"
	OperatorIsFalse              Operator = "false"
	OperatorLengthGreater        Operator = "len >"
	OperatorLengthGreaterOrEqual Operator = "len >="
	OperatorLengthLesser         Operator = "len <"
	OperatorLengthLesserOrEqual  Operator = "len <="
	OperatorContain              Operator = "contain"
	OperatorNotContain           Operator = "not_contain"
	OperatorContainKey           Operator = "contain_key"
	OperatorNotContainKey        Operator = "not_contain_key"
)

func (o *Operator) WillAccept(leftT, rightT reflect.Type) error {
	switch *o {
	case OperatorEqual, OperatorNotEqual:
		if leftT == nil || rightT == nil {
			return nil
		}

		if leftT != reflect.TypeOf(int64(0)) && leftT != reflect.TypeOf(float64(0)) && leftT.Kind() != reflect.Bool && leftT.Kind() != reflect.String {
			return fmt.Errorf("operator %v only accepts int64, float64, bool or string, not %v", *o, leftT)
		}

		if leftT.Kind() == reflect.Bool || leftT.Kind() != reflect.String {
			if leftT != rightT {
				return fmt.Errorf("operator %v left operant and right operant must be same type: %v, %v", *o, leftT, rightT)
			}
		}

		if leftT == reflect.TypeOf(int64(0)) || leftT == reflect.TypeOf(float64(0)) {
			if rightT != reflect.TypeOf(int64(0)) && rightT != reflect.TypeOf(float64(0)) {
				return fmt.Errorf("operator %v right operant must be int64 or float64, not %v", *o, rightT)
			}
		}
	case OperatorEmpty, OperatorNotEmpty:
		if rightT != nil {
			return fmt.Errorf("operator %v does not accept non-nil right operant: %v", *o, rightT)
		}
	case OperatorGreater, OperatorGreaterOrEqual, OperatorLesser, OperatorLesserOrEqual:
		if leftT == nil {
			return nil
		}

		if leftT != reflect.TypeOf(int64(0)) && leftT != reflect.TypeOf(float64(0)) {
			return fmt.Errorf("operator %v only accepts float64 or int64, not %v", *o, leftT)
		}
	case OperatorIsTrue, OperatorIsFalse:
		if leftT == nil {
			return nil
		}

		if rightT != nil {
			return fmt.Errorf("operator %v does not accept non-nil right operant: %v", *o, rightT)
		}

		if leftT.Kind() != reflect.Bool {
			return fmt.Errorf("operator %v only accepts boolean, not %v", *o, leftT)
		}
	case OperatorLengthGreater, OperatorLengthGreaterOrEqual, OperatorLengthLesser, OperatorLengthLesserOrEqual:
		if leftT == nil {
			return nil
		}

		if leftT.Kind() != reflect.String && leftT.Kind() != reflect.Slice {
			return fmt.Errorf("operator %v left operant only accepts string or slice, not %v", *o, leftT)
		}
		if rightT != reflect.TypeOf(int64(0)) {
			return fmt.Errorf("operator %v right operant only accepts int64, not %v", *o, rightT)
		}
	case OperatorContain, OperatorNotContain:
		if leftT == nil {
			return nil
		}

		switch leftT.Kind() {
		case reflect.String:
			if rightT.Kind() != reflect.String {
				return fmt.Errorf("operator %v whose left operant is string only accepts right operant of string, not %v", *o, rightT)
			}
		case reflect.Slice:
			elemType := leftT.Elem()
			if !rightT.AssignableTo(elemType) {
				return fmt.Errorf("operator %v whose left operant is slice only accepts right operant of corresponding element type %v, not %v", *o, elemType, rightT)
			}
		default:
			return fmt.Errorf("operator %v only accepts left operant of string or slice, not %v", *o, leftT)
		}
	case OperatorContainKey, OperatorNotContainKey:
		if leftT == nil { // treat it as empty map
			return nil
		}
		if leftT.Kind() != reflect.Map {
			return fmt.Errorf("operator %v only accepts left operant of map, not %v", *o, leftT)
		}
		if rightT.Kind() != reflect.String {
			return fmt.Errorf("operator %v only accepts right operant of string, not %v", *o, rightT)
		}
	default:
		return fmt.Errorf("unknown operator: %d", o)
	}

	return nil
}

func (o *Operator) ToCanvasOperatorType() vo.OperatorType {
	switch *o {
	case OperatorEqual:
		return vo.Equal
	case OperatorNotEqual:
		return vo.NotEqual
	case OperatorEmpty:
		return vo.Empty
	case OperatorNotEmpty:
		return vo.NotEmpty
	case OperatorGreater:
		return vo.GreaterThan
	case OperatorGreaterOrEqual:
		return vo.GreaterThanEqual
	case OperatorLesser:
		return vo.LessThan
	case OperatorLesserOrEqual:
		return vo.LessThanEqual
	case OperatorIsTrue:
		return vo.True
	case OperatorIsFalse:
		return vo.False
	case OperatorLengthGreater:
		return vo.LengthGreaterThan
	case OperatorLengthGreaterOrEqual:
		return vo.LengthGreaterThanEqual
	case OperatorLengthLesser:
		return vo.LengthLessThan
	case OperatorLengthLesserOrEqual:
		return vo.LengthLessThanEqual
	case OperatorContain:
		return vo.Contain
	case OperatorNotContain:
		return vo.NotContain
	case OperatorContainKey:
		return vo.Contain
	case OperatorNotContainKey:
		return vo.NotContain
	default:
		panic(fmt.Sprintf("unknown operator: %+v", o))
	}
}
