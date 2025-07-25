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

package checkpoint

import (
	"context"
	"errors"
	"fmt"
	"time"

	redis "code.byted.org/kv/goredis"
	redisV6 "code.byted.org/kv/redis-v6"
	"github.com/cloudwego/eino/compose"
)

type redisStore struct {
	client *redis.Client
}

const (
	checkpointKeyTpl = "checkpoint_key:%s"
	checkpointExpire = 24 * 7 * 3600 * time.Second
)

func (r *redisStore) Get(ctx context.Context, checkPointID string) ([]byte, bool, error) {
	v, err := r.client.WithContext(ctx).Get(fmt.Sprintf(checkpointKeyTpl, checkPointID)).Bytes()
	if err != nil {
		if errors.Is(err, redisV6.Nil) {
			return nil, false, nil
		}
		return nil, false, err
	}
	return v, true, nil
}

func (r *redisStore) Set(ctx context.Context, checkPointID string, checkPoint []byte) error {
	return r.client.WithContext(ctx).Set(fmt.Sprintf(checkpointKeyTpl, checkPointID), checkPoint, checkpointExpire).Err()
}

func NewRedisStore(client *redis.Client) compose.CheckPointStore {
	return &redisStore{client: client}
}
