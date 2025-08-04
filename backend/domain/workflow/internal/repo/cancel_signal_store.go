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

package repo

import (
	"context"
	"fmt"
	"time"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type cancelSignalStoreImpl struct {
	redis cache.Cmdable
}

const workflowExecutionCancelStatusKey = "workflow:cancel:status:%d"

func (c *cancelSignalStoreImpl) SetWorkflowCancelFlag(ctx context.Context, wfExeID int64) (err error) {
	statusKey := fmt.Sprintf(workflowExecutionCancelStatusKey, wfExeID)
	// Define a reasonable expiration for the status key, e.g., 24 hours
	expiration := 24 * time.Hour

	// set a kv to redis to indicate cancellation status
	err = c.redis.Set(ctx, statusKey, "cancelled", expiration).Err()
	if err != nil {
		return vo.WrapError(errno.ErrRedisError,
			fmt.Errorf("failed to set workflow cancel status for wfExeID %d after publishing signal: %w", wfExeID, err))
	}

	return nil
}

func (c *cancelSignalStoreImpl) GetWorkflowCancelFlag(ctx context.Context, wfExeID int64) (bool, error) {
	// Construct Redis key for workflow cancellation status
	key := fmt.Sprintf(workflowExecutionCancelStatusKey, wfExeID)

	// Check if the key exists in Redis
	count, err := c.redis.Exists(ctx, key).Result()
	if err != nil {
		return false, vo.WrapError(errno.ErrRedisError, fmt.Errorf("failed to check cancellation status in Redis: %w", err))
	}

	// If key exists (count == 1), return true; otherwise return false
	return count == 1, nil
}
