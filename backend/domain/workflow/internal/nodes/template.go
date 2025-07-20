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
	"encoding/json"
	"errors"
	"fmt"
	"reflect"
	"regexp"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/bytedance/sonic/ast"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type TemplatePart struct {
	IsVariable          bool
	Value               string
	Root                string
	SubPathsBeforeSlice []string
	JsonPath            []any

	literal string
}

var re = regexp.MustCompile(`{{\s*([^}]+)\s*}}`)

func ParseTemplate(template string) []TemplatePart {
	matches := re.FindAllStringSubmatchIndex(template, -1)
	parts := make([]TemplatePart, 0)
	lastEnd := 0

loop:
	for _, match := range matches {
		start, end := match[0], match[1]
		placeholderStart, placeholderEnd := match[2], match[3]

		// Add the literal part before the current variable placeholder
		if start > lastEnd {
			parts = append(parts, TemplatePart{
				IsVariable: false,
				Value:      template[lastEnd:start],
			})
		}

		// Add the variable placeholder
		val := template[placeholderStart:placeholderEnd]
		segments := strings.Split(val, ".")
		var subPaths []string
		if !strings.Contains(segments[0], "[") {
			for i := 1; i < len(segments); i++ {
				if strings.Contains(segments[i], "[") {
					break
				}
				subPaths = append(subPaths, segments[i])
			}
		}

		var jsonPath []any
		for _, segment := range segments {
			// find the first '[' to separate the initial key from array accessors
			firstBracket := strings.Index(segment, "[")
			if firstBracket == -1 {
				// No brackets, the whole segment is a key
				jsonPath = append(jsonPath, segment)
				continue
			}

			// Add the initial key part
			key := segment[:firstBracket]
			if key != "" {
				jsonPath = append(jsonPath, key)
			}

			// Now, parse the array accessors like [1][2]
			rest := segment[firstBracket:]
			for strings.HasPrefix(rest, "[") {
				closeBracket := strings.Index(rest, "]")
				if closeBracket == -1 {
					// Malformed, treat as literal
					parts = append(parts, TemplatePart{IsVariable: false, Value: val})
					continue loop
				}

				idxStr := rest[1:closeBracket]
				idx, err := strconv.Atoi(idxStr)
				if err != nil {
					// Malformed, treat as literal
					parts = append(parts, TemplatePart{IsVariable: false, Value: val})
					continue loop
				}

				jsonPath = append(jsonPath, idx)
				rest = rest[closeBracket+1:]
			}

			if rest != "" {
				// Malformed, treat as literal
				parts = append(parts, TemplatePart{IsVariable: false, Value: val})
				continue loop
			}
		}

		parts = append(parts, TemplatePart{
			IsVariable:          true,
			Value:               val,
			Root:                removeSlice(segments[0]),
			SubPathsBeforeSlice: subPaths,
			JsonPath:            jsonPath,

			literal: "{{" + val + "}}",
		})

		lastEnd = end
	}

	// Add the remaining literal part if there is any
	if lastEnd < len(template) {
		parts = append(parts, TemplatePart{
			IsVariable: false,
			Value:      template[lastEnd:],
		})
	}

	return parts
}

func removeSlice(s string) string {
	i := strings.Index(s, "[")
	if i != -1 {
		return s[:i]
	}
	return s
}

type renderOptions struct {
	type2CustomRenderer map[reflect.Type]func(any) (string, error)
	reservedKey         map[string]struct{}
	nilRenderer         func() (string, error)
}

func WithNilRender(fn func() (string, error)) RenderOption {
	return func(opts *renderOptions) {
		opts.nilRenderer = fn
	}
}

type RenderOption func(options *renderOptions)

func WithCustomRender(rType reflect.Type, fn func(any) (string, error)) RenderOption {
	return func(opts *renderOptions) {
		if opts.type2CustomRenderer == nil {
			opts.type2CustomRenderer = make(map[reflect.Type]func(any) (string, error))
		}
		opts.type2CustomRenderer[rType] = fn
	}
}

func WithReservedKey(keys ...string) RenderOption {
	return func(opts *renderOptions) {
		if opts.reservedKey == nil {
			opts.reservedKey = make(map[string]struct{})
		}
		for _, key := range keys {
			opts.reservedKey[key] = struct{}{}
		}
	}
}

var renderConfig = sonic.Config{
	SortMapKeys: true,
}.Froze()

func joinJsonPath(p []any) string {
	var sb strings.Builder
	for i := range p {
		field, ok := p[i].(string)
		if ok {
			if i > 0 {
				_, ok := p[i-1].(string)
				if ok {
					sb.WriteString(".")
				}
			}
			sb.WriteString(field)
		} else {
			sb.WriteString(fmt.Sprintf("[%d]", p[i]))
		}
	}
	return sb.String()
}

