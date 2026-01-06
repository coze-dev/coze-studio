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

package redis

import (
	"context"
	"os"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/coze-dev/coze-studio/backend/infra/cache"
)

type Cmdable = cache.Cmdable

func New() cache.Cmdable {
	addr := os.Getenv("REDIS_ADDR")
	password := os.Getenv("REDIS_PASSWORD")

	return NewWithAddrAndPassword(addr, password)
}

func NewWithAddrAndPassword(addr, password string) cache.Cmdable {
	cache.SetDefaultNilError(redis.Nil)

	rdb := redis.NewClient(&redis.Options{
		Addr:     addr, // Redis地址
		DB:       0,    // 默认数据库
		Password: password,
		// connection pool configuration
		PoolSize:        100,             // Maximum number of connections (recommended to set to CPU cores * 10)
		MinIdleConns:    10,              // minimum idle connection
		MaxIdleConns:    30,              // maximum idle connection
		ConnMaxIdleTime: 5 * time.Minute, // Idle connection timeout

		// timeout configuration
		DialTimeout:  5 * time.Second, // Connection establishment timed out
		ReadTimeout:  3 * time.Second, // read operation timed out
		WriteTimeout: 3 * time.Second, // write operation timed out
	})

	return &redisImpl{client: rdb}
}

type redisImpl struct {
	client *redis.Client
}

// Del implements cache.Cmdable.
func (r *redisImpl) Del(ctx context.Context, keys ...string) cache.IntCmd {
	return r.client.Del(ctx, keys...)
}

// Exists implements cache.Cmdable.
func (r *redisImpl) Exists(ctx context.Context, keys ...string) cache.IntCmd {
	return r.client.Exists(ctx, keys...)
}

// Expire implements cache.Cmdable.
func (r *redisImpl) Expire(ctx context.Context, key string, expiration time.Duration) cache.BoolCmd {
	return r.client.Expire(ctx, key, expiration)
}

// Get implements cache.Cmdable.
func (r *redisImpl) Get(ctx context.Context, key string) cache.StringCmd {
	return r.client.Get(ctx, key)
}

// HGetAll implements cache.Cmdable.
func (r *redisImpl) HGetAll(ctx context.Context, key string) cache.MapStringStringCmd {
	return r.client.HGetAll(ctx, key)
}

// HSet implements cache.Cmdable.
func (r *redisImpl) HSet(ctx context.Context, key string, values ...interface{}) cache.IntCmd {
	return r.client.HSet(ctx, key, values...)
}

// Incr implements cache.Cmdable.
func (r *redisImpl) Incr(ctx context.Context, key string) cache.IntCmd {
	return r.client.Incr(ctx, key)
}

// IncrBy implements cache.Cmdable.
func (r *redisImpl) IncrBy(ctx context.Context, key string, value int64) cache.IntCmd {
	return r.client.IncrBy(ctx, key, value)
}

// LIndex implements cache.Cmdable.
func (r *redisImpl) LIndex(ctx context.Context, key string, index int64) cache.StringCmd {
	return r.client.LIndex(ctx, key, index)
}

// LPop implements cache.Cmdable.
func (r *redisImpl) LPop(ctx context.Context, key string) cache.StringCmd {
	return r.client.LPop(ctx, key)
}

// LPush implements cache.Cmdable.
func (r *redisImpl) LPush(ctx context.Context, key string, values ...interface{}) cache.IntCmd {
	return r.client.LPush(ctx, key, values...)
}

// LRange implements cache.Cmdable.
func (r *redisImpl) LRange(ctx context.Context, key string, start int64, stop int64) cache.StringSliceCmd {
	return r.client.LRange(ctx, key, start, stop)
}

// LSet implements cache.Cmdable.
func (r *redisImpl) LSet(ctx context.Context, key string, index int64, value interface{}) cache.StatusCmd {
	return r.client.LSet(ctx, key, index, value)
}

// Pipeline implements cache.Cmdable.
func (r *redisImpl) Pipeline() cache.Pipeliner {
	p := r.client.Pipeline()
	return &pipelineImpl{p: p}
}

