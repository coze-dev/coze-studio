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

package nodes

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"

	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
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

func newWarnings(path string, t vo.DataType, err error) *ConversionWarnings {
	return ptr.Of(ConversionWarnings{
		{
			Path: path,
			Type: t,
			Err:  err,
		},
	})
}

func ConvertInputs(ctx context.Context, in map[string]any, tInfo map[string]*vo.TypeInfo, opts ...ConvertOption) (
	map[string]any, *ConversionWarnings, error) {
	options := &convertOptions{}
	for _, opt := range opts {
		opt(options)
	}

	if len(in) == 0 {
		if !options.skipRequireCheck {
			for n, t := range tInfo {
				if t.Required {
					return nil, nil, vo.NewError(errno.ErrMissingRequiredParam, errorx.KV("param", n))
				}
			}
		}
		return in, nil, nil
	}

	out := make(map[string]any)
	var warnings ConversionWarnings
	for k, v := range in {
		t, ok := tInfo[k]
		if !ok {
			// for input fields not explicitly defined, just pass the string value through
			if !options.skipUnknownFields {
				out[k] = in[k]
			}
			continue
		}

		converted, ws, err := Convert(ctx, v, k, t, opts...)
		if err != nil {
			return nil, nil, vo.WrapError(errno.ErrInvalidParameter, err)
		}

		if ws != nil {
			warnings = append(warnings, *ws...)
		}
		out[k] = converted
	}

	if !options.skipRequireCheck {
		for k, t := range tInfo {
			if _, ok := out[k]; !ok {
				if t.Required {
					return nil, nil, vo.NewError(errno.ErrMissingRequiredParam, errorx.KV("param", k))
				}
			}
		}
	}

	if len(warnings) > 0 {
		return out, &warnings, nil
	}

	return out, nil, nil
}

type convertOptions struct {
	skipUnknownFields        bool
	failFast                 bool
	skipRequireCheck         bool
	collectFileFields        map[string]*workflowModel.FileInfo
	notNeedTrimQueryFileName bool
}

func WithCollectFileFields(fs map[string]*workflowModel.FileInfo) ConvertOption {
	return func(o *convertOptions) {
		o.collectFileFields = fs
	}
}

func WithNotNeedTrimQueryFileName(b bool) ConvertOption {
	return func(o *convertOptions) {
		o.notNeedTrimQueryFileName = b
	}
}

type ConvertOption func(*convertOptions)

func SkipUnknownFields() ConvertOption {
	return func(o *convertOptions) {
		o.skipUnknownFields = true
	}
}

func FailFast() ConvertOption {
	return func(o *convertOptions) {
		o.failFast = true
	}
}

func SkipRequireCheck() ConvertOption {
	return func(o *convertOptions) {
		o.skipRequireCheck = true
	}
}

func Convert(ctx context.Context, in any, path string, t *vo.TypeInfo, opts ...ConvertOption) (
	any, *ConversionWarnings, error) {
	options := &convertOptions{}
	for _, opt := range opts {
		opt(options)
	}
	return convert(ctx, in, path, t, options)
}

func adaptorFileURL(in string) (string, *workflowModel.FileInfo, error) {
	u, err := url.Parse(in)
	if err != nil {
		return "", nil, err
	}
	query := u.Query()
	fileName := query.Get("x-wf-file_name")
	fileInfo := &workflowModel.FileInfo{
		FileName:      fileName,
		FileExtension: filepath.Ext(fileName),
	}
	query.Del("x-wf-file_name")
	u.RawQuery = query.Encode()
	fileInfo.FileURL = u.String()
	return u.String(), fileInfo, nil
}

