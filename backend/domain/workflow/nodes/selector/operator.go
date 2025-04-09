package selector

import (
	"fmt"
	"reflect"
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
		if leftT != reflect.TypeOf(0) && leftT != reflect.TypeOf(float64(0)) && leftT.Kind() != reflect.Bool && leftT.Kind() != reflect.String {
			return fmt.Errorf("operator %v only accepts int, float64, bool or string, not %v", *o, leftT)
		}
		if leftT != rightT {
			return fmt.Errorf("operator %v operant types not match: %s != %s", *o, leftT, rightT)
		}
	case OperatorEmpty, OperatorNotEmpty:
		if rightT != nil {
			return fmt.Errorf("operator %v does not accept non-nil right operant: %v", *o, rightT)
		}

		if leftT != nil {
			if leftT.Kind() == reflect.Ptr {
				leftT = leftT.Elem()
			}

			if leftT.Kind() != reflect.Struct && leftT.Kind() != reflect.Map && leftT.Kind() != reflect.Slice {
				return fmt.Errorf("operator %v only accepts struct, map or slice, not %v", *o, leftT)
			}
		}
	case OperatorGreater, OperatorGreaterOrEqual, OperatorLesser, OperatorLesserOrEqual:
		if leftT != reflect.TypeOf(0) && leftT != reflect.TypeOf(float64(0)) {
			return fmt.Errorf("operator %v only accepts float64, int or slice, not %v", *o, leftT)
		}
		if leftT != rightT {
			return fmt.Errorf("operator %v operant types not match: %s != %s", *o, leftT, rightT)
		}
	case OperatorIsTrue, OperatorIsFalse:
		if rightT != nil {
			return fmt.Errorf("operator %v does not accept non-nil right operant: %v", *o, rightT)
		}

		if leftT.Kind() != reflect.Bool {
			return fmt.Errorf("operator %v only accepts boolean, not %v", *o, leftT)
		}
	case OperatorLengthGreater, OperatorLengthGreaterOrEqual, OperatorLengthLesser, OperatorLengthLesserOrEqual:
		if leftT.Kind() != reflect.String && leftT.Kind() != reflect.Slice {
			return fmt.Errorf("operator %v left operant only accepts string or slice, not %v", *o, leftT)
		}
		if rightT != reflect.TypeOf(0) {
			return fmt.Errorf("operator %v right operant only accepts int, not %v", *o, rightT)
		}
	case OperatorContain, OperatorNotContain:
		switch leftT.Kind() {
		case reflect.String:
			if rightT.Kind() != reflect.String {
				return fmt.Errorf("operator %v whose left operant is string only accepts right operant of string, not %v", *o, rightT)
			}
		case reflect.Slice:
			elemType := leftT.Elem()
			if elemType.Kind() != rightT.Kind() { // string, number, integer, bool, map, struct
				return fmt.Errorf("operator %v whose left operant is slice only accepts right operant of corresponding element type %v, not %v", *o, elemType, rightT)
			}
		default:
			return fmt.Errorf("operator %v only accepts left operant of string or slice, not %v", *o, leftT)
		}
	case OperatorContainKey, OperatorNotContainKey:
		if leftT.Kind() == reflect.Ptr {
			leftT = leftT.Elem()
		}
		if leftT.Kind() != reflect.Struct && leftT.Kind() != reflect.Map {
			return fmt.Errorf("operator %v only accepts left operant of struct or map, not %v", *o, leftT)
		}
		if rightT.Kind() != reflect.String {
			return fmt.Errorf("operator %v only accepts right operant of string, not %v", *o, rightT)
		}
	default:
		return fmt.Errorf("unknown operator: %d", o)
	}

	return nil
}
