package variableaggregator

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestVariableMerge_InvokeLambada(t *testing.T) {
	v, err := NewVariableAggregator(context.Background(), &Config{FirstNotNullValue})
	assert.Nil(t, err)
	lbd, err := v.Info()
	assert.Nil(t, err)
	in := map[string]any{
		"a": map[string]any{
			"1": "a2",
			"0": "a1",
			"2": "a3",
		},
		"b": map[string]any{
			"1": "b2",
			"0": nil,
			"2": "b3",
		},
		"c": map[string]any{
			"0": nil,
			"1": 1,
		},
	}
	result, err := lbd.Lambda.Invoke(context.Background(), in)
	if err != nil {
		return
	}
	assert.Nil(t, err)
	assert.Equal(t, map[string]any{"a": "a1", "b": "b2", "c": 1}, result)
}
