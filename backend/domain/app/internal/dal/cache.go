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

package dal

import (
	"context"
	"errors"
	"time"

	redis "code.byted.org/kv/goredis"
	redisV6 "code.byted.org/kv/redis-v6"

	"code.byted.org/data_edc/workflow_engine_next/pkg/lang/ptr"
)

type AppCache struct {
	cacheCli *redis.Client
}

func NewAppCache(cacheCli *redis.Client) *AppCache {
	return &AppCache{
		cacheCli: cacheCli,
	}
}

func (a *AppCache) Get(ctx context.Context, key string) (value string, exist bool, err error) {
	cmd := a.cacheCli.WithContext(ctx).Get(key)
	if cmd.Err() != nil {
		if errors.Is(cmd.Err(), redisV6.Nil) {
			return "", false, nil
		}
		return "", false, cmd.Err()
	}

	return cmd.Val(), true, nil
}

func (a *AppCache) Set(ctx context.Context, key string, value string, expiration *time.Duration) (err error) {
	_expiration := ptr.FromOrDefault(expiration, 0)

	cmd := a.cacheCli.WithContext(ctx).Set(key, value, _expiration)

	return cmd.Err()
}
