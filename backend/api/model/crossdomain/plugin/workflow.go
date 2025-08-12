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

package plugin

import (
	"github.com/coze-dev/coze-studio/backend/api/model/workflow"
)

type ToolsInfoRequest struct {
	PluginEntity PluginEntity
	ToolIDs      []int64
	IsDraft      bool
}

type PluginEntity struct {
	PluginID      int64
	PluginVersion *string // nil or "0" means draft, "" means latest/online version, otherwise is specific version
}

type DependenceResource struct {
	PluginIDs    []int64
	KnowledgeIDs []int64
	DatabaseIDs  []int64
}

type ExternalResourceRelated struct {
	PluginMap     map[int64]*PluginEntity
	PluginToolMap map[int64]int64

	KnowledgeMap map[int64]int64
	DatabaseMap  map[int64]int64
}

type CopyWorkflowPolicy struct {
	TargetSpaceID            *int64
	TargetAppID              *int64
	ModifiedCanvasSchema     *string
	ShouldModifyWorkflowName bool
}

type ToolsInfoResponse struct {
	PluginID      int64
	SpaceID       int64
	Version       string
	PluginName    string
	Description   string
	IconURL       string
	PluginType    int64
	ToolInfoList  map[int64]ToolInfoW
	LatestVersion *string
	IsOfficial    bool
	AppID         int64
}

type ToolInfoW struct {
	ToolName     string
	ToolID       int64
	Description  string
	DebugExample *DebugExample

	Inputs  []*workflow.APIParameter
	Outputs []*workflow.APIParameter
}

type DebugExample struct {
	ReqExample  string
	RespExample string
}

type ToolsInvokableRequest struct {
	PluginEntity       PluginEntity
	ToolsInvokableInfo map[int64]*ToolsInvokableInfo
	IsDraft            bool
}

type WorkflowAPIParameters = []*workflow.APIParameter

type ToolsInvokableInfo struct {
	ToolID                      int64
	RequestAPIParametersConfig  WorkflowAPIParameters
	ResponseAPIParametersConfig WorkflowAPIParameters
}

type Locator uint8

const (
	FromDraft Locator = iota
	FromSpecificVersion
	FromLatestVersion
)

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
