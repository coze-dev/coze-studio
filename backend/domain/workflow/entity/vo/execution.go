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

package vo

type ExecuteConfig struct {
	ID            int64
	From          Locator
	Version       string
	CommitID      string
	Operator      int64
	Mode          ExecuteMode
	AppID         *int64
	AgentID       *int64
	ConnectorID   int64
	ConnectorUID  string
	TaskType      TaskType
	SyncPattern   SyncPattern
	InputFailFast bool // whether to fail fast if input conversion has warnings
	BizType       BizType
	Cancellable   bool
}

type ExecuteMode string

const (
	ExecuteModeDebug     ExecuteMode = "debug"
	ExecuteModeRelease   ExecuteMode = "release"
	ExecuteModeNodeDebug ExecuteMode = "node_debug"
)

type TaskType string

const (
	TaskTypeForeground TaskType = "foreground"
	TaskTypeBackground TaskType = "background"
)

type SyncPattern string

const (
	SyncPatternSync   SyncPattern = "sync"
	SyncPatternAsync  SyncPattern = "async"
	SyncPatternStream SyncPattern = "stream"
)

var DebugURLTpl = "http://127.0.0.1:3000/work_flow?execute_id=%d&space_id=%d&workflow_id=%d&execute_mode=2"

type BizType string

const (
	BizTypeAgent    BizType = "agent"
	BizTypeWorkflow BizType = "workflow"
)
