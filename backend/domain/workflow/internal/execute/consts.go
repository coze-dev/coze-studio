package execute

import (
	"context"
	"sync/atomic"
	"time"

	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
)

const (
	foregroundRunTimeout     = 10 * time.Minute
	backgroundRunTimeout     = 24 * time.Hour
	maxNodeCountPerWorkflow  = 1000
	maxNodeCountPerExecution = 1000
)

type StaticConfig struct {
	ForegroundRunTimeout     time.Duration
	BackgroundRunTimeout     time.Duration
	MaxNodeCountPerWorkflow  int
	MaxNodeCountPerExecution int
}

func GetStaticConfig() *StaticConfig {
	return &StaticConfig{
		ForegroundRunTimeout:     foregroundRunTimeout,
		BackgroundRunTimeout:     backgroundRunTimeout,
		MaxNodeCountPerWorkflow:  maxNodeCountPerWorkflow,
		MaxNodeCountPerExecution: maxNodeCountPerExecution,
	}
}

const (
	executedNodeCountKey = "executed_node_count"
)

func IncrAndCheckExecutedNodes(ctx context.Context) (int64, bool) {
	counter, ok := ctxcache.Get[atomic.Int64](ctx, executedNodeCountKey)
	if !ok {
		return 0, false
	}

	current := counter.Add(1)
	return current, current > maxNodeCountPerExecution
}

func InitExecutedNodesCounter(ctx context.Context) context.Context {
	ctxcache.Store(ctx, executedNodeCountKey, atomic.Int64{})
	return ctx
}
