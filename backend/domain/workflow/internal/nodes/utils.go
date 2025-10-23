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
	"maps"
	"reflect"
	"strings"

	"github.com/cloudwego/eino/compose"

	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/message"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

// TakeMapValue extracts the value for specified path from input map.
// Returns false if map key not exist for specified path.
func TakeMapValue(m map[string]any, path compose.FieldPath) (any, bool) {
	if m == nil {
		return nil, false
	}

	container := m
	for _, p := range path[:len(path)-1] {
		if _, ok := container[p]; !ok {
			return nil, false
		}
		container = container[p].(map[string]any)
	}

	if v, ok := container[path[len(path)-1]]; ok {
		return v, true
	}

	return nil, false
}

func SetMapValue(m map[string]any, path compose.FieldPath, v any) {
	container := m
	for _, p := range path[:len(path)-1] {
		if _, ok := container[p]; !ok {
			container[p] = make(map[string]any)
		}
		container = container[p].(map[string]any)
	}

	container[path[len(path)-1]] = v
}

func TemplateRender(template string, vals map[string]interface{}) (string, error) {
	sb := strings.Builder{}
	valsBytes, err := sonic.Marshal(vals)
	if err != nil {
		return "", vo.WrapError(errno.ErrSerializationDeserializationFail, err)
	}
	parts := ParseTemplate(template)
	for idx := range parts {
		part := parts[idx]
		if !part.IsVariable {
			sb.WriteString(part.Value)
		} else {
			renderString, err := part.Render(valsBytes)
			if err != nil {
				return "", err
			}
			sb.WriteString(renderString)
		}
	}
	return sb.String(), nil
}

func ExtractJSONString(content string) string {
	content = strings.TrimSpace(content)

	if strings.HasPrefix(content, "```") && strings.HasSuffix(content, "```") {
		content = content[3 : len(content)-3]
	}

	return strings.TrimPrefix(content, "json")
}

func ConcatTwoMaps(m1, m2 map[string]any) (map[string]any, error) {
	merged := maps.Clone(m1)
	for k, v := range m2 {
		current, ok := merged[k]
		if !ok || current == nil {
			if vStr, ok := v.(string); ok {
				if vStr == KeyIsFinished {
					continue
				}
			}
			merged[k] = v
			continue
		}

		vStr, ok1 := v.(string)
		currentStr, ok2 := current.(string)
		if ok1 && ok2 {
			if strings.HasSuffix(vStr, KeyIsFinished) {
				vStr = strings.TrimSuffix(vStr, KeyIsFinished)
			}
			merged[k] = currentStr + vStr
			continue
		}

		vMap, ok1 := v.(map[string]any)
		currentMap, ok2 := current.(map[string]any)
		if ok1 && ok2 {
			concatenated, err := ConcatTwoMaps(currentMap, vMap)
			if err != nil {
				return nil, err
			}

			merged[k] = concatenated
			continue
		}

		items, err := toSliceValue([]any{current, v})
		if err != nil {
			logs.Errorf("failed to convert to slice value: %v", err)
			return nil, err
		}

		var cv reflect.Value
		if reflect.TypeOf(v).Kind() == reflect.Map {
			cv, err = ConcatMaps(items)
		} else {
			cv, err = concatSliceValue(items)
		}
		if err != nil {
			return nil, err
		}

		merged[k] = cv.Interface()
	}
	return merged, nil
}

// the following codes are copied from github.com/cloudwego/eino

func ConcatMaps(ms reflect.Value) (reflect.Value, error) {
	typ := ms.Type().Elem()

	rms := reflect.MakeMap(reflect.MapOf(typ.Key(), reflect.TypeOf((*[]any)(nil)).Elem()))
	ret := reflect.MakeMap(typ)

	n := ms.Len()
	for i := 0; i < n; i++ {
		m := ms.Index(i)

		for _, key := range m.MapKeys() {
			vals := rms.MapIndex(key)
			if !vals.IsValid() {
				var s []any
				vals = reflect.ValueOf(s)
			}

			val := m.MapIndex(key)
			vals = reflect.Append(vals, val)
			rms.SetMapIndex(key, vals)
		}
	}

	for _, key := range rms.MapKeys() {
		vals := rms.MapIndex(key)

		anyVals := vals.Interface().([]any)
		v, err := toSliceValue(anyVals)
		if err != nil {
			return reflect.Value{}, err
		}

		var cv reflect.Value

		if v.Type().Elem().Kind() == reflect.Map {
			cv, err = ConcatMaps(v)
		} else {
			cv, err = concatSliceValue(v)
		}

		if err != nil {
			return reflect.Value{}, err
		}

		ret.SetMapIndex(key, cv)
	}

	return ret, nil
}

