package code

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cast"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type WarnError struct {
	errs []error
}

func (e *WarnError) Error() string {
	sb := new(strings.Builder)
	for index, err := range e.errs {

		if index == len(e.errs)-1 {
			sb.WriteString(err.Error())
		} else {
			sb.WriteString(err.Error() + ", ")
		}
	}
	return sb.String()
}

func codeResponseFormatted(key string, in any, ty *vo.TypeInfo) (any, *WarnError) {
	var warnError = &WarnError{errs: make([]error, 0)}

	switch ty.Type {
	case vo.DataTypeString:
		// []any and map[string]any convert to string use marshal
		if _, ok := in.([]any); ok {
			bs, _ := json.Marshal(in)
			return string(bs), warnError
		}

		if _, ok := in.(map[string]any); ok {
			bs, _ := json.Marshal(in)
			return string(bs), warnError
		}
		r, err := cast.ToStringE(in)
		if err != nil {
			warnError.errs = append(warnError.errs, fmt.Errorf("field %v is not a string", key))
			return nil, warnError
		}

		return r, warnError
	case vo.DataTypeNumber:
		r, err := cast.ToFloat64E(in)
		if err != nil {
			warnError.errs = append(warnError.errs, fmt.Errorf("field %v is not a number", key))
			return nil, warnError
		}
		return r, warnError
	case vo.DataTypeInteger:
		r, err := cast.ToInt64E(in)
		if err != nil {
			warnError.errs = append(warnError.errs, fmt.Errorf("field %v is not a integer", key))
			return nil, warnError
		}
		return r, warnError
	case vo.DataTypeBoolean:
		r, err := cast.ToBoolE(in)
		if err != nil {
			warnError.errs = append(warnError.errs, fmt.Errorf("field %v is not a boolean", key))
			return nil, warnError
		}
		return r, warnError
	case vo.DataTypeTime:
		r, err := cast.ToStringE(in)
		if err != nil {
			warnError.errs = append(warnError.errs, fmt.Errorf("field %v is not a time format", key))
			return nil, warnError
		}
		return r, warnError
	case vo.DataTypeArray:
		arrayIn := make([]any, 0)
		switch in.(type) {
		case []any:
			arrayIn = in.([]any)
		case string:
			err := json.Unmarshal([]byte(in.(string)), &arrayIn)
			if err != nil {
				warnError.errs = append(warnError.errs, fmt.Errorf("field %v is not a array", key))
				return nil, warnError
			}
		case []byte:
			err := json.Unmarshal(in.([]byte), &arrayIn)
			if err != nil {
				warnError.errs = append(warnError.errs, fmt.Errorf("field %v is not a array", key))
				return nil, warnError
			}
		default:
			warnError.errs = append(warnError.errs, fmt.Errorf("field %v is not a array", key))
			return nil, warnError
		}
		switch ty.ElemTypeInfo.Type {
		case vo.DataTypeTime, vo.DataTypeString:
			r := make([]string, 0, len(arrayIn))
			for idx, a := range arrayIn {
				v, err := cast.ToStringE(a)
				if err != nil {
					warnError.errs = append(warnError.errs, fmt.Errorf("field %v.%v is not a string", key, idx))
					continue
				}
				r = append(r, v)
			}
			if len(r) == 0 {
				return nil, warnError
			}
			return r, warnError
		case vo.DataTypeInteger:
			r := make([]int64, 0)
			for idx, a := range arrayIn {
				v, err := cast.ToInt64E(a)
				if err != nil {
					warnError.errs = append(warnError.errs, fmt.Errorf("field %v.%v is not a integer", key, idx))
					continue
				}
				r = append(r, v)
			}
			if len(r) == 0 {
				return nil, warnError
			}
			return r, warnError
		case vo.DataTypeBoolean:
			r := make([]bool, 0)
			for idx, a := range arrayIn {
				v, err := cast.ToBoolE(a)
				if err != nil {
					warnError.errs = append(warnError.errs, fmt.Errorf("field %v.%v is not a boolean", key, idx))
					continue
				}
				r = append(r, v)
			}
			if len(r) == 0 {
				return nil, warnError
			}
			return r, warnError
		case vo.DataTypeNumber:
			r := make([]float64, 0)
			for idx, a := range arrayIn {
				v, err := cast.ToFloat64E(a)
				if err != nil {
					warnError.errs = append(warnError.errs, fmt.Errorf("field %v.%v is not a number", key, idx))
					continue
				}
				r = append(r, v)
			}
			if len(r) == 0 {
				return nil, warnError
			}
			return r, warnError
		case vo.DataTypeObject:
			r, wErrors := codeResponseFormatted(key, cast.ToString(in), ty)
			warnError.errs = append(warnError.errs, wErrors.errs...)
			return r, warnError
		default:
			return nil, warnError
		}
	case vo.DataTypeObject:
		object := make(map[string]any)
		switch in.(type) {
		case map[string]any:
			object = in.(map[string]any)
		case string:
			err := json.Unmarshal([]byte(in.(string)), &object)
			if err != nil {
				warnError.errs = append(warnError.errs, fmt.Errorf("field %v is not a object", key))
			}
		case []byte:
			err := json.Unmarshal(in.([]byte), &object)
			if err != nil {
				warnError.errs = append(warnError.errs, fmt.Errorf("field %v is not a object", key))
			}
		default:
			warnError.errs = append(warnError.errs, fmt.Errorf("field %v is not a object", key))
		}
		if len(ty.Properties) == 0 {
			return object, warnError
		}
		r := make(map[string]any, len(object))
		for k, tInfo := range ty.Properties {
			r[k] = nil
			if a, ok := object[k]; ok {
				anyValue, wErrors := codeResponseFormatted(fmt.Sprintf("%v.%v", key, k), a, tInfo)
				warnError.errs = append(warnError.errs, wErrors.errs...)
				r[k] = anyValue
			}
		}
		return r, warnError
	default:
		panic(fmt.Sprintf("unexpected data type %v", ty.Type))
	}

}
