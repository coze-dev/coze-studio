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
	"time"

	"code.byted.org/data_edc/workflow_engine_next/infra/impl/tcc"
	"code.byted.org/gopkg/logs"
	redis "code.byted.org/kv/goredis"
)

type RedisConfig struct {
	PSMWithCluster string `json:"psm_with_cluster"` // 数据库 PSM
	DialTimeout    int    `json:"dial_timeout"`     // 连接超时时间,分钟
	ReadTimeout    int    `json:"read_timeout"`     // 读取超时时间,分钟
	WriteTimeout   int    `json:"write_timeout"`    // 写入超时时间,分钟
	PoolSize       int    `json:"pool_size"`        // 连接池大小
	PoolTimeout    int    `json:"pool_timeout"`     // 连接池超时时间,分钟
	IdleTimeout    int    `json:"idle_timeout"`
	LiveTimeout    int    `json:"live_timeout"`
}

type Client = redis.Client

func New(ctx context.Context) (*redis.Client, error) {
	c, err := getRedisConfig(ctx)
	if err != nil {
		return nil, err
	}
	option := redis.NewOptionWithTimeout(
		time.Duration(c.DialTimeout)*time.Second,
		time.Duration(c.ReadTimeout)*time.Second,
		time.Duration(c.WriteTimeout)*time.Second,
		time.Duration(c.PoolTimeout)*time.Second,
		time.Duration(c.IdleTimeout)*time.Second,
		time.Duration(c.LiveTimeout)*time.Second,
		c.PoolSize,
	)
	return redis.NewClientWithOption(c.PSMWithCluster, option)
}

var redisConfigKey = "redis_config"

func getRedisConfig(ctx context.Context) (*RedisConfig, error) {
	config, err := tcc.GetConfigByKey[RedisConfig](ctx, tcc.Client(), redisConfigKey)
	if err != nil {
		return nil, err
	}
	logs.CtxInfo(ctx, "[GetRedisConfig] get redis config success, config:%v", config)
	return &config, nil
}
