package nodes

import (
	"encoding/json"
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestParseTemplate(t *testing.T) {
	p := ParseTemplate("'{{input}}'")
	var _ = p
	assert.NotNil(t, p)

	m := make(map[string]any)
	m["input"] = map[string]interface{}{
		"bool": true,
	}
	bs, _ := json.Marshal(m)
	dd, err := p[0].Render(bs)
	fmt.Println(dd)
	fmt.Println(err)

	s, err := Jinja2TemplateRender("{{input}}", nil)
	fmt.Println("===", s)
	fmt.Println(s, err)

}
