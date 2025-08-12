/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

	// Test without initCtxCacheData scenario
	Store(ctx, "test1", "1")
	_, ok := Get[string](ctx, "test1")
	g.Expect(ok).Should(BeFalse())

	// There is initCtxCacheData scene
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
