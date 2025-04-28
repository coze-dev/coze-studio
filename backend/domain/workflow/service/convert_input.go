package service

import (
	"fmt"
	"strconv"
	"time"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

func convertInputs(in map[string]string, tInfo map[string]*vo.TypeInfo) (map[string]any, error) {
	out := make(map[string]any)
	for k, v := range in {
		t, ok := tInfo[k]
		if !ok {
			return nil, fmt.Errorf("input %s not found in type info", k)
		}
		switch t.Type {
		case vo.DataTypeString, vo.DataTypeFile, vo.DataTypeInteger, vo.DataTypeNumber, vo.DataTypeBoolean, vo.DataTypeTime:
			converted, err := convertSingleInput(v, t)
			if err != nil {
				return nil, err
			}
			out[k] = converted
		case vo.DataTypeObject:
			var m map[string]any
			err := sonic.UnmarshalString(v, &m)
			if err != nil {
				return nil, fmt.Errorf("failed to unmarshal input %s as object: %w", k, err)
			}
			converted, err := convertMapInput(m, t)
			if err != nil {
				return nil, err
			}
			out[k] = converted
		case vo.DataTypeArray:
			var a []any
			err := sonic.UnmarshalString(v, &a)
			if err != nil {
				return nil, fmt.Errorf("failed to unmarshal input %s as array: %w", k, err)
			}
			converted, err := convertArrInput(a, t)
			if err != nil {
				return nil, err
			}
			out[k] = converted
		default:
			return nil, fmt.Errorf("unknown input type %s", t.Type)
		}
	}
	return out, nil
}

func convertSingleInput(in string, t *vo.TypeInfo) (any, error) {
	switch t.Type {
	case vo.DataTypeString, vo.DataTypeFile:
		return in, nil
	case vo.DataTypeInteger:
		i, err := strconv.ParseInt(in, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("failed to parse input %s as integer: %w", in, err)
		}
		return i, nil
	case vo.DataTypeBoolean:
		b, err := strconv.ParseBool(in)
		if err != nil {
			return nil, fmt.Errorf("failed to parse input %s as boolean: %w", in, err)
		}
		return b, nil
	case vo.DataTypeNumber:
		f, err := strconv.ParseFloat(in, 64)
		if err != nil {
			return nil, fmt.Errorf("failed to parse input %s as float: %w", in, err)
		}
		return f, nil
	case vo.DataTypeTime:
		t, err := time.Parse(time.DateTime, in)
		if err != nil {
			return nil, fmt.Errorf("failed to parse input %s as time: %w", in, err)
		}
		return t, nil
	default:
		return nil, fmt.Errorf("not a single input type %s", t.Type)
	}
}

func convertArrInput(in []any, t *vo.TypeInfo) ([]any, error) {
	out := make([]any, len(in))
	for i := range in {
		switch t.ElemTypeInfo.Type {
		case vo.DataTypeString, vo.DataTypeBoolean, vo.DataTypeNumber, vo.DataTypeFile:
			out[i] = in[i]
		case vo.DataTypeInteger:
			out[i] = int64(in[i].(float64))
		case vo.DataTypeTime:
			t, err := time.Parse(time.DateTime, in[i].(string))
			if err != nil {
				return nil, fmt.Errorf("failed to parse input %s as time: %w", in[i], err)
			}
			out[i] = t
		case vo.DataTypeObject:
			newM, err := convertMapInput(in[i].(map[string]any), t.ElemTypeInfo)
			if err != nil {
				return nil, err
			}
			out[i] = newM
		case vo.DataTypeArray:
			newA, err := convertArrInput(in[i].([]any), t.ElemTypeInfo)
			if err != nil {
				return nil, err
			}
			out[i] = newA
		default:
			return nil, fmt.Errorf("unknown input type %s", t.ElemTypeInfo.Type)
		}
	}
	return out, nil
}

func convertMapInput(in map[string]any, t *vo.TypeInfo) (map[string]any, error) {
	out := make(map[string]any)
	for k, v := range in {
		t, ok := t.Properties[k]
		if !ok {
			return nil, fmt.Errorf("input %s not found in type info", k)
		}
		switch t.Type {
		case vo.DataTypeString, vo.DataTypeBoolean, vo.DataTypeNumber, vo.DataTypeFile:
			out[k] = v
		case vo.DataTypeInteger:
			out[k] = int64(v.(float64))
		case vo.DataTypeTime:
			ti, err := time.Parse(time.DateTime, v.(string))
			if err != nil {
				return nil, fmt.Errorf("failed to parse input %s as time: %w", v, err)
			}
			out[k] = ti
		case vo.DataTypeObject:
			newM, err := convertMapInput(v.(map[string]any), t)
			if err != nil {
				return nil, err
			}
			out[k] = newM
		case vo.DataTypeArray:
			newA, err := convertArrInput(v.([]any), t)
			if err != nil {
				return nil, err
			}
			out[k] = newA
		default:
			return nil, fmt.Errorf("unknown input type %s", t.Type)
		}
	}
	return out, nil
}
