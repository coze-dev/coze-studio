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

package workflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	conventity "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/config"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

type Executable interface {
	SyncExecute(ctx context.Context, config workflowModel.ExecuteConfig, input map[string]any) (*entity.WorkflowExecution, vo.TerminatePlan, error)
	AsyncExecute(ctx context.Context, config workflowModel.ExecuteConfig, input map[string]any) (int64, error)
	AsyncExecuteNode(ctx context.Context, nodeID string, config workflowModel.ExecuteConfig, input map[string]any) (int64, error)
	AsyncResume(ctx context.Context, req *entity.ResumeRequest, config workflowModel.ExecuteConfig) error
	StreamExecute(ctx context.Context, config workflowModel.ExecuteConfig, input map[string]any) (*schema.StreamReader[*entity.Message], error)
	StreamResume(ctx context.Context, req *entity.ResumeRequest, config workflowModel.ExecuteConfig) (
		*schema.StreamReader[*entity.Message], error)

	GetExecution(ctx context.Context, wfExe *entity.WorkflowExecution, includeNodes bool) (*entity.WorkflowExecution, error)
	GetNodeExecution(ctx context.Context, exeID int64, nodeID string) (*entity.NodeExecution, *entity.NodeExecution, error)
	GetLatestTestRunInput(ctx context.Context, wfID int64, userID int64) (*entity.NodeExecution, bool, error)
	GetLatestNodeDebugInput(ctx context.Context, wfID int64, nodeID string, userID int64) (
		*entity.NodeExecution, *entity.NodeExecution, bool, error)

	Cancel(ctx context.Context, wfExeID int64, wfID, spaceID int64) error
}

type AsTool interface {
	WorkflowAsModelTool(ctx context.Context, policies []*vo.GetPolicy) ([]ToolFromWorkflow, error)
	WithMessagePipe() (compose.Option, *schema.StreamReader[*entity.Message], func())
	WithExecuteConfig(cfg workflowModel.ExecuteConfig) compose.Option
	WithResumeToolWorkflow(resumingEvent *entity.ToolInterruptEvent, resumeData string,
		allInterruptEvents map[string]*entity.ToolInterruptEvent) compose.Option
}

type ChatFlowRole interface {
	CreateChatFlowRole(ctx context.Context, role *vo.ChatFlowRoleCreate) (int64, error)
	UpdateChatFlowRole(ctx context.Context, workflowID int64, role *vo.ChatFlowRoleUpdate) error
	GetChatFlowRole(ctx context.Context, workflowID int64, version string) (*entity.ChatFlowRole, error)
	DeleteChatFlowRole(ctx context.Context, id int64, workflowID int64) error
	PublishChatFlowRole(ctx context.Context, policy *vo.PublishRolePolicy) error
}

type Conversation interface {
	CreateDraftConversationTemplate(ctx context.Context, template *vo.CreateConversationTemplateMeta) (int64, error)
	UpdateDraftConversationTemplateName(ctx context.Context, appID int64, userID int64, templateID int64, name string) error
	DeleteDraftConversationTemplate(ctx context.Context, templateID int64, wfID2ConversationName map[int64]string) (int64, error)
	CheckWorkflowsToReplace(ctx context.Context, appID int64, templateID int64) ([]*entity.Workflow, error)
	DeleteDynamicConversation(ctx context.Context, env vo.Env, templateID int64) (int64, error)
	ListConversationTemplate(ctx context.Context, env vo.Env, policy *vo.ListConversationTemplatePolicy) ([]*entity.ConversationTemplate, error)
	MGetStaticConversation(ctx context.Context, env vo.Env, userID, connectorID int64, templateIDs []int64) ([]*entity.StaticConversation, error)
	ListDynamicConversation(ctx context.Context, env vo.Env, policy *vo.ListConversationPolicy) ([]*entity.DynamicConversation, error)
	ReleaseConversationTemplate(ctx context.Context, appID int64, version string) error
	InitApplicationDefaultConversationTemplate(ctx context.Context, spaceID int64, appID int64, userID int64) error
	GetOrCreateConversation(ctx context.Context, env vo.Env, bizID, connectorID, userID int64, conversationName string) (int64, int64, error)
	UpdateConversation(ctx context.Context, env vo.Env, appID, connectorID, userID int64, conversationName string) (int64, error)
	GetTemplateByName(ctx context.Context, env vo.Env, appID int64, templateName string) (*entity.ConversationTemplate, bool, error)
	GetDynamicConversationByName(ctx context.Context, env vo.Env, appID, connectorID, userID int64, name string) (*entity.DynamicConversation, bool, error)
	GetConversationNameByID(ctx context.Context, env vo.Env, bizID, connectorID, conversationID int64) (string, bool, error)
}

type InterruptEventStore interface {
	SaveInterruptEvents(ctx context.Context, wfExeID int64, events []*entity.InterruptEvent) error
	GetFirstInterruptEvent(ctx context.Context, wfExeID int64) (*entity.InterruptEvent, bool, error)
	UpdateFirstInterruptEvent(ctx context.Context, wfExeID int64, event *entity.InterruptEvent) error
	PopFirstInterruptEvent(ctx context.Context, wfExeID int64) (*entity.InterruptEvent, bool, error)
	ListInterruptEvents(ctx context.Context, wfExeID int64) ([]*entity.InterruptEvent, error)

	BindConvRelatedInfo(ctx context.Context, convID int64, info entity.ConvRelatedInfo) error
	GetConvRelatedInfo(ctx context.Context, convID int64) (*entity.ConvRelatedInfo, bool, func() error, error)
}

