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
	"sync"
)

type ctxCacheKey struct{}

func Init(ctx context.Context) context.Context {
	return context.WithValue(ctx, ctxCacheKey{}, new(sync.Map))
}

func Get[T any](ctx context.Context, key any) (value T, ok bool) {
	var zero T

	cacheMap, valid := ctx.Value(ctxCacheKey{}).(*sync.Map)
	if !valid {
		return zero, false
	}

	loadedValue, exists := cacheMap.Load(key)
	if !exists {
		return zero, false
	}

	if v, match := loadedValue.(T); match {
		return v, true
	}

	// 特殊处理 T 是 string 的情况
	if reflect.TypeOf(zero).Kind() == reflect.String {
		switch v := loadedValue.(type) {
		case []byte:
			return any(string(v)).(T), true
		case []int8:
			// 转换 []int8 到 []byte，避免 unsafe
			b := make([]byte, len(v))
			for i, val := range v {
				b[i] = byte(val)
			}
			return any(string(b)).(T), true
		}
	}

	return zero, false
}

func Store(ctx context.Context, key any, obj any) {
	if cacheMap, ok := ctx.Value(ctxCacheKey{}).(*sync.Map); ok {
		cacheMap.Store(key, obj)
	}
}

func HasKey(ctx context.Context, key any) bool {
	if cacheMap, ok := ctx.Value(ctxCacheKey{}).(*sync.Map); ok {
		_, ok := cacheMap.Load(key)
		return ok
	}

	return false
}
