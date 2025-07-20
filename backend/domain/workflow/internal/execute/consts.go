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

package execute

import (
	"context"
	"sync/atomic"
	"time"

	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
)

const (
	foregroundRunTimeout     = 10 * time.Minute
	backgroundRunTimeout     = 24 * time.Hour
	maxNodeCountPerWorkflow  = 1000
	maxNodeCountPerExecution = 1000
	cancelCheckInterval      = 200 * time.Millisecond
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
