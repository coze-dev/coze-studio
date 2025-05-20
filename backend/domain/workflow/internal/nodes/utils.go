package nodes

import (
	"fmt"
	"maps"
	"strings"

	"github.com/cloudwego/eino/compose"
	"github.com/nikolalohinski/gonja"
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

func Jinja2TemplateRender(template string, vals map[string]interface{}) (string, error) {
	tpl, err := gonja.FromString(template)
	if err != nil {
		return "", err
	}
	return tpl.Execute(vals)
}

func ExtractJSONString(content string) string {
	if strings.HasPrefix(content, "```") && strings.HasSuffix(content, "```") {
		content = content[3 : len(content)-3]
	}

	if strings.HasPrefix(content, "json") {
		content = content[4:]
	}

	return content
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

		return nil, fmt.Errorf("can only concat two strings or two map[string]any, actual newType: %T, oldType: %T", v, current)
	}
	return merged, nil
}
