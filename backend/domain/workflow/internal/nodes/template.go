package nodes

import (
	"context"
	"fmt"
	"reflect"
	"regexp"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type TemplatePart struct {
	IsVariable          bool
	Value               string
	Root                string
	SubPathsBeforeSlice []string
	JsonPath            []any
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
}

type RenderOption func(options *renderOptions)

func WithCustomRender(rType reflect.Type, fn func(any) (string, error)) RenderOption {
	return func(opts *renderOptions) {
		opts.type2CustomRenderer[rType] = fn
	}
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
		return tp.Value, nil
	}

	i, err := n.Interface()
	if err != nil {
		return fmt.Sprintf("%v", i), nil
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
	case int64:
		return strconv.FormatInt(i.(int64), 10), nil
	case float64:
		return strconv.FormatFloat(i.(float64), 'f', -1, 64), nil
	case bool:
		return strconv.FormatBool(i.(bool)), nil
	default:
		ms, err := sonic.ConfigStd.MarshalToString(i) // keep order of the map keys
		if err != nil {
			return "", err
		}
		return ms, nil
	}
}

func (tp TemplatePart) Skipped(resolvedSources map[string]*SourceInfo) bool {
	if len(resolvedSources) == 0 { // no information available, maybe outside the scope of a workflow
		return false
	}

	// examine along the TemplatePart's root and sub paths,
	// trying to find a matching SourceInfo as far as possible.
	// the result would be one of two cases:
	// - a REAL field source is matched, just check if that field source is skipped
	// - otherwise an INTERMEDIATE field source is matched, it can only be skipped if ALL its sub sources are skipped
	matchingSource, ok := resolvedSources[tp.Root]
	if !ok { // the user specified a non-existing source, it can never have any value, just skip it
		return true
	}

	if !matchingSource.IsIntermediate {
		return matchingSource.FieldType == FieldSkipped
	}

	for _, subPath := range tp.SubPathsBeforeSlice {
		subSource, ok := matchingSource.SubSources[subPath]
		if !ok { // has gone deeper than the field source
			if matchingSource.IsIntermediate { // the user specified a non-existing source, just skip it
				return true
			}
			return matchingSource.FieldType == FieldSkipped
		}

		matchingSource = subSource
	}

	if !matchingSource.IsIntermediate {
		return matchingSource.FieldType == FieldSkipped
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

	return checkSourceSkipped(matchingSource)
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

	var sb strings.Builder
	parts := ParseTemplate(tpl)
	for _, part := range parts {
		if !part.IsVariable {
			sb.WriteString(part.Value)
			continue
		}

		if part.Skipped(resolvedSources) {
			continue
		}

		i, err := part.Render(mi, opts...)
		if err != nil {
			logs.CtxErrorf(ctx, "failed to render template part %v from %v: %v", part, string(mi), err)
			sb.WriteString(part.Value)
			continue
		}

		sb.WriteString(i)
	}

	return sb.String(), nil
}
