package receiver

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

func Test_jsonParseRelaxed(t *testing.T) {
	tInfos := map[string]*vo.TypeInfo{
		"str_key": {
			Type: vo.DataTypeString,
		},
		"obj_key": {
			Type: vo.DataTypeObject,
			Properties: map[string]*vo.TypeInfo{
				"field1": {
					Type: vo.DataTypeString,
				},
			},
		},
	}

	data := `{"str_key": "val"}`

	result, err := jsonParseRelaxed(data, tInfos)
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{"str_key": "val"}, result)
}
