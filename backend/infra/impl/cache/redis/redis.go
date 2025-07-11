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
	"time"

	redis "code.byted.org/kv/goredis"
)

type Client = redis.Client

func New() (*redis.Client, error) {
	// TODO: OPTIONS 放到 TCC 中
	option := redis.NewOptionWithTimeout(
		5*time.Second,
		3*time.Second,
		3*time.Second,
		0, 0, 0,
		100,
	)
	return redis.NewClientWithOption("toutiao.redis.ecom_worklfow_platform.service.maliva", option)
}
