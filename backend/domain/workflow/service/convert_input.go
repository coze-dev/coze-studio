package service

import (
	"fmt"
	"strconv"
	"time"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

func convertInputs(in map[string]string, tInfo map[string]*nodes.TypeInfo) (map[string]any, error) {
	out := make(map[string]any)
	for k, v := range in {
		t, ok := tInfo[k]
		if !ok {
			return nil, fmt.Errorf("input %s not found in type info", k)
		}
		switch t.Type {
		case nodes.DataTypeString, nodes.DataTypeFile, nodes.DataTypeInteger, nodes.DataTypeNumber, nodes.DataTypeBoolean, nodes.DataTypeTime:
			converted, err := convertSingleInput(v, t)
			if err != nil {
				return nil, err
			}
			out[k] = converted
		case nodes.DataTypeObject:
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
		case nodes.DataTypeArray:
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

func convertSingleInput(in string, t *nodes.TypeInfo) (any, error) {
	switch t.Type {
	case nodes.DataTypeString, nodes.DataTypeFile:
		return in, nil
	case nodes.DataTypeInteger:
		i, err := strconv.ParseInt(in, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("failed to parse input %s as integer: %w", in, err)
		}
		return i, nil
	case nodes.DataTypeBoolean:
		b, err := strconv.ParseBool(in)
		if err != nil {
			return nil, fmt.Errorf("failed to parse input %s as boolean: %w", in, err)
		}
		return b, nil
	case nodes.DataTypeNumber:
		f, err := strconv.ParseFloat(in, 64)
		if err != nil {
			return nil, fmt.Errorf("failed to parse input %s as float: %w", in, err)
		}
		return f, nil
	case nodes.DataTypeTime:
		t, err := time.Parse(time.DateTime, in)
		if err != nil {
			return nil, fmt.Errorf("failed to parse input %s as time: %w", in, err)
		}
		return t, nil
	default:
		return nil, fmt.Errorf("not a single input type %s", t.Type)
	}
}

func convertArrInput(in []any, t *nodes.TypeInfo) ([]any, error) {
	out := make([]any, len(in))
	for i := range in {
		switch t.ElemTypeInfo.Type {
		case nodes.DataTypeString, nodes.DataTypeBoolean, nodes.DataTypeNumber, nodes.DataTypeFile:
			out[i] = in[i]
		case nodes.DataTypeInteger:
			out[i] = int64(in[i].(float64))
		case nodes.DataTypeTime:
			t, err := time.Parse(time.DateTime, in[i].(string))
			if err != nil {
				return nil, fmt.Errorf("failed to parse input %s as time: %w", in[i], err)
			}
			out[i] = t
		case nodes.DataTypeObject:
			newM, err := convertMapInput(in[i].(map[string]any), t.ElemTypeInfo)
			if err != nil {
				return nil, err
			}
			out[i] = newM
		case nodes.DataTypeArray:
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

func convertMapInput(in map[string]any, t *nodes.TypeInfo) (map[string]any, error) {
	out := make(map[string]any)
	for k, v := range in {
		t, ok := t.Properties[k]
		if !ok {
			return nil, fmt.Errorf("input %s not found in type info", k)
		}
		switch t.Type {
		case nodes.DataTypeString, nodes.DataTypeBoolean, nodes.DataTypeNumber, nodes.DataTypeFile:
			out[k] = v
		case nodes.DataTypeInteger:
			out[k] = int64(v.(float64))
		case nodes.DataTypeTime:
			ti, err := time.Parse(time.DateTime, v.(string))
			if err != nil {
				return nil, fmt.Errorf("failed to parse input %s as time: %w", v, err)
			}
			out[k] = ti
		case nodes.DataTypeObject:
			newM, err := convertMapInput(v.(map[string]any), t)
			if err != nil {
				return nil, err
			}
			out[k] = newM
		case nodes.DataTypeArray:
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
