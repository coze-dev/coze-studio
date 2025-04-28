package stream

import (
	"math/rand"
	"strconv"
	"strings"
	"testing"

	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/assert"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter"
)

func BenchmarkStringJoin(b *testing.B) {
	n := 10000
	var s []int
	for i := 0; i < n; i++ {
		s = append(s, rand.Int())
	}
	b.ResetTimer()

	b.Run("Baseline", func(b *testing.B) {
		for i := 0; i <= b.N; i++ {
			var strs []string
			for _, v := range s {
				strs = append(strs, strconv.Itoa(v))
			}
			strings.Join(strs, ", ")
		}
	})
	b.Run("Stream", func(b *testing.B) {
		for i := 0; i <= b.N; i++ {
			FromStringIter(
				iter.Map(strconv.Itoa, iter.StealSlice(s)),
			).Join(", ")
		}
	})
}

func TestString_Join(t *testing.T) {
	assert.Equal(t, "1,2,3", FromStringSlice([]string{"1", "2", "3"}).Join(","))
}
