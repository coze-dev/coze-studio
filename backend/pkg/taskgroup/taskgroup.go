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

package taskgroup

import (
	"context"
	"sync/atomic"

	"golang.org/x/sync/errgroup"

	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type TaskGroup interface {
	Go(f func() error)
	Wait() error
}

type taskGroup struct {
	errGroup    *errgroup.Group
	ctx         context.Context
	execAllTask atomic.Bool
}

// NewTaskGroup if one task return error, the rest task will stop
func NewTaskGroup(ctx context.Context, concurrentCount int) TaskGroup {
	t := &taskGroup{}
	t.errGroup, t.ctx = errgroup.WithContext(ctx)
	t.errGroup.SetLimit(concurrentCount)
	t.execAllTask.Store(false)

	return t
}

// NewUninterruptibleTaskGroup if one task return error, the rest task will continue
func NewUninterruptibleTaskGroup(ctx context.Context, concurrentCount int) TaskGroup {
	t := &taskGroup{}
	t.errGroup, t.ctx = errgroup.WithContext(ctx)
	t.errGroup.SetLimit(concurrentCount)
	t.execAllTask.Store(true)

	return t
}

func (t *taskGroup) Go(f func() error) {
	t.errGroup.Go(func() error {
		defer func() {
			if err := recover(); err != nil {
				logs.CtxErrorf(t.ctx, "[TaskGroup] exec panic recover:%+v", err)
			}
		}()

		if !t.execAllTask.Load() {
			select {
			case <-t.ctx.Done():
				return t.ctx.Err()
			default:
			}
		}

		return f()
	})
}

func (t *taskGroup) Wait() error {
	return t.errGroup.Wait()
}