// RPush implements cache.Cmdable.
func (r *redisImpl) RPush(ctx context.Context, key string, values ...interface{}) cache.IntCmd {
	return r.client.RPush(ctx, key, values...)
}

// Set implements cache.Cmdable.
func (r *redisImpl) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) cache.StatusCmd {
	return r.client.Set(ctx, key, value, expiration)
}

type pipelineImpl struct {
	p redis.Pipeliner
}

// Del implements cache.Pipeliner.
func (p *pipelineImpl) Del(ctx context.Context, keys ...string) cache.IntCmd {
	return p.p.Del(ctx, keys...)
}

// Exec implements cache.Pipeliner.
func (p *pipelineImpl) Exec(ctx context.Context) ([]cache.Cmder, error) {
	cmders, err := p.p.Exec(ctx)
	if err != nil {
		return nil, err
	}
	return convertCmders(cmders), nil
}

func convertCmders(cmders []redis.Cmder) []cache.Cmder {
	res := make([]cache.Cmder, 0, len(cmders))
	for _, cmder := range cmders {
		res = append(res, &cmderImpl{cmder: cmder})
	}
	return res
}

type cmderImpl struct {
	cmder redis.Cmder
}

func (c *cmderImpl) Err() error {
	return c.cmder.Err()
}

// Exists implements cache.Pipeliner.
func (p *pipelineImpl) Exists(ctx context.Context, keys ...string) cache.IntCmd {
	return p.p.Exists(ctx, keys...)
}

// Expire implements cache.Pipeliner.
func (p *pipelineImpl) Expire(ctx context.Context, key string, expiration time.Duration) cache.BoolCmd {
	return p.p.Expire(ctx, key, expiration)
}

// Get implements cache.Pipeliner.
func (p *pipelineImpl) Get(ctx context.Context, key string) cache.StringCmd {
	return p.p.Get(ctx, key)
}

// HGetAll implements cache.Pipeliner.
func (p *pipelineImpl) HGetAll(ctx context.Context, key string) cache.MapStringStringCmd {
	return p.p.HGetAll(ctx, key)
}

// HSet implements cache.Pipeliner.
func (p *pipelineImpl) HSet(ctx context.Context, key string, values ...interface{}) cache.IntCmd {
	return p.p.HSet(ctx, key, values...)
}

// Incr implements cache.Pipeliner.
func (p *pipelineImpl) Incr(ctx context.Context, key string) cache.IntCmd {
	return p.p.Incr(ctx, key)
}

// IncrBy implements cache.Pipeliner.
func (p *pipelineImpl) IncrBy(ctx context.Context, key string, value int64) cache.IntCmd {
	return p.p.IncrBy(ctx, key, value)
}

// LIndex implements cache.Pipeliner.
func (p *pipelineImpl) LIndex(ctx context.Context, key string, index int64) cache.StringCmd {
	return p.p.LIndex(ctx, key, index)
}

// LPop implements cache.Pipeliner.
func (p *pipelineImpl) LPop(ctx context.Context, key string) cache.StringCmd {
	return p.p.LPop(ctx, key)
}

// LPush implements cache.Pipeliner.
func (p *pipelineImpl) LPush(ctx context.Context, key string, values ...interface{}) cache.IntCmd {
	return p.p.LPush(ctx, key, values...)
}

// LRange implements cache.Pipeliner.
func (p *pipelineImpl) LRange(ctx context.Context, key string, start int64, stop int64) cache.StringSliceCmd {
	return p.p.LRange(ctx, key, start, stop)
}

// LSet implements cache.Pipeliner.
func (p *pipelineImpl) LSet(ctx context.Context, key string, index int64, value interface{}) cache.StatusCmd {
	return p.p.LSet(ctx, key, index, value)
}

// Pipeline implements cache.Pipeliner.
func (p *pipelineImpl) Pipeline() cache.Pipeliner {
	return p
}

// RPush implements cache.Pipeliner.
func (p *pipelineImpl) RPush(ctx context.Context, key string, values ...interface{}) cache.IntCmd {
	return p.p.RPush(ctx, key, values...)
}

// Set implements cache.Pipeliner.
func (p *pipelineImpl) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) cache.StatusCmd {
	return p.p.Set(ctx, key, value, expiration)
}
