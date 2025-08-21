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
	"errors"
	"fmt"
	"time"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type interruptEventStoreImpl struct {
	redis cache.Cmdable
}

const (
	// interruptEventListKeyPattern stores events as a list (e.g., "interrupt_event_list:{wfExeID}")
	interruptEventListKeyPattern   = "interrupt_event_list:%d"
	interruptEventTTL              = 24 * time.Hour // Example: expire after 24 hours
	previousResumedEventKeyPattern = "previous_resumed_event:%d"
)

// SaveInterruptEvents saves multiple interrupt events to the end of a Redis list.
func (i *interruptEventStoreImpl) SaveInterruptEvents(ctx context.Context, wfExeID int64, events []*entity.InterruptEvent) (err error) {
	if len(events) == 0 {
		return nil
	}

	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrRedisError, err)
		}
	}()

	listKey := fmt.Sprintf(interruptEventListKeyPattern, wfExeID)
	previousResumedEventKey := fmt.Sprintf(previousResumedEventKeyPattern, wfExeID)

	currentEvents, err := i.ListInterruptEvents(ctx, wfExeID)
	if err != nil {
		return err
	}

	for _, currentE := range currentEvents {
		if len(events) == 0 {
			break
		}
		j := len(events)
		for i := 0; i < j; i++ {
			if events[i].ID == currentE.ID {
				events = append(events[:i], events[i+1:]...)
				i--
				j--
			}
		}
	}

	if len(events) == 0 {
		return nil
	}

	previousEventStr, err := i.redis.Get(ctx, previousResumedEventKey).Result()
	if err != nil {
		if !errors.Is(err, cache.Nil) {
			return fmt.Errorf("failed to get previous resumed event for wfExeID %d: %w", wfExeID, err)
		}
	}

	var previousEvent *entity.InterruptEvent
	if previousEventStr != "" {
		err = sonic.UnmarshalString(previousEventStr, &previousEvent)
		if err != nil {
			return vo.WrapError(errno.ErrSerializationDeserializationFail,
				fmt.Errorf("failed to unmarshal previous resumed event (wfExeID %d) from JSON: %w", wfExeID, err))
		}
	}

	var topPriorityEvent *entity.InterruptEvent
	if previousEvent != nil {
		for i := range events {
			if previousEvent.NodeKey == events[i].NodeKey {
				topPriorityEvent = events[i]
				events = append(events[:i], events[i+1:]...)
				break
			}
		}
	}

	pipe := i.redis.Pipeline()
	eventJSONs := make([]interface{}, 0, len(events))

	for _, event := range events {
		eventJSON, err := sonic.MarshalString(event)
		if err != nil {
			return vo.WrapError(errno.ErrSerializationDeserializationFail,
				fmt.Errorf("failed to marshal interrupt event %d to JSON: %w", event.ID, err))
		}
		eventJSONs = append(eventJSONs, eventJSON)
	}

	if topPriorityEvent != nil {
		topPriorityEventJSON, err := sonic.MarshalString(topPriorityEvent)
		if err != nil {
			return vo.WrapError(errno.ErrSerializationDeserializationFail,
				fmt.Errorf("failed to marshal top priority interrupt event %d to JSON: %w", topPriorityEvent.ID, err))
		}
		pipe.LPush(ctx, listKey, topPriorityEventJSON)
	}

	if len(eventJSONs) > 0 {
		pipe.RPush(ctx, listKey, eventJSONs...)
	}

	pipe.Expire(ctx, listKey, interruptEventTTL)

	_, err = pipe.Exec(ctx) // ignore_security_alert SQL_INJECTION
	if err != nil {
		return fmt.Errorf("failed to save interrupt events to Redis list: %w", err)
	}

	return nil
}