func convert(ctx context.Context, in any, path string, t *vo.TypeInfo, options *convertOptions) (
	any, *ConversionWarnings, error) {
	if in == nil { // nil is valid for ALL types
		return nil, nil, nil
	}

	switch t.Type {
	case vo.DataTypeString, vo.DataTypeTime:
		return convertToString(ctx, in, path, options)
	case vo.DataTypeFile:
		ret, warns, err := convertToString(ctx, in, path, options)
		if err != nil {
			return nil, nil, err
		}
		if warns != nil {
			return ret, warns, nil
		}

		fileURL, fileInfo, err := adaptorFileURL(ret.(string))
		if err != nil {
			return nil, nil, err
		}
		if options.collectFileFields != nil {
			options.collectFileFields[fileInfo.FileURL] = fileInfo
		}
		if options.notNeedTrimQueryFileName {
			return ret, nil, nil
		}
		return fileURL, nil, nil
	case vo.DataTypeInteger:
		return convertToInt64(ctx, in, path, options)
	case vo.DataTypeNumber:
		return convertToFloat64(ctx, in, path, options)
	case vo.DataTypeBoolean:
		return convertToBool(ctx, in, path, options)
	case vo.DataTypeObject:
		return convertToObject(ctx, in, path, t, options)
	case vo.DataTypeArray:
		return convertToArray(ctx, in, path, t, options)
	default:
		if options.failFast {
			return nil, nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("unknown input type %s for path %s", t.Type, path))
		}
		logs.CtxErrorf(ctx, "unknown input type %s for path %s", t.Type, path)
		return in, newWarnings(path, t.Type, errors.New("unknown input type")), nil
	}
}

func convertToString(_ context.Context, in any, path string, options *convertOptions) (any, *ConversionWarnings, error) {
	switch in.(type) {
	case string:
		return in.(string), nil, nil
	case int64:
		return strconv.FormatInt(in.(int64), 10), nil, nil
	case float64:
		return strconv.FormatFloat(in.(float64), 'f', -1, 64), nil, nil
	case bool:
		return strconv.FormatBool(in.(bool)), nil, nil
	case []any, map[string]any:
		s, err := sonic.MarshalString(in)
		if err != nil {
			if options.failFast {
				return nil, nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
			}
			return nil, newWarnings(path, vo.DataTypeString, err), nil
		}
		return s, nil, nil
	default:
		if options.failFast {
			return nil, nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("unsupported type to convert to string: %T", in))
		}
		return nil, newWarnings(path, vo.DataTypeString, fmt.Errorf("unsupported type to convert to string: %T", in)), nil
	}
}

func convertToInt64(_ context.Context, in any, path string, options *convertOptions) (any, *ConversionWarnings, error) {
	switch in.(type) {
	case int64:
		return in.(int64), nil, nil
	case float64:
		return int64(in.(float64)), nil, nil
	case string:
		i, err := strconv.ParseInt(in.(string), 10, 64)
		if err != nil {
			if options.failFast {
				return nil, nil, vo.WrapError(errno.ErrInvalidParameter, err)
			}
			return nil, newWarnings(path, vo.DataTypeInteger, err), nil
		}
		return i, nil, nil
	default:
		if options.failFast {
			return nil, nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("unsupported type to convert to int64: %T", in))
		}
		return nil, newWarnings(path, vo.DataTypeInteger, fmt.Errorf("unsupported type to convert to int64: %T", in)), nil
	}
}

func convertToFloat64(_ context.Context, in any, path string, options *convertOptions) (any, *ConversionWarnings, error) {
	switch in.(type) {
	case int64:
		return float64(in.(int64)), nil, nil
	case float64:
		return in.(float64), nil, nil
	case string:
		f, err := strconv.ParseFloat(in.(string), 64)
		if err != nil {
			if options.failFast {
				return nil, nil, vo.WrapError(errno.ErrInvalidParameter, err)
			}
			return nil, newWarnings(path, vo.DataTypeNumber, err), nil
		}
		return f, nil, nil
	default:
		if options.failFast {
			return nil, nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("unsupported type to convert to float64: %T", in))
		}
		return nil, newWarnings(path, vo.DataTypeNumber, fmt.Errorf("unsupported type to convert to float64: %T", in)), nil
	}
}

