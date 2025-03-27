package variablemerge

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewVariableMergeLambada(t *testing.T) {
	lb, err := NewVariableMergeLambada(context.Background())
	if err != nil {
		t.Fatal(err)
	}

	o, err := lb(context.Background(), MergeRequest{
		Groups: []Group{
			{Name: "a", Values: []any{"1"}},
			{Name: "b", Values: []any{nil, 100}},
		},
	})
	assert.Nil(t, err)

	assert.Equal(t, map[string]any{"a": "1", "b": 100}, o)

}