func (tp TemplatePart) Render(m []byte, opts ...RenderOption) (string, error) {
	options := &renderOptions{
		type2CustomRenderer: make(map[reflect.Type]func(any) (string, error)),
	}
	for _, opt := range opts {
		opt(options)
	}

	n, err := sonic.Get(m, tp.JsonPath...)
	if err != nil {
		notExist := errors.Is(err, ast.ErrNotExist)
		var syntaxErr ast.SyntaxError
		if notExist || errors.As(err, &syntaxErr) {
			// get each path segments one by one until the first not found error
			var segParent, current ast.Node
			for i := range tp.JsonPath {
				current, err = sonic.Get(m, tp.JsonPath[:i+1]...)
				if err != nil {
					if errors.Is(err, ast.ErrNotExist) { // first not found segment
						segmentI, ok := tp.JsonPath[i].(int)
						if ok {
							if !segParent.Exists() {
								panic("impossible")
							} else {
								segArr, err := segParent.Array()
								if err != nil { // not taking elements from array
									return tp.literal, nil
								}

								return "", vo.NewError(errno.ErrArrIndexOutOfRange,
									errorx.KV("arr_name", joinJsonPath(tp.JsonPath[:i])),
									errorx.KV("req_index", strconv.Itoa(segmentI)),
									errorx.KV("arr_len", strconv.Itoa(len(segArr))))
							}
						}
						return tp.literal, nil // not array element not found, but object field, just print
					} else if errors.As(err, &syntaxErr) {
						segmentI, ok := tp.JsonPath[i].(int)
						if ok {
							return "", vo.NewError(errno.ErrIndexingNilArray,
								errorx.KV("arr_name", joinJsonPath(tp.JsonPath[:i])),
								errorx.KV("req_index", strconv.Itoa(segmentI)))
						}
						return tp.literal, nil // not array element not found, but object field, just print
					}
					return tp.literal, nil // not ErrNotExist, just print
				} else {
					segParent = current
				}
			}
		}
		return tp.literal, nil
	}

	i, err := n.InterfaceUseNumber()
	if err != nil {
		return tp.literal, nil
	}

	if i == nil {
		if options.nilRenderer != nil {
			return options.nilRenderer()
		}
		return "", nil
	}

	if len(options.type2CustomRenderer) > 0 {
		rType := reflect.TypeOf(i)
		if fn, ok := options.type2CustomRenderer[rType]; ok {
			return fn(i)
		}
	}

	switch i.(type) {
	case string:
		return i.(string), nil
	case json.Number:
		return i.(json.Number).String(), nil
	case bool:
		return strconv.FormatBool(i.(bool)), nil
	default:
		ms, err := renderConfig.MarshalToString(i) // keep order of the map keys
		if err != nil {
			return "", err
		}
		return ms, nil
	}
}

func (tp TemplatePart) Skipped(resolvedSources map[string]*SourceInfo) (skipped bool, invalid bool) {
	if len(resolvedSources) == 0 { // no information available, maybe outside the scope of a workflow
		return false, false
	}

	// examine along the TemplatePart's root and sub paths,
	// trying to find a matching SourceInfo as far as possible.
	// the result would be one of two cases:
	// - a REAL field source is matched, just check if that field source is skipped
	// - otherwise an INTERMEDIATE field source is matched, it can only be skipped if ALL its sub sources are skipped
	matchingSource, ok := resolvedSources[tp.Root]
	if !ok { // the user specified a non-existing source, it can never have any value, just skip it
		return false, true
	}

	if !matchingSource.IsIntermediate {
		return matchingSource.FieldType == FieldSkipped, false
	}

	for _, subPath := range tp.SubPathsBeforeSlice {
		subSource, ok := matchingSource.SubSources[subPath]
		if !ok { // has gone deeper than the field source
			if matchingSource.IsIntermediate { // the user specified a non-existing source, just skip it
				return false, true
			}
			return matchingSource.FieldType == FieldSkipped, false
		}

		matchingSource = subSource
	}

	if !matchingSource.IsIntermediate {
		return matchingSource.FieldType == FieldSkipped, false
	}

	var checkSourceSkipped func(sInfo *SourceInfo) bool
	checkSourceSkipped = func(sInfo *SourceInfo) bool {
		if !sInfo.IsIntermediate {
			return sInfo.FieldType == FieldSkipped
		}
		for _, subSource := range sInfo.SubSources {
			if !checkSourceSkipped(subSource) {
				return false
			}
		}
		return true
	}

	return checkSourceSkipped(matchingSource), false
}

func (tp TemplatePart) TypeInfo(types map[string]*vo.TypeInfo) *vo.TypeInfo {
	if len(tp.SubPathsBeforeSlice) == 0 {
		return types[tp.Root]
	}
	rootType, ok := types[tp.Root]
	if !ok {
		return nil
	}
	currentType := rootType
	for _, subPath := range tp.SubPathsBeforeSlice {
		if len(currentType.Properties) == 0 {
			return nil
		}
		subType, ok := currentType.Properties[subPath]
		if !ok {
			return nil
		}
		currentType = subType
	}
	return currentType
}

func Render(ctx context.Context, tpl string, input map[string]any, sources map[string]*SourceInfo, opts ...RenderOption) (string, error) {
	mi, err := sonic.Marshal(input)
	if err != nil {
		return "", err
	}

	resolvedSources, err := ResolveStreamSources(ctx, sources)
	if err != nil {
		return "", err
	}

	options := &renderOptions{}
	for _, opt := range opts {
		opt(options)
	}

	var sb strings.Builder
	parts := ParseTemplate(tpl)
	for _, part := range parts {
		if !part.IsVariable {
			sb.WriteString(part.Value)
			continue
		}

		if options.reservedKey != nil {
			if _, ok := options.reservedKey[part.Root]; ok {
				i, err := part.Render(mi, opts...)
				if err != nil {
					return "", err
				}

				sb.WriteString(i)
				continue
			}
		}

		skipped, invalid := part.Skipped(resolvedSources)
		if skipped {
			continue
		}

		if invalid {
			sb.WriteString(part.literal)
			continue
		}

		i, err := part.Render(mi, opts...)
		if err != nil {
			return "", err
		}

		sb.WriteString(i)
	}

	return sb.String(), nil
}