func convertToBool(_ context.Context, in any, path string, options *convertOptions) (any, *ConversionWarnings, error) {
	switch in.(type) {
	case bool:
		return in.(bool), nil, nil
	case string:
		b, err := strconv.ParseBool(in.(string))
		if err != nil {
			if options.failFast {
				return nil, nil, vo.WrapError(errno.ErrInvalidParameter, err)
			}
			return nil, newWarnings(path, vo.DataTypeBoolean, err), nil
		}
		return b, nil, nil
	default:
		if options.failFast {
			return nil, nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("unsupported type to convert to bool: %T", in))
		}
		return nil, newWarnings(path, vo.DataTypeBoolean, fmt.Errorf("unsupported type to convert to bool: %T", in)), nil
	}
}

func convertToObject(ctx context.Context, in any, path string, t *vo.TypeInfo, options *convertOptions) (
	map[string]any, *ConversionWarnings, error) {
	var m map[string]any
	switch in.(type) {
	case map[string]any:
		m = in.(map[string]any)
	case string:
		err := sonic.UnmarshalString(in.(string), &m)
		if err != nil {
			if options.failFast {
				return nil, nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
			}
			return nil, newWarnings(path, vo.DataTypeObject, err), nil
		}
	default:
		if options.failFast {
			return nil, nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("unsupported type to convert to object: %T", in))
		}
		return nil, newWarnings(path, vo.DataTypeObject, fmt.Errorf("unsupported type to convert to object: %T", in)), nil
	}

	if len(m) == 0 {
		if !options.skipRequireCheck {
			for pn, pro := range t.Properties {
				if pro.Required {
					return nil, nil, vo.NewError(errno.ErrMissingRequiredParam,
						errorx.KV("param", fmt.Sprintf("%s.%s", path, pn)))
				}
			}
		}
		return m, nil, nil
	}

	out := make(map[string]any, len(m))
	var warnings ConversionWarnings
	for k, v := range m {
		propType, ok := t.Properties[k]
		if !ok {
			// for input fields not explicitly defined, just pass the value through
			if !options.skipUnknownFields {
				out[k] = v
			}
			continue
		}

		propPath := fmt.Sprintf("%s.%s", path, k)
		newV, ws, err := convert(ctx, v, propPath, propType, options)
		if err != nil {
			return nil, nil, err
		} else if ws != nil {
			warnings = append(warnings, *ws...)
		}
		out[k] = newV
	}

	if !options.skipRequireCheck {
		for k, t := range t.Properties {
			if _, ok := out[k]; !ok {
				if t.Required {
					return nil, nil, vo.NewError(errno.ErrMissingRequiredParam,
						errorx.KV("param", fmt.Sprintf("%s.%s", path, k)))
				}
			}
		}
	}

	if len(warnings) > 0 {
		return out, ptr.Of(warnings), nil
	}
	return out, nil, nil
}

func convertToArray(ctx context.Context, in any, path string, t *vo.TypeInfo, options *convertOptions) (
	[]any, *ConversionWarnings, error) {
	var a []any
	switch v := in.(type) {
	case []any:
		a = v
	case string:
		err := sonic.UnmarshalString(v, &a)
		if err != nil {
			if options.failFast {
				return nil, nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
			}
			return []any{}, newWarnings(path, vo.DataTypeArray, err), nil
		}
	default:
		if options.failFast {
			return nil, nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("unsupported type to convert to array: %T", in))
		}
		return []any{}, newWarnings(path, vo.DataTypeArray, fmt.Errorf("unsupported type to convert to array: %T", in)), nil
	}

	if len(a) == 0 {
		return a, nil, nil
	}

	out := make([]any, 0, len(a))
	var warnings ConversionWarnings
	elemType := t.ElemTypeInfo
	for i, v := range a {
		elemPath := fmt.Sprintf("%s.%d", path, i)
		newV, ws, err := convert(ctx, v, elemPath, elemType, options)
		if err != nil {
			return nil, nil, err
		} else if ws != nil {
			if elemType.Type == vo.DataTypeObject { // If the array type and the element is an object, the converted object will also need to be added to the array when waring occurs
				out = append(out, newV)
			}
			warnings = append(warnings, *ws...)
		} else { // only correctly converted elements go into the final array
			out = append(out, newV)
		}
	}

	if len(warnings) > 0 {
		return out, ptr.Of(warnings), nil
	}

	return out, nil, nil
}
