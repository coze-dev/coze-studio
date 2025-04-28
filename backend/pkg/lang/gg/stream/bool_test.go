package stream

import (
	"testing"

	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/assert"
)

func TestBool_And(t *testing.T) {
	assert.True(t, FromBoolSlice([]bool{true, true, true}).And())
}

func TestBool_Or(t *testing.T) {
	assert.True(t, FromBoolSlice([]bool{false, false, true}).Or())
}
