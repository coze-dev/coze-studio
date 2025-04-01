package ctxcache

import (
	"context"
	"reflect"
	"testing"

	. "github.com/onsi/gomega"
)

func TestCtxCache(t *testing.T) {
	g := NewGomegaWithT(t)
	ctx := context.Background()

	// 测试没有 initCtxCacheData 场景
	Store(ctx, "test1", "1")
	_, ok := Get[string](ctx, "test1")
	g.Expect(ok).Should(BeFalse())

	// 有 initCtxCacheData 场景
	ctx = Init(ctx)

	_, ok = Get[string](ctx, "test")
	g.Expect(ok).Should(BeFalse())

	Store(ctx, "key1", "abc")
	data1, ok := Get[string](ctx, "key1")

	g.Expect(ok).Should(BeTrue())
	g.Expect(data1).Should(BeIdenticalTo("abc"))

	type testKey struct{}
	Store(ctx, testKey{}, int64(1))
	data2, ok := Get[int64](ctx, testKey{})
	g.Expect(ok).Should(BeTrue())
	g.Expect(data2).Should(BeIdenticalTo(int64(1)))

	type temp struct {
		a string
		b string
		c int64
		d []int64
	}

	te := temp{
		a: "1",
		b: "2",
		c: 3,
		d: []int64{123, 1232, 232},
	}

	Store(ctx, "temp", te)
	newT, ok := Get[temp](ctx, "temp")
	g.Expect(ok).Should(BeTrue())
	g.Expect(reflect.DeepEqual(te, newT)).Should(BeTrue())

}