type CancelSignalStore interface {
	SetWorkflowCancelFlag(ctx context.Context, wfExeID int64) error
	GetWorkflowCancelFlag(ctx context.Context, wfExeID int64) (bool, error)
}

type ExecuteHistoryStore interface {
	CreateWorkflowExecution(ctx context.Context, execution *entity.WorkflowExecution) error
	UpdateWorkflowExecution(ctx context.Context, execution *entity.WorkflowExecution, allowedStatus []entity.WorkflowExecuteStatus) (int64, entity.WorkflowExecuteStatus, error)
	TryLockWorkflowExecution(ctx context.Context, wfExeID, resumingEventID int64) (bool, entity.WorkflowExecuteStatus, error)
	GetWorkflowExecution(ctx context.Context, id int64) (*entity.WorkflowExecution, bool, error)
	CreateNodeExecution(ctx context.Context, execution *entity.NodeExecution) error
	UpdateNodeExecution(ctx context.Context, execution *entity.NodeExecution) error
	UpdateNodeExecutionStreaming(ctx context.Context, execution *entity.NodeExecution) error
	CancelAllRunningNodes(ctx context.Context, wfExeID int64) error
	GetNodeExecutionsByWfExeID(ctx context.Context, wfExeID int64) (result []*entity.NodeExecution, err error)
	GetNodeExecution(ctx context.Context, wfExeID int64, nodeID string) (*entity.NodeExecution, bool, error)
	GetNodeExecutionByParent(ctx context.Context, wfExeID int64, parentNodeID string) (
		[]*entity.NodeExecution, error)
	SetTestRunLatestExeID(ctx context.Context, wfID int64, uID int64, exeID int64) error
	GetTestRunLatestExeID(ctx context.Context, wfID int64, uID int64) (int64, error)
	SetNodeDebugLatestExeID(ctx context.Context, wfID int64, nodeID string, uID int64, exeID int64) error
	GetNodeDebugLatestExeID(ctx context.Context, wfID int64, nodeID string, uID int64) (int64, error)
}

type ToolFromWorkflow interface {
	tool.BaseTool
	TerminatePlan() vo.TerminatePlan
	GetWorkflow() *entity.Workflow
}

type ConversationIDGenerator func(ctx context.Context, appID int64, userID, connectorID int64) (*conventity.Conversation, error)

type ConversationRepository interface {
	CreateDraftConversationTemplate(ctx context.Context, template *vo.CreateConversationTemplateMeta) (int64, error)
	UpdateDraftConversationTemplateName(ctx context.Context, templateID int64, name string) error
	DeleteDraftConversationTemplate(ctx context.Context, templateID int64) (int64, error)
	GetConversationTemplate(ctx context.Context, env vo.Env, policy vo.GetConversationTemplatePolicy) (*entity.ConversationTemplate, bool, error)
	DeleteDynamicConversation(ctx context.Context, env vo.Env, id int64) (int64, error)
	ListConversationTemplate(ctx context.Context, env vo.Env, policy *vo.ListConversationTemplatePolicy) ([]*entity.ConversationTemplate, error)
	MGetStaticConversation(ctx context.Context, env vo.Env, userID, connectorID int64, templateIDs []int64) ([]*entity.StaticConversation, error)
	GetOrCreateStaticConversation(ctx context.Context, env vo.Env, idGen ConversationIDGenerator, meta *vo.CreateStaticConversation) (int64, int64, bool, error)
	GetOrCreateDynamicConversation(ctx context.Context, env vo.Env, idGen ConversationIDGenerator, meta *vo.CreateDynamicConversation) (int64, int64, bool, error)
	GetDynamicConversationByName(ctx context.Context, env vo.Env, appID, connectorID, userID int64, name string) (*entity.DynamicConversation, bool, error)
	GetStaticConversationByTemplateID(ctx context.Context, env vo.Env, userID, connectorID, templateID int64) (*entity.StaticConversation, bool, error)
	ListDynamicConversation(ctx context.Context, env vo.Env, policy *vo.ListConversationPolicy) ([]*entity.DynamicConversation, error)
	BatchCreateOnlineConversationTemplate(ctx context.Context, templates []*entity.ConversationTemplate, version string) error
	UpdateDynamicConversationNameByID(ctx context.Context, env vo.Env, templateID int64, name string) error
	UpdateStaticConversation(ctx context.Context, env vo.Env, templateID int64, connectorID int64, userID int64, newConversationID int64) error
	UpdateDynamicConversation(ctx context.Context, env vo.Env, conversationID, newConversationID int64) error
	CopyTemplateConversationByAppID(ctx context.Context, appID int64, toAppID int64) error
	GetStaticConversationByID(ctx context.Context, env vo.Env, bizID, connectorID, conversationID int64) (string, bool, error)
	GetDynamicConversationByID(ctx context.Context, env vo.Env, bizID, connectorID, conversationID int64) (*entity.DynamicConversation, bool, error)
}
type WorkflowConfig interface {
	GetNodeOfCodeConfig() *config.NodeOfCodeConfig
}

type Suggester interface {
	Suggest(ctx context.Context, input *vo.SuggestInfo) ([]string, error)
}
