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
	"strconv"

	redis "code.byted.org/kv/goredis"
	redisV6 "code.byted.org/kv/redis-v6"

	"code.byted.org/data_edc/workflow_engine_next/pkg/errorx"
)

func NewCountRepo(cli *redis.Client) *CounterImpl {
	return &CounterImpl{
		cacheClient: cli,
	}
}

type CounterImpl struct {
	cacheClient *redis.Client
}

func (c *CounterImpl) Get(ctx context.Context, key string) (int64, error) {
	val, err := c.cacheClient.WithContext(ctx).Get(key).Result()
	if err == redisV6.Nil {
		return 0, nil
	}
	if err != nil {
		return 0, errorx.Wrapf(err, "failed to get count for %s", key)
	}

	return strconv.ParseInt(val, 10, 64)
}

func (c *CounterImpl) IncrBy(ctx context.Context, key string, incr int64) error {
	_, err := c.cacheClient.WithContext(ctx).IncrBy(key, incr).Result()
	return errorx.Wrapf(err, "failed to incr_by count for %s", key)
}

func (c *CounterImpl) Set(ctx context.Context, key string, value int64) error {
	_, err := c.cacheClient.WithContext(ctx).Set(key, value, 0).Result()
	return errorx.Wrapf(err, "failed to set count for %s", key)
}

func (c *CounterImpl) Del(ctx context.Context, key string) error {
	_, err := c.cacheClient.WithContext(ctx).Del(key).Result()
	return errorx.Wrapf(err, "failed to del count for %s", key)
}
