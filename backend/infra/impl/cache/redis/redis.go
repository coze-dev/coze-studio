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
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

type Client = redis.Client

func New() *redis.Client {
	addr := os.Getenv("REDIS_ADDR")
	password := os.Getenv("REDIS_PASSWORD")
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

	return rdb
}
