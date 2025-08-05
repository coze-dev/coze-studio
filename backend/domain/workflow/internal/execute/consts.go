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
	"time"
)

const (
	foregroundRunTimeout     = 0 // timeout for workflow execution in foreground mode, 0 means no timeout
	backgroundRunTimeout     = 0 // timeout for workflow execution in background mode, 0 means no timeout
	maxNodeCountPerWorkflow  = 0 // maximum node count for a workflow, 0 means no limit
	maxNodeCountPerExecution = 0 // maximum node count for a workflow execution, 0 means no limit
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

func IncrementAndCheckExecutedNodes(ctx context.Context) (int64, bool) {
	exeCtx := GetExeCtx(ctx)
	if exeCtx == nil {
		return 0, false
	}

	counter := exeCtx.executed
	if counter == nil {
		return 0, false
	}

	current := (*counter).Add(1)
	return current, current > maxNodeCountPerExecution
}