// GetFirstInterruptEvent retrieves the first interrupt event from the list without removing it.
func (i *interruptEventStoreImpl) GetFirstInterruptEvent(ctx context.Context, wfExeID int64) (
	_ *entity.InterruptEvent, _ bool, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrRedisError, err)
		}
	}()

	listKey := fmt.Sprintf(interruptEventListKeyPattern, wfExeID)

	eventJSON, err := i.redis.LIndex(ctx, listKey, 0).Result()
	if err != nil {
		if errors.Is(err, cache.Nil) {
			return nil, false, nil // List is empty or key does not exist
		}
		return nil, false, fmt.Errorf("failed to get first interrupt event from Redis list for wfExeID %d: %w", wfExeID, err)
	}

	var event entity.InterruptEvent
	err = sonic.UnmarshalString(eventJSON, &event)
	if err != nil {
		return nil, false, vo.WrapError(errno.ErrSerializationDeserializationFail,
			fmt.Errorf("failed to unmarshal first interrupt event (wfExeID %d) from JSON: %w", wfExeID, err))
	}

	return &event, true, nil
}

func (i *interruptEventStoreImpl) UpdateFirstInterruptEvent(ctx context.Context, wfExeID int64, event *entity.InterruptEvent) (err error) {
	defer func() {
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrRedisError, err)
		}
	}()

	listKey := fmt.Sprintf(interruptEventListKeyPattern, wfExeID)
	eventJSON, err := sonic.MarshalString(event)
	if err != nil {
		return vo.WrapError(errno.ErrSerializationDeserializationFail,
			fmt.Errorf("failed to marshal interrupt event %d to JSON: %w", event.ID, err))
	}
	err = i.redis.LSet(ctx, listKey, 0, eventJSON).Err()
	if err != nil {
		return fmt.Errorf("failed to update first interrupt event in Redis list for wfExeID %d: %w", wfExeID, err)
	}

	previousResumedEventKey := fmt.Sprintf(previousResumedEventKeyPattern, wfExeID)
	err = i.redis.Set(ctx, previousResumedEventKey, eventJSON, interruptEventTTL).Err()
	if err != nil {
		return fmt.Errorf("failed to set previous resumed event for wfExeID %d: %w", wfExeID, err)
	}

	return nil
}

// PopFirstInterruptEvent retrieves and removes the first interrupt event from the list.
func (i *interruptEventStoreImpl) PopFirstInterruptEvent(ctx context.Context, wfExeID int64) (*entity.InterruptEvent, bool, error) {
	listKey := fmt.Sprintf(interruptEventListKeyPattern, wfExeID)

	eventJSON, err := i.redis.LPop(ctx, listKey).Result()
	if err != nil {
		if errors.Is(err, cache.Nil) {
			return nil, false, nil // List is empty or key does not exist
		}
		return nil, false, vo.WrapError(errno.ErrRedisError,
			fmt.Errorf("failed to pop first interrupt event from Redis list for wfExeID %d: %w", wfExeID, err))
	}

	var event entity.InterruptEvent
	err = sonic.UnmarshalString(eventJSON, &event)
	if err != nil {
		// If unmarshalling fails, the event is already popped.
		// Consider if you need to re-queue or handle this scenario.
		return nil, true, vo.WrapError(errno.ErrSerializationDeserializationFail,
			fmt.Errorf("failed to unmarshal popped interrupt event (wfExeID %d) from JSON: %w", wfExeID, err))
	}

	return &event, true, nil
}

func (i *interruptEventStoreImpl) ListInterruptEvents(ctx context.Context, wfExeID int64) ([]*entity.InterruptEvent, error) {
	listKey := fmt.Sprintf(interruptEventListKeyPattern, wfExeID)

	eventJSONs, err := i.redis.LRange(ctx, listKey, 0, -1).Result()
	if err != nil {
		if errors.Is(err, cache.Nil) {
			return nil, nil // List is empty or key does not exist
		}
		return nil, vo.WrapError(errno.ErrRedisError,
			fmt.Errorf("failed to get all interrupt events from Redis list for wfExeID %d: %w", wfExeID, err))
	}

	var events []*entity.InterruptEvent
	for _, s := range eventJSONs {
		var event entity.InterruptEvent
		err = sonic.UnmarshalString(s, &event)
		if err != nil {
			return nil, vo.WrapError(errno.ErrSerializationDeserializationFail,
				fmt.Errorf("failed to unmarshal first interrupt event (wfExeID %d) from JSON: %w", wfExeID, err))
		}
		events = append(events, &event)
	}

	return events, nil
}
