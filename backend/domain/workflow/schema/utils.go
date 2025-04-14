package schema

import (
	"fmt"
	"reflect"
	"regexp"
	"strings"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

func getKeyOrZero[T any](key string, m map[string]any) T {
	if v, ok := m[key]; ok {
		return v.(T)
	}

	var zero T
	return zero
}

func mustGetKey[T any](key string, m map[string]any) T {
	if _, ok := m[key]; !ok {
		panic(fmt.Sprintf("key %s does not exist in map: %v", key, m))
	}

	v, ok := m[key].(T)
	if !ok {
		panic(fmt.Sprintf("key %s is not a %v, actual type: %v", key, reflect.TypeOf(v), reflect.TypeOf(m[key])))
	}

	return v
}

var parserRegexp = regexp.MustCompile(`\{\{([^}]+)}}`)

func extractInputFieldsFromTemplate(tpl string) (inputs []*nodes.InputField, err error) {
	matches := parserRegexp.FindAllStringSubmatch(tpl, -1)
	vars := make([]string, 0)
	for _, match := range matches {
		if len(match) > 1 {
			tplVariable := match[1]
			vars = append(vars, tplVariable)
		}
	}

	for i := range vars { // TODO: handle variables (app, system, user or parent intermediate)
		v := vars[i]
		if strings.HasPrefix(v, "block_output_") {
			nodeKeyAndValues := strings.TrimPrefix(v, "block_output_")
			paths := strings.Split(nodeKeyAndValues, ".")
			if len(paths) < 2 {
				return nil, fmt.Errorf("invalid block_output_ variable: %s", v)
			}

			nodeKey := paths[0]
			sourcePath := paths[1:2]
			inputs = append(inputs, &nodes.InputField{
				Path: compose.FieldPath{"block_output_" + nodeKey, paths[1]}, // only use the top level object
				Info: nodes.FieldInfo{
					Source: &nodes.FieldSource{
						Ref: &nodes.Reference{
							FromNodeKey: nodeKey,
							FromPath:    sourcePath,
						},
					},
				},
			})
		}
	}

	return inputs, nil
}

func DeduplicateInputFields(inputs []*nodes.InputField) ([]*nodes.InputField, error) {
	deduplicated := make([]*nodes.InputField, 0, len(inputs))
	set := make(map[string]map[string]bool)

	for i := range inputs {
		if inputs[i].Info.Source.Val != nil {
			deduplicated = append(deduplicated, inputs[i])
			continue
		}

		targetPath := inputs[i].Path
		joinedTargetPath := strings.Join(targetPath, ".")
		if _, ok := set[joinedTargetPath]; !ok {
			set[joinedTargetPath] = make(map[string]bool)
		}

		joinedSourcePath := strings.Join(inputs[i].Info.Source.Ref.FromPath, ".")
		joinedSourcePath = inputs[i].Info.Source.Ref.FromNodeKey + "." + joinedSourcePath
		if _, ok := set[joinedTargetPath][joinedSourcePath]; !ok {
			deduplicated = append(deduplicated, inputs[i])
			set[joinedTargetPath][joinedSourcePath] = true
		}
	}

	return deduplicated, nil
}
