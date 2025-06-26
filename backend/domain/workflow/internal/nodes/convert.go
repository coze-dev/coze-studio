package nodes

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/pkg/sonic"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type ConversionWarning struct {
	Path string
	Type vo.DataType
	Err  error
}

func (e *ConversionWarning) Error() string {
	return fmt.Sprintf("field %s is not %s", e.Path, e.Type)
}

type ConversionWarnings []*ConversionWarning

func (e ConversionWarnings) Error() string {
	if len(e) == 0 {
		return ""
	}
	var errs []string
	for _, err := range e {
		errs = append(errs, err.Error())
	}
	return strings.Join(errs, ", ")
}

func ConvertInputs(ctx context.Context, in map[string]any, tInfo map[string]*vo.TypeInfo) (map[string]any, error) {
	if len(in) == 0 {
		for _, t := range tInfo {
			if t.Required {
				return nil, errorx.New(errno.ErrMissingRequiredParam)
			}
		}
		return in, nil
	}

	out := make(map[string]any)
	var warnings ConversionWarnings
	for k, v := range in {
		t, ok := tInfo[k]
		if !ok {
			// for input fields not explicitly defined, just pass the string value through
			logs.CtxWarnf(ctx, "input %s not found in type info", k)
			out[k] = in[k]
			continue
		}

		converted, err := Convert(ctx, v, k, t)
		if err != nil {
			if w, ok := err.(ConversionWarnings); ok {
				warnings = append(warnings, w...)
			} else {
				logs.CtxErrorf(ctx, "unexpected error type during conversion for %s: %v", k, err)
			}
		}
		out[k] = converted
	}

	for k, t := range tInfo {
		if _, ok := out[k]; !ok {
			if t.Required {
				return nil, errorx.New(errno.ErrMissingRequiredParam)
			}
		}
	}

	if len(warnings) == 0 {
		return out, nil
	}
	return out, warnings
}

func Convert(ctx context.Context, in any, path string, t *vo.TypeInfo) (any, error) {
	if in == nil {
		return nil, nil
	}

	switch t.Type {
	case vo.DataTypeString, vo.DataTypeFile, vo.DataTypeTime:
		return convertToString(ctx, in, path)
	case vo.DataTypeInteger:
		return convertToInt64(ctx, in, path)
	case vo.DataTypeNumber:
		return convertToFloat64(ctx, in, path)
	case vo.DataTypeBoolean:
		return convertToBool(ctx, in, path)
	case vo.DataTypeObject:
		return convertToObject(ctx, in, path, t)
	case vo.DataTypeArray:
		return convertToArray(ctx, in, path, t)
	default:
		logs.CtxErrorf(ctx, "unknown input type %s for path %s", t.Type, path)
		return in, nil
	}
}

func convertToString(_ context.Context, in any, path string) (string, error) {
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
		s, err := sonic.MarshalString(in)
		if err != nil {
			return "", ConversionWarnings{{Path: path, Type: vo.DataTypeString, Err: err}}
		}
		return s, nil
	default:
		return "", ConversionWarnings{{Path: path, Type: vo.DataTypeString}}
	}
}

func convertToInt64(_ context.Context, in any, path string) (int64, error) {
	switch in.(type) {
	case int64:
		return in.(int64), nil
	case float64:
		return int64(in.(float64)), nil
	case string:
		i, err := strconv.ParseInt(in.(string), 10, 64)
		if err != nil {
			return 0, ConversionWarnings{{Path: path, Type: vo.DataTypeInteger, Err: err}}
		}
		return i, nil
	default:
		return 0, ConversionWarnings{{Path: path, Type: vo.DataTypeInteger}}
	}
}

func convertToFloat64(_ context.Context, in any, path string) (float64, error) {
	switch in.(type) {
	case int64:
		return float64(in.(int64)), nil
	case float64:
		return in.(float64), nil
	case string:
		f, err := strconv.ParseFloat(in.(string), 64)
		if err != nil {
			return 0, ConversionWarnings{{Path: path, Type: vo.DataTypeNumber, Err: err}}
		}
		return f, nil
	default:
		return 0, ConversionWarnings{{Path: path, Type: vo.DataTypeNumber}}
	}
}

func convertToBool(_ context.Context, in any, path string) (bool, error) {
	switch in.(type) {
	case bool:
		return in.(bool), nil
	case string:
		b, err := strconv.ParseBool(in.(string))
		if err != nil {
			return false, ConversionWarnings{{Path: path, Type: vo.DataTypeBoolean, Err: err}}
		}
		return b, nil
	default:
		return false, ConversionWarnings{{Path: path, Type: vo.DataTypeBoolean}}
	}
}

func convertToObject(ctx context.Context, in any, path string, t *vo.TypeInfo) (map[string]any, error) {
	var m map[string]any
	switch in.(type) {
	case map[string]any:
		m = in.(map[string]any)
	case string:
		err := sonic.UnmarshalString(in.(string), &m)
		if err != nil {
			return nil, ConversionWarnings{{Path: path, Type: vo.DataTypeObject, Err: err}}
		}
	default:
		return nil, ConversionWarnings{{Path: path, Type: vo.DataTypeObject}}
	}

	if m == nil {
		return nil, nil
	}

	out := make(map[string]any, len(m))
	var warnings ConversionWarnings
	for k, v := range m {
		propType, ok := t.Properties[k]
		if !ok {
			// for input fields not explicitly defined, just pass the value through
			logs.CtxWarnf(ctx, "input %s.%s not found in type info", path, k)
			out[k] = v
			continue
		}

		propPath := fmt.Sprintf("%s.%s", path, k)
		newV, err := Convert(ctx, v, propPath, propType)
		if err != nil {
			if w, ok := err.(ConversionWarnings); ok {
				warnings = append(warnings, w...)
			}
			out[k] = nil
		} else {
			out[k] = newV
		}
	}

	if len(warnings) > 0 {
		return out, warnings
	}
	return out, nil
}

func convertToArray(ctx context.Context, in any, path string, t *vo.TypeInfo) ([]any, error) {
	var a []any
	switch v := in.(type) {
	case []any:
		a = v
	case string:
		err := sonic.UnmarshalString(v, &a)
		if err != nil {
			return nil, ConversionWarnings{{Path: path, Type: vo.DataTypeArray, Err: err}}
		}
	default:
		return nil, ConversionWarnings{{Path: path, Type: vo.DataTypeArray}}
	}

	if len(a) == 0 {
		return a, nil
	}

	out := make([]any, 0, len(a))
	var warnings ConversionWarnings
	elemType := t.ElemTypeInfo
	for i, v := range a {
		elemPath := fmt.Sprintf("%s.%d", path, i)
		newV, err := Convert(ctx, v, elemPath, elemType)
		if err != nil {
			if w, ok := err.(ConversionWarnings); ok {
				warnings = append(warnings, w...)
			}
			continue
		}
		out = append(out, newV)
	}

	if len(warnings) > 0 {
		return out, warnings
	}
	return out, nil
}
