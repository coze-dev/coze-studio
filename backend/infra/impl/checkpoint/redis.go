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

	"github.com/cloudwego/eino/compose"
	"github.com/redis/go-redis/v9"

	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
)

type redisStore struct {
	client cache.Cmdable
}

const (
	checkpointKeyTpl = "checkpoint_key:%s"
	checkpointExpire = 24 * 7 * 3600 * time.Second
)

func (r *redisStore) Get(ctx context.Context, checkPointID string) ([]byte, bool, error) {
	v, err := r.client.Get(ctx, fmt.Sprintf(checkpointKeyTpl, checkPointID)).Bytes()
	if err != nil {
		if errors.Is(err, cache.Nil) {
			return nil, false, nil
		}
		return nil, false, err
	}
	return v, true, nil
}

func (r *redisStore) Set(ctx context.Context, checkPointID string, checkPoint []byte) error {
	return r.client.Set(ctx, fmt.Sprintf(checkpointKeyTpl, checkPointID), checkPoint, checkpointExpire).Err()
}

func NewRedisStore(client *redis.Client) compose.CheckPointStore {
	return &redisStore{client: client}
}
