package variableaggregator

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestVariableMerge_Invoke(t *testing.T) {
	v, err := NewVariableAggregator(context.Background(), &Config{FirstNotNullValue})
	assert.Nil(t, err)

	in := map[string][]any{
		"a": {"a1", "a2", "a3"},
		"b": {nil, "b2", "b3"},
		"c": {nil, 1},
	}

	result, err := v.Invoke(context.Background(), in)
	if err != nil {
		return
	}
	assert.Nil(t, err)
	assert.Equal(t, map[string]any{"a": "a1", "b": "b2", "c": 1}, result)
}
