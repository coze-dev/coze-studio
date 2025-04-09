package loop

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"
)

func TestVariableAssigner(t *testing.T) {
	intVar := any(1)
	strVar := any("str")
	objVar := any(map[string]any{
		"key": "value",
	})
	arrVar := any([]any{1, "2"})

	va := &VariableAssigner{
		config: &VariableAssignerConfig{
			Pairs: []*Pair{
				{
					Left:  compose.FieldPath{"int_var_s"},
					Right: compose.FieldPath{"int_var_t"},
				},
				{
					Left:  compose.FieldPath{"str_var_s"},
					Right: compose.FieldPath{"str_var_t"},
				},
				{
					Left:  compose.FieldPath{"obj_var_s"},
					Right: compose.FieldPath{"obj_var_t"},
				},
				{
					Left:  compose.FieldPath{"arr_var_s"},
					Right: compose.FieldPath{"arr_var_t"},
				},
			},
		},
	}

	err := va.Assign(context.Background(), map[string]any{
		"int_var_s": &intVar,
		"str_var_s": &strVar,
		"obj_var_s": &objVar,
		"arr_var_s": &arrVar,
		"int_var_t": 2,
		"str_var_t": "str2",
		"obj_var_t": map[string]any{
			"key2": "value2",
		},
		"arr_var_t": []any{3, "4"},
	})
	assert.NoError(t, err)

	assert.Equal(t, 2, intVar)
	assert.Equal(t, "str2", strVar)
	assert.Equal(t, map[string]any{
		"key2": "value2",
	}, objVar)
	assert.Equal(t, []any{3, "4"}, arrVar)
}
