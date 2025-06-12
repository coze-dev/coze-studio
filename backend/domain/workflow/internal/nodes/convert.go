package nodes

import (
	"fmt"
	"strconv"
	"time"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func ConvertInputs(in map[string]any, tInfo map[string]*vo.TypeInfo) (map[string]any, error) {
	out := make(map[string]any)
	for k, v := range in {
		t, ok := tInfo[k]
		if !ok {
			// for input fields not explicitly defined, just pass the string value through
			logs.Warnf("input %s not found in type info", k)
			out[k] = in[k]
			continue
		}

		converted, err := Convert(v, t)
		if err != nil {
			return nil, err
		}
		out[k] = converted
	}

	return out, nil
}

func Convert(in any, t *vo.TypeInfo) (out any, err error) {
	switch t.Type {
	case vo.DataTypeString, vo.DataTypeFile, vo.DataTypeTime, vo.DataTypeInteger, vo.DataTypeNumber, vo.DataTypeBoolean:
		return convertSingleInput(in, t)
	case vo.DataTypeObject:
		vMap, ok := in.(map[string]any)
		if !ok {
			vStr, ok := in.(string)
			if !ok {
				return nil, fmt.Errorf("map input is not a map or string: %v", in)
			}
			err := sonic.UnmarshalString(vStr, &vMap)
			if err != nil {
				return nil, fmt.Errorf("failed to unmarshal input as object: %w", err)
			}
		}
		return convertMapInput(vMap, t)
	case vo.DataTypeArray:
		vArr, ok := in.([]any)
		if !ok {
			vStr, ok := in.(string)
			if !ok {
				return nil, fmt.Errorf("array input is not a array or string: %v", in)
			}
			err := sonic.UnmarshalString(vStr, &vArr)
			if err != nil {
				return nil, fmt.Errorf("failed to unmarshal input as array: %w", err)
			}
		}

		return convertArrInput(vArr, t)
	default:
		return nil, fmt.Errorf("unknown input type %s", t.Type)
	}
}

func convertSingleInput(in any, t *vo.TypeInfo) (out any, err error) {
	switch t.Type {
	case vo.DataTypeString, vo.DataTypeFile:
		return in.(string), nil
	case vo.DataTypeInteger:
		var i int64
		switch in.(type) {
		case int64:
			i = in.(int64)
		case float64:
			i = int64(in.(float64))
		case string:
			i, err = strconv.ParseInt(in.(string), 10, 64)
			if err != nil {
				return nil, fmt.Errorf("failed to parse input %s as integer: %w", in, err)
			}
		default:
			return nil, fmt.Errorf("unsupported integer value %v", in)
		}
		return i, nil
	case vo.DataTypeBoolean:
		var b bool
		switch in.(type) {
		case bool:
			b = in.(bool)
		case string:
			b, err = strconv.ParseBool(in.(string))
			if err != nil {
				return nil, fmt.Errorf("failed to parse input %s as boolean: %w", in.(string), err)
			}
		case float64:
			b = in.(float64) != 0
		default:
			return nil, fmt.Errorf("unsupported bool value %v", in)
		}
		return b, nil
	case vo.DataTypeNumber:
		var f float64
		switch in.(type) {
		case float64:
			f = in.(float64)
		case int64:
			f = float64(in.(int64))
		case string:
			f, err = strconv.ParseFloat(in.(string), 64)
			if err != nil {
				return nil, fmt.Errorf("failed to parse input %s as float: %w", in, err)
			}
		default:
			return nil, fmt.Errorf("unsupported float value %v", in)
		}
		return f, nil
	case vo.DataTypeTime:
		return parseTime(in.(string))
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
			t, err := parseTime(in[i].(string))
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
			// for input fields not explicitly defined, just pass the string value through
			logs.Warnf("input %s not found in type info", k)
			out[k] = in[k]
			continue
		}
		switch t.Type {
		case vo.DataTypeString, vo.DataTypeBoolean, vo.DataTypeNumber, vo.DataTypeFile:
			out[k] = v
		case vo.DataTypeInteger:
			out[k] = int64(v.(float64))
		case vo.DataTypeTime:
			ti, err := parseTime(v.(string))
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

func parseTime(in string) (t time.Time, err error) {
	const layout = "2006-01-02T15:04:05Z"
	t, err = time.Parse(layout, in)
	if err != nil {
		t, err = time.Parse(time.DateTime, in)
		if err != nil {
			return t, fmt.Errorf("failed to parse input %s as time: %w", in, err)
		}
	}

	return t, nil
}
