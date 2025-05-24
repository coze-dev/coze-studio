package taskgroup

import (
	"context"
	"sync/atomic"

	"golang.org/x/sync/errgroup"

	"code.byted.org/flow/opencoze/backend/pkg/logs"
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
