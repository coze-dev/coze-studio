package nodes

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
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

func (e ConversionWarnings) Merge(e1 ConversionWarnings) ConversionWarnings {
	return append(e, e1...)
}

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
				return nil, vo.NewError(errno.ErrMissingRequiredParam)
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
			var ws ConversionWarnings
			if errors.As(err, &ws) {
				warnings = append(warnings, ws...)
			} else {
				logs.CtxErrorf(ctx, "unexpected error type during conversion for %s: %v", k, err)
				return nil, vo.WrapError(errno.ErrInvalidParameter, err)
			}
		}
		out[k] = converted
	}

	for k, t := range tInfo {
		if _, ok := out[k]; !ok {
			if t.Required {
				return nil, vo.NewError(errno.ErrMissingRequiredParam)
			}
		}
	}

	if len(warnings) == 0 {
		return out, nil
	}
	return out, warnings
}

type convertOptions struct {
	skipUnknownFields  bool
	returnDefaultValue bool
}

type ConvertOption func(*convertOptions)

func SkipUnknownFields() ConvertOption {
	return func(o *convertOptions) {
		o.skipUnknownFields = true
	}
}
func UseReturnDefaultValue() ConvertOption {
	return func(o *convertOptions) {
		o.returnDefaultValue = true
	}
}

func Convert(ctx context.Context, in any, path string, t *vo.TypeInfo, opts ...ConvertOption) (any, error) {
	if in == nil {
		return nil, nil
	}

	options := &convertOptions{}
	for _, opt := range opts {
		opt(options)
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
		value, err := convertToObject(ctx, in, path, t, opts...)
		if err != nil {
			if options.returnDefaultValue {
				return map[string]any{}, err
			}
			return nil, err
		}
		return value, nil
	case vo.DataTypeArray:
		value, err := convertToArray(ctx, in, path, t, opts...)
		if err != nil {
			if options.returnDefaultValue {
				return []any{}, err
			}
			return nil, err
		}
		return value, nil
	default:
		logs.CtxErrorf(ctx, "unknown input type %s for path %s", t.Type, path)
		return in, nil
	}
}

const TimeFormat = "2006-01-02 15:04:05 -0700 MST"

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
	case []byte:
		return string(in.([]byte)), nil
	case time.Time:
		return in.(time.Time).Format(TimeFormat), nil

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

func convertToObject(ctx context.Context, in any, path string, t *vo.TypeInfo, opts ...ConvertOption) (map[string]any, error) {
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

	options := &convertOptions{}
	for _, opt := range opts {
		opt(options)
	}

	out := make(map[string]any, len(m))
	var warnings ConversionWarnings
	for k, v := range m {
		propType, ok := t.Properties[k]
		if !ok {
			// for input fields not explicitly defined, just pass the value through
			logs.CtxWarnf(ctx, "input %s.%s not found in type info", path, k)
			if !options.skipUnknownFields {
				out[k] = v
			}
			continue
		}

		propPath := fmt.Sprintf("%s.%s", path, k)
		newV, err := Convert(ctx, v, propPath, propType)
		if err != nil {
			var we ConversionWarnings
			if errors.As(err, &we) {
				warnings = append(warnings, we...)
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

func convertToArray(ctx context.Context, in any, path string, t *vo.TypeInfo, opts ...ConvertOption) ([]any, error) {
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
		newV, err := Convert(ctx, v, elemPath, elemType, opts...)
		if err != nil {
			var we ConversionWarnings
			if errors.As(err, &we) {
				warnings = append(warnings, we...)
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
