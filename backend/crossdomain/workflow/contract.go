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

package crossworkflow

import (
	"context"

	"github.com/cloudwego/eino/compose"
	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	workflowEntity "github.com/coze-dev/coze-studio/backend/domain/workflow/entity"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

// TODO (@fanlv): Parameter references need to be modified.
type Workflow interface {
	WorkflowAsModelTool(ctx context.Context, policies []*vo.GetPolicy) ([]workflow.ToolFromWorkflow, error)
	WithResumeToolWorkflow(resumingEvent *workflowEntity.ToolInterruptEvent, resumeData string,
		allInterruptEvents map[string]*workflowEntity.ToolInterruptEvent) einoCompose.Option
	ReleaseApplicationWorkflows(ctx context.Context, appID int64, config *ReleaseWorkflowConfig) ([]*vo.ValidateIssue, error)
	GetWorkflowIDsByAppID(ctx context.Context, appID int64) ([]int64, error)

	SyncExecuteWorkflow(ctx context.Context, config workflowModel.ExecuteConfig, input map[string]any) (*workflowEntity.WorkflowExecution, vo.TerminatePlan, error)
	StreamExecute(ctx context.Context, config workflowModel.ExecuteConfig, input map[string]any) (*schema.StreamReader[*workflowEntity.Message], error)
	WithExecuteConfig(cfg workflowModel.ExecuteConfig) einoCompose.Option
	WithMessagePipe() (compose.Option, *schema.StreamReader[*entity.Message], func())
	StreamResume(ctx context.Context, req *entity.ResumeRequest, config workflowModel.ExecuteConfig) (*schema.StreamReader[*entity.Message], error)
	InitApplicationDefaultConversationTemplate(ctx context.Context, spaceID int64, appID int64, userID int64) error
}

type ExecuteConfig = workflowModel.ExecuteConfig
type ExecuteMode = workflowModel.ExecuteMode

type WorkflowMessage = workflowEntity.Message

type StateMessage = workflowEntity.StateMessage

type NodeType = entity.NodeType
type MessageType = entity.MessageType
type InterruptEvent = workflowEntity.InterruptEvent
type EventType = workflowEntity.InterruptEventType
type ResumeRequest = entity.ResumeRequest
type WorkflowExecuteStatus = entity.WorkflowExecuteStatus

const (
	WorkflowRunning     = WorkflowExecuteStatus(entity.WorkflowRunning)
	WorkflowSuccess     = WorkflowExecuteStatus(entity.WorkflowSuccess)
	WorkflowFailed      = WorkflowExecuteStatus(entity.WorkflowFailed)
	WorkflowCancel      = WorkflowExecuteStatus(entity.WorkflowCancel)
	WorkflowInterrupted = WorkflowExecuteStatus(entity.WorkflowInterrupted)
)

const (
	Answer       MessageType = "answer"
	FunctionCall MessageType = "function_call"
	ToolResponse MessageType = "tool_response"
)

const (
	NodeTypeOutputEmitter NodeType = "OutputEmitter"
	NodeTypeInputReceiver NodeType = "InputReceiver"
	NodeTypeQuestion      NodeType = "QuestionAnswer"
)

const (
	ExecuteModeDebug     ExecuteMode = "debug"
	ExecuteModeRelease   ExecuteMode = "release"
	ExecuteModeNodeDebug ExecuteMode = "node_debug"
)

type TaskType = workflowModel.TaskType

type SyncPattern = workflowModel.SyncPattern

const (
	SyncPatternSync   SyncPattern = "sync"
	SyncPatternAsync  SyncPattern = "async"
	SyncPatternStream SyncPattern = "stream"
)

const (
	TaskTypeForeground TaskType = "foreground"
	TaskTypeBackground TaskType = "background"
)

type BizType = workflowModel.BizType

const (
	BizTypeAgent    BizType = "agent"
	BizTypeWorkflow BizType = "workflow"
)

type Locator = workflowModel.Locator

const (
	FromDraft Locator = iota
	FromSpecificVersion
	FromLatestVersion
)

type ReleaseWorkflowConfig = vo.ReleaseWorkflowConfig

type ToolInterruptEvent = workflowEntity.ToolInterruptEvent

var defaultSVC Workflow

func DefaultSVC() Workflow {
	return defaultSVC
}

func SetDefaultSVC(svc Workflow) {
	defaultSVC = svc
}
