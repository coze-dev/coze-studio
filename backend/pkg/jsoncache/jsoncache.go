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

package jsoncache

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
)

type JsonCache[T any] struct {
	cache  cache.Cmdable
	prefix string
}

func New[T any](prefix string, cache cache.Cmdable) *JsonCache[T] {
	return &JsonCache[T]{
		prefix: prefix,
		cache:  cache,
	}
}

func (g *JsonCache[T]) Save(ctx context.Context, k string, v *T) error {
	if v == nil {
		return fmt.Errorf("cannot save nil value for key: %s", k)
	}

	data, err := json.Marshal(v)
	if err != nil {
		return fmt.Errorf("marshal failed for type %T: %w", *v, err)
	}

	key := g.prefix + k
	if err := g.cache.Set(ctx, key, data, 0).Err(); err != nil {
		return fmt.Errorf("redis set failed for key %s: %w", k, err)
	}
	return nil
}

// Get returns default T if key not found
func (g *JsonCache[T]) Get(ctx context.Context, k string) (*T, error) {
	key := g.prefix + k
	var obj T

	data, err := g.cache.Get(ctx, key).Result()
	if err == cache.Nil {
		return &obj, nil
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get key %s: %w", k, err)
	}

	if err := json.Unmarshal([]byte(data), &obj); err != nil {
		return nil, fmt.Errorf("failed to unmarshal json for key %s: %w", k, err)
	}
	return &obj, nil
}

func (g *JsonCache[T]) Delete(ctx context.Context, k string) error {
	if err := g.cache.Del(ctx, k).Err(); err != nil {
		return fmt.Errorf("failed to delete key %s: %w", k, err)
	}
	return nil
}
