package emitter

import (
	"testing"

	"github.com/bytedance/sonic"
	"github.com/stretchr/testify/assert"
)

func TestRender(t *testing.T) {
	v := map[string]any{
		"a": []any{1, 2},
	}
	m, _ := sonic.Marshal(v)
	t.Log(string(m))
	r, e := sonic.Get(m, "a")
	t.Log(r, e)
	a, e := r.Array()
	assert.NoError(t, e)
	t.Log(a)

	a1 := []any{3, 4}
	m, _ = sonic.Marshal(a1)
	r, e = sonic.Get(m, 1)
	assert.NoError(t, e)
	i, e := r.Int64()
	assert.NoError(t, e)
	t.Log(i)

	i1, e := r.Interface()
	assert.NoError(t, e)
	t.Log(i1)
}
