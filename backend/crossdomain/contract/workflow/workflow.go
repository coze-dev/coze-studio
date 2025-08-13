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

	workflowModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/workflow"
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
	WithExecuteConfig(cfg workflowModel.ExecuteConfig) einoCompose.Option
	WithMessagePipe() (compose.Option, *schema.StreamReader[*entity.Message])
}

type ExecuteConfig = workflowModel.ExecuteConfig
type ExecuteMode = workflowModel.ExecuteMode
type NodeType = entity.NodeType

type WorkflowMessage = entity.Message

const (
	NodeTypeOutputEmitter NodeType = "OutputEmitter"
)

const (
	ExecuteModeDebug     ExecuteMode = "debug"
	ExecuteModeRelease   ExecuteMode = "release"
	ExecuteModeNodeDebug ExecuteMode = "node_debug"
)

type TaskType = workflowModel.TaskType

const (
	TaskTypeForeground TaskType = "foreground"
	TaskTypeBackground TaskType = "background"
)

type BizType = workflowModel.BizType

const (
	BizTypeAgent    BizType = "agent"
	BizTypeWorkflow BizType = "workflow"
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
