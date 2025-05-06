package compose

import (
	"fmt"
	"reflect"
	"regexp"
	"strings"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

func getKeyOrZero[T any](key string, cfg any) T {
	var zero T
	if cfg == nil {
		return zero
	}

	m, ok := cfg.(map[string]any)
	if !ok {
		panic(fmt.Sprintf("m is not a map[string]any, actual type: %v", reflect.TypeOf(cfg)))
	}

	if len(m) == 0 {
		return zero
	}

	if v, ok := m[key]; ok {
		return v.(T)
	}

	return zero
}

func mustGetKey[T any](key string, cfg any) T {
	if cfg == nil {
		panic(fmt.Sprintf("mustGetKey[*any] is nil, key=%s", key))
	}

	m, ok := cfg.(map[string]any)
	if !ok {
		panic(fmt.Sprintf("m is not a map[string]any, actual type: %v", reflect.TypeOf(cfg)))
	}

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

func extractInputFieldsFromTemplate(tpl string) (inputs []*vo.FieldInfo, err error) {
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
			inputs = append(inputs, &vo.FieldInfo{
				Path: compose.FieldPath{"block_output_" + nodeKey, paths[1]}, // only use the top level object
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: vo.NodeKey(nodeKey),
						FromPath:    sourcePath,
					},
				},
			})
		}
	}

	return inputs, nil
}

func DeduplicateInputFields(inputs []*vo.FieldInfo) ([]*vo.FieldInfo, error) {
	deduplicated := make([]*vo.FieldInfo, 0, len(inputs))
	set := make(map[string]map[string]bool)

	for i := range inputs {
		if inputs[i].Source.Val != nil {
			deduplicated = append(deduplicated, inputs[i])
			continue
		}

		targetPath := inputs[i].Path
		joinedTargetPath := strings.Join(targetPath, ".")
		if _, ok := set[joinedTargetPath]; !ok {
			set[joinedTargetPath] = make(map[string]bool)
		}

		joinedSourcePath := strings.Join(inputs[i].Source.Ref.FromPath, ".")
		joinedSourcePath = string(inputs[i].Source.Ref.FromNodeKey) + "." + joinedSourcePath
		if _, ok := set[joinedTargetPath][joinedSourcePath]; !ok {
			deduplicated = append(deduplicated, inputs[i])
			set[joinedTargetPath][joinedSourcePath] = true
		}
	}

	return deduplicated, nil
}

func (s *NodeSchema) SetConfigKV(key string, value any) {
	if s.Configs == nil {
		s.Configs = make(map[string]any)
	}

	s.Configs.(map[string]any)[key] = value
}

func (s *NodeSchema) SetInputType(key string, t *vo.TypeInfo) {
	if s.InputTypes == nil {
		s.InputTypes = make(map[string]*vo.TypeInfo)
	}
	s.InputTypes[key] = t
}

func (s *NodeSchema) AddInputSource(info ...*vo.FieldInfo) {
	s.InputSources = append(s.InputSources, info...)
}

func (s *NodeSchema) SetOutputType(key string, t *vo.TypeInfo) {
	if s.OutputTypes == nil {
		s.OutputTypes = make(map[string]*vo.TypeInfo)
	}
	s.OutputTypes[key] = t
}

func (s *NodeSchema) AddOutputSource(info ...*vo.FieldInfo) {
	s.OutputSources = append(s.OutputSources, info...)
}
