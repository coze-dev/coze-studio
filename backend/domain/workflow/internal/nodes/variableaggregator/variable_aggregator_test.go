package variableaggregator

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestVariableMerge_Invoke(t *testing.T) {
	v, err := NewVariableAggregator(context.Background(), &Config{
		MergeStrategy: FirstNotNullValue,
		GroupLen: map[string]int{
			"a": 3,
			"b": 3,
			"c": 2,
		},
	})
	assert.Nil(t, err)

	in := map[string]map[int]any{
		"a": {0: "a1", 1: "a2", 2: "a3"},
		"b": {0: nil, 1: "b2", 2: "b3"},
		"c": {0: nil, 1: 1},
	}

	result, err := v.Invoke(context.Background(), in)
	if err != nil {
		return
	}
	assert.Nil(t, err)
	assert.Equal(t, map[string]any{"a": "a1", "b": "b2", "c": 1}, result)
}
