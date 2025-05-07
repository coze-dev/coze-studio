package ctxcache

import (
	"context"
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
