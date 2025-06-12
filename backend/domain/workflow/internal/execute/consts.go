package execute

import (
	"context"
	"sync/atomic"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
)

const (
	foregroundRunTimeout     = 10 * time.Minute
	backgroundRunTimeout     = 24 * time.Hour
	maxNodeCountPerWorkflow  = 1000
	maxNodeCountPerExecution = 1000
)

func GetStaticConfig() *vo.StaticConfig {
	return &vo.StaticConfig{
		ForegroundRunTimeout:     foregroundRunTimeout,
		BackgroundRunTimeout:     backgroundRunTimeout,
		MaxNodeCountPerWorkflow:  maxNodeCountPerWorkflow,
		MaxNodeCountPerExecution: maxNodeCountPerExecution,
	}
}

const (
	executedNodeCountKey = "executed_node_count"
)

func IncreAndCheckExecutedNodes(ctx context.Context) (int64, bool) {
	counter, ok := ctxcache.Get[atomic.Int64](ctx, executedNodeCountKey)
	if !ok {
		return 0, false
	}

	current := counter.Add(1)
	return current, current > maxNodeCountPerExecution
}

func InitExecutedNodesCounter(ctx context.Context) context.Context {
	ctx = ctxcache.Init(ctx)
	ctxcache.Store(ctx, executedNodeCountKey, atomic.Int64{})
	return ctx
}
