package nodes

import (
	"context"
	"fmt"
	"strconv"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/pkg/sonic"
)

func ConvertInputs(ctx context.Context, in map[string]any, tInfo map[string]*vo.TypeInfo) (map[string]any, error) {
	if len(in) == 0 {
		return in, nil
	}

	out := make(map[string]any)
	for k, v := range in {
		t, ok := tInfo[k]
		if !ok {
			// for input fields not explicitly defined, just pass the string value through
			logs.CtxWarnf(ctx, "input %s not found in type info", k)
			out[k] = in[k]
			continue
		}

		converted, err := Convert(ctx, v, t)
		if err != nil {
			return nil, err
		}
		out[k] = converted
	}

	return out, nil
}

func Convert(ctx context.Context, in any, t *vo.TypeInfo) (any, error) {
	if in == nil {
		return in, nil
	}

	switch t.Type {
	case vo.DataTypeString, vo.DataTypeFile, vo.DataTypeTime:
		return convertToString(ctx, in)
	case vo.DataTypeInteger:
		return convertToInt64(ctx, in)
	case vo.DataTypeNumber:
		return convertToFloat64(ctx, in)
	case vo.DataTypeBoolean:
		return convertToBool(ctx, in)
	case vo.DataTypeObject:
		return convertToObject(ctx, in, t)
	case vo.DataTypeArray:
		return convertToArray(ctx, in, t)
	default:
		return nil, fmt.Errorf("unknown input type %s", t.Type)
	}
}

func convertToString(ctx context.Context, in any) (out string, err error) {
	defer func() {
		if err != nil {
			logs.CtxErrorf(ctx, "failed to convert input %v to string: %v, fallback to empty string", in, err)
			err = nil
			out = ""
		}
	}()

	// also used as convertToTime, convertToFile, because under the hood time and file are both strings
	switch in.(type) {
	case string:
		return in.(string), nil
	case int64:
		return strconv.FormatInt(in.(int64), 10), nil
	case float64:
		return strconv.FormatFloat(in.(float64), 'f', -1, 64), nil
	case bool:
		return strconv.FormatBool(in.(bool)), nil
	case []any, map[string]any:
		return sonic.MarshalString(in)
	default:
		return "", fmt.Errorf("cannot convert type %T to string", in)
	}
}

func convertToInt64(ctx context.Context, in any) (out int64, err error) {
	defer func() {
		if err != nil {
			logs.CtxErrorf(ctx, "failed to convert input %v to int64: %v, fallback to 0", in, err)
			err = nil
			out = 0
		}
	}()

	switch in.(type) {
	case int64:
		return in.(int64), nil
	case float64:
		return int64(in.(float64)), nil
	case string:
		return strconv.ParseInt(in.(string), 10, 64)
	default:
		return 0, fmt.Errorf("cannot convert type %T to integer", in)
	}
}

func convertToFloat64(ctx context.Context, in any) (out float64, err error) {
	defer func() {
		if err != nil {
			logs.CtxErrorf(ctx, "failed to convert input %v to float64: %v, fallback to 0", in, err)
			err = nil
			out = 0
		}
	}()

	switch in.(type) {
	case int64:
		return float64(in.(int64)), nil
	case float64:
		return in.(float64), nil
	case string:
		return strconv.ParseFloat(in.(string), 64)
	default:
		return 0, fmt.Errorf("cannot convert type %T to float", in)
	}
}

func convertToBool(ctx context.Context, in any) (out bool, err error) {
	defer func() {
		if err != nil {
			logs.CtxErrorf(ctx, "failed to convert input %v to bool: %v, fallback to false", in, err)
			err = nil
			out = false
		}
	}()

	switch in.(type) {
	case bool:
		return in.(bool), nil
	case string:
		return strconv.ParseBool(in.(string))
	default:
		return false, fmt.Errorf("cannot convert type %T to bool", in)
	}
}

func convertToObject(ctx context.Context, in any, t *vo.TypeInfo) (out map[string]any, err error) {
	defer func() {
		if err != nil {
			logs.CtxErrorf(ctx, "failed to convert input %v to object: %v, fallback to nil", in, err)
			err = nil
			out = nil
		}
	}()

	var m map[string]any
	switch in.(type) {
	case map[string]any:
		m = in.(map[string]any)
	case string:
		err := sonic.UnmarshalString(in.(string), &m)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal input as object: %w", err)
		}
	default:
		return nil, fmt.Errorf("cannot convert type %T to object", in)
	}

	for k, v := range m {
		t, ok := t.Properties[k]
		if !ok {
			// for input fields not explicitly defined, just pass the string value through
			logs.CtxWarnf(ctx, "input %s not found in type info", k)
			continue
		}

		newV, err := Convert(ctx, v, t)
		if err != nil {
			return nil, err
		}

		m[k] = newV
	}

	return m, nil
}

func convertToArray(ctx context.Context, in any, t *vo.TypeInfo) (out []any, err error) {
	defer func() {
		if err != nil {
			logs.CtxErrorf(ctx, "failed to convert input %v to array: %v, fallback to nil", in, err)
			err = nil
			out = nil
		}
	}()

	var a []any
	switch in.(type) {
	case []any:
		a = in.([]any)
	case string:
		err := sonic.UnmarshalString(in.(string), &a)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal input as array: %w", err)
		}
	default:
		return nil, fmt.Errorf("cannot convert type %T to array", in)
	}

	elemType := t.ElemTypeInfo
	for i := range a {
		newV, err := Convert(ctx, a[i], elemType)
		if err != nil {
			logs.CtxErrorf(ctx, "failed to convert %dth element of array to type %v: %v", i, elemType.Type, err)
		}

		out = append(out, newV)
	}

	return out, nil
}
