package goutil

import (
	"context"
	"fmt"
	"runtime/debug"

	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func Recovery(ctx context.Context) {
	e := recover()
	if e == nil {
		return
	}

	if ctx == nil {
		ctx = context.Background() // nolint: byted_context_not_reinitialize -- false positive
	}

	err := fmt.Errorf("%v", e)
	logs.CtxErrorf(ctx, fmt.Sprintf("[catch panic] err = %v \n stacktrace:\n%s", err, debug.Stack()))
}
