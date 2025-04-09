package nodes

import (
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

func Jinja2TemplateRender(template string, vals map[string]interface{}) (string, error) {
	tpl, err := gonja.FromString(template)
	if err != nil {
		return "", err
	}
	return tpl.Execute(vals)
}
