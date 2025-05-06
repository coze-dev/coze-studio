package nodes

import (
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
