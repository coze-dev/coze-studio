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

package entity

import (
	"time"

	"github.com/coze-dev/coze-studio/backend/api/model/workflow"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
)

type WorkflowExecuteStatus workflow.WorkflowExeStatus
type NodeExecuteStatus workflow.NodeExeStatus

type WorkflowExecution struct {
	ID         int64
	WorkflowID int64
	Version    string
	SpaceID    int64
	workflowModel.ExecuteConfig
	CreatedAt time.Time
	LogID     string
	NodeCount int32
	CommitID  string

	Status     WorkflowExecuteStatus
	Duration   time.Duration
	Input      *string
	Output     *string
	ErrorCode  *string
	FailReason *string
	TokenInfo  *TokenUsage
	UpdatedAt  *time.Time

	ParentNodeID           *string
	ParentNodeExecuteID    *int64
	NodeExecutions         []*NodeExecution
	RootExecutionID        int64
	CurrentResumingEventID *int64

	InterruptEvents []*InterruptEvent
}

const (
	WorkflowRunning     = WorkflowExecuteStatus(workflow.WorkflowExeStatus_Running)
	WorkflowSuccess     = WorkflowExecuteStatus(workflow.WorkflowExeStatus_Success)
	WorkflowFailed      = WorkflowExecuteStatus(workflow.WorkflowExeStatus_Fail)
	WorkflowCancel      = WorkflowExecuteStatus(workflow.WorkflowExeStatus_Cancel)
	WorkflowInterrupted = WorkflowExecuteStatus(5)
)

const (
	NodeRunning = NodeExecuteStatus(workflow.NodeExeStatus_Running)
	NodeSuccess = NodeExecuteStatus(workflow.NodeExeStatus_Success)
	NodeFailed  = NodeExecuteStatus(workflow.NodeExeStatus_Fail)
)

type TokenUsage struct {
	InputTokens  int64
	OutputTokens int64
}

type NodeExecution struct {
	ID        int64
	ExecuteID int64
	NodeID    string
	NodeName  string
	NodeType  NodeType
	CreatedAt time.Time

	Status     NodeExecuteStatus
	Duration   time.Duration
	Input      *string
	Output     *string
	RawOutput  *string
	ErrorInfo  *string
	ErrorLevel *string
	TokenInfo  *TokenUsage
	UpdatedAt  *time.Time

	Index int
	Items *string

	ParentNodeID         *string
	SubWorkflowExecution *WorkflowExecution
	IndexedExecutions    []*NodeExecution

	Extra *NodeExtra
}

type NodeExtra struct {
	CurrentSubExecuteID int64          `json:"current_sub_execute_id,omitempty"`
	ResponseExtra       map[string]any `json:"response_extra,omitempty"`
	SubExecuteID        int64          `json:"subExecuteID,omitempty"` // for subworkflow node, the execute id of the sub workflow
}

type FCCalled struct {
	Input  string `json:"input,omitempty"`
	Output string `json:"output,omitempty"`
}

type FCCalledDetail struct {
	FCCalledList []*FCCalled `json:"fc_called_list,omitempty"`
}
