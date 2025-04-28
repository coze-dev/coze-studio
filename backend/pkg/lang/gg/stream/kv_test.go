package stream

import (
	"testing"

	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/assert"
)

func TestKVMap(t *testing.T) {
	assert.Equal(t,
		map[string]int{"Good:Alice": 99, "Good:Bob": 87, "Bad:Zhang": 59},
		FromMap(map[string]int{"Alice": 99, "Bob": 87, "Zhang": 59}).
			Map(func(k string, v int) (string, int) {
				if v > 60 {
					return "Good:" + k, v
				} else {
					return "Bad:" + k, v
				}
			}).ToMap())
}

func TestKVMapSortBy(t *testing.T) {
	assert.Equal(t,
		[]string{"Zhang", "Bob", "Alice"},
		FromMap(map[string]int{"Alice": 99, "Bob": 87, "Zhang": 59}).
			SortBy(func(_ string, v1 int, _ string, v2 int) bool {
				return v1 < v2
			}).
			Keys().
			ToSlice())
}

func BenchmarkFromMapKeys_All(b *testing.B) {
	n := 10000
	m := make(map[int]string)
	for i := 0; i < n; i++ {
		m[i] = "foo"
	}
	b.ResetTimer()

	b.Run("Baseline", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			var s []int
			for v := range m {
				s = append(s, v)
			}
			if len(s) != len(m) {
				b.Error("Mismatched len:", len(s), len(m))
				b.FailNow()
			}
		}
	})

	b.Run("Stream", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			s := FromMapKeys(m).ToSlice()
			if len(s) != len(m) {
				b.Error("Mismatched len:", len(s), len(m))
				b.FailNow()
			}
		}
	})
}

func BenchmarkFromMapKeys_Partial(b *testing.B) {
	n := 10000
	nRead := 800
	m := make(map[int]string)
	for i := 0; i < n; i++ {
		m[i] = "foo"
	}
	b.ResetTimer()

	b.Run("Baseline", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			var s []int
			for v := range m {
				s = append(s, v)
				if len(s) == nRead {
					break
				}
			}
			if len(s) != nRead {
				b.Error("Mismatched len:", len(s), nRead)
				b.FailNow()
			}
		}
	})

	b.Run("Stream", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			s := FromMapKeys(m).Take(nRead).ToSlice()
			if len(s) != nRead {
				b.Error("Mismatched len:", len(s), nRead)
				b.FailNow()
			}
		}
	})
}