func concatSliceValue(val reflect.Value) (reflect.Value, error) {
	elmType := val.Type().Elem()

	if val.Len() == 1 {
		return val.Index(0), nil
	}

	f := GetConcatFunc(elmType)
	if f != nil {
		return f(val)
	}

	// if all elements in the slice are empty, return an empty value
	// if there is exactly one non-empty element in the slice, return that non-empty element
	// otherwise, throw an error.
	var filtered reflect.Value
	for i := 0; i < val.Len(); i++ {
		oneVal := val.Index(i)
		if !oneVal.IsZero() {
			if filtered.IsValid() {
				return reflect.Value{}, fmt.Errorf("cannot concat multiple non-zero value of type %s", elmType)
			}

			filtered = oneVal
		}
	}
	if !filtered.IsValid() {
		filtered = reflect.New(elmType).Elem()
	}

	return filtered, nil
}

func toSliceValue(vs []any) (reflect.Value, error) {
	typ := reflect.TypeOf(vs[0])

	ret := reflect.MakeSlice(reflect.SliceOf(typ), len(vs), len(vs))
	ret.Index(0).Set(reflect.ValueOf(vs[0]))

	for i := 1; i < len(vs); i++ {
		v := vs[i]
		vt := reflect.TypeOf(v)
		if typ != vt {
			return reflect.Value{}, fmt.Errorf("unexpected slice element type. Got %v, expected %v", typ, vt)
		}

		ret.Index(i).Set(reflect.ValueOf(v))
	}

	return ret, nil
}

var (
	concatFunctions = map[reflect.Type]any{
		reflect.TypeOf(""): concatStrings,
	}
)

func concatStrings(ss []string) (string, error) {
	var n int
	for _, s := range ss {
		n += len(s)
	}

	var b strings.Builder
	b.Grow(n)
	for _, s := range ss {
		_, err := b.WriteString(s)
		if err != nil {
			return "", err
		}
	}

	return TrimKeyFinishedMarker(b.String()), nil
}

func RegisterStreamChunkConcatFunc[T any](fn func([]T) (T, error)) {
	concatFunctions[reflect.TypeOf((*T)(nil)).Elem()] = fn
}

func GetConcatFunc(typ reflect.Type) func(reflect.Value) (reflect.Value, error) {
	if fn, ok := concatFunctions[typ]; ok {
		return func(a reflect.Value) (reflect.Value, error) {
			rvs := reflect.ValueOf(fn).Call([]reflect.Value{a})
			var err error
			if !rvs[1].IsNil() {
				err = rvs[1].Interface().(error)
			}
			return rvs[0], err
		}
	}

	return nil
}

func ConvertMessageToString(_ context.Context, msg *crossmessage.WfMessage) (string, error) {
	if msg.MultiContent != nil {
		var textContents []string
		var otherContents []string
		for _, m := range msg.MultiContent {
			if m.Text != nil {
				textContents = append(textContents, ptr.From(m.Text))
			} else if m.Uri != nil {
				otherContents = append(otherContents, ptr.From(m.Url))
			}
		}

		var allParts []string
		if len(textContents) > 0 {
			allParts = append(allParts, textContents...)
		}
		if len(otherContents) > 0 {
			allParts = append(allParts, otherContents...)
		}
		return strings.Join(allParts, ","), nil
	} else if msg.Text != nil {
		return ptr.From(msg.Text), nil
	} else {
		return "", vo.WrapError(errno.ErrInvalidParameter, errors.New("message is invalid"))
	}
}
