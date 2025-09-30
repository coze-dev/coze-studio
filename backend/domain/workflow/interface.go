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

	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/api/model/workflow"
	"github.com/coze-dev/coze-studio/backend/bizpkg/llm/modelbuilder"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
)

//go:generate mockgen -destination ../../internal/mock/domain/workflow/interface.go --package mockWorkflow -source interface.go
type Service interface {
	ListNodeMeta(ctx context.Context, nodeTypes map[entity.NodeType]bool) (map[string][]*entity.NodeTypeMeta, []entity.Category, error)
	Create(ctx context.Context, meta *vo.MetaCreate) (int64, error)
	Save(ctx context.Context, id int64, schema string) error
	Get(ctx context.Context, policy *vo.GetPolicy) (*entity.Workflow, error)
	MGet(ctx context.Context, policy *vo.MGetPolicy) ([]*entity.Workflow, int64, error)
	Delete(ctx context.Context, policy *vo.DeletePolicy) (ids []int64, err error)
	Publish(ctx context.Context, policy *vo.PublishPolicy) (err error)
	UpdateMeta(ctx context.Context, id int64, metaUpdate *vo.MetaUpdate) (err error)
	CopyWorkflow(ctx context.Context, workflowID int64, policy vo.CopyWorkflowPolicy) (*entity.Workflow, error)
	WorkflowSchemaCheck(ctx context.Context, wf *entity.Workflow, checks []workflow.CheckType) ([]*workflow.CheckResult, error)

	QueryNodeProperties(ctx context.Context, id int64) (map[string]*vo.NodeProperty, error) // only draft
	ValidateTree(ctx context.Context, id int64, validateConfig vo.ValidateTreeConfig) ([]*workflow.ValidateTreeInfo, error)

	GetWorkflowReference(ctx context.Context, id int64) (map[int64]*vo.Meta, error)

	GetWorkflowVersionsByConnector(ctx context.Context, connectorID, workflowID int64, limit int) ([]string, error)

	Executable
	AsTool

	ReleaseApplicationWorkflows(ctx context.Context, appID int64, config *vo.ReleaseWorkflowConfig) ([]*vo.ValidateIssue, error)
	CopyWorkflowFromAppToLibrary(ctx context.Context, workflowID int64, appID int64, related vo.ExternalResourceRelated) (*entity.CopyWorkflowFromAppToLibraryResult, error)
	DuplicateWorkflowsByAppID(ctx context.Context, sourceAPPID, targetAppID int64, related vo.ExternalResourceRelated) ([]*entity.Workflow, error)
	GetWorkflowDependenceResource(ctx context.Context, workflowID int64) (*vo.DependenceResource, error)
	SyncRelatedWorkflowResources(ctx context.Context, appID int64, relatedWorkflows map[int64]entity.IDVersionPair, related vo.ExternalResourceRelated) error

	ChatFlowRole
	Conversation

	BindConvRelatedInfo(ctx context.Context, convID int64, info entity.ConvRelatedInfo) error
	GetConvRelatedInfo(ctx context.Context, convID int64) (*entity.ConvRelatedInfo, bool, func() error, error)
	Suggest(ctx context.Context, input *vo.SuggestInfo) ([]string, error)
}

type Repository interface {
	CreateMeta(ctx context.Context, meta *vo.Meta) (int64, error)
	CreateVersion(ctx context.Context, id int64, info *vo.VersionInfo, newRefs map[entity.WorkflowReferenceKey]struct{}) (err error)
	CreateOrUpdateDraft(ctx context.Context, id int64, draft *vo.DraftInfo) error
	CreateChatFlowRoleConfig(ctx context.Context, chatFlowRole *entity.ChatFlowRole) (int64, error)
	UpdateChatFlowRoleConfig(ctx context.Context, workflowID int64, chatFlowRole *vo.ChatFlowRoleUpdate) error
	GetChatFlowRoleConfig(ctx context.Context, workflowID int64, version string) (*entity.ChatFlowRole, error, bool)
	DeleteChatFlowRoleConfig(ctx context.Context, id int64, workflowID int64) error
	Delete(ctx context.Context, id int64) error
	MDelete(ctx context.Context, ids []int64) error
	GetMeta(ctx context.Context, id int64) (*vo.Meta, error)
	UpdateMeta(ctx context.Context, id int64, metaUpdate *vo.MetaUpdate) error
	GetVersion(ctx context.Context, id int64, version string) (*vo.VersionInfo, bool, error)
	GetVersionListByConnectorAndWorkflowID(ctx context.Context, connectorID, workflowID int64, limit int) ([]string, error)

	GetEntity(ctx context.Context, policy *vo.GetPolicy) (*entity.Workflow, error)

	GetLatestVersion(ctx context.Context, id int64) (*vo.VersionInfo, error)

	DraftV2(ctx context.Context, id int64, commitID string) (*vo.DraftInfo, error)

	UpdateWorkflowDraftTestRunSuccess(ctx context.Context, id int64) error

	MGetReferences(ctx context.Context, policy *vo.MGetReferencePolicy) (
		[]*entity.WorkflowReference, error)
	MGetMetas(ctx context.Context, query *vo.MetaQuery) (map[int64]*vo.Meta, int64, error)
	MGetDrafts(ctx context.Context, policy *vo.MGetPolicy) ([]*entity.Workflow, int64, error)
	MGetLatestVersion(ctx context.Context, policy *vo.MGetPolicy) ([]*entity.Workflow, int64, error)

	CreateSnapshotIfNeeded(ctx context.Context, id int64, commitID string) error

	InterruptEventStore
	CancelSignalStore
	ExecuteHistoryStore

	WorkflowAsTool(ctx context.Context, policy vo.GetPolicy, wfToolConfig vo.WorkflowToolConfig) (ToolFromWorkflow, error)

	CopyWorkflow(ctx context.Context, workflowID int64, policy vo.CopyWorkflowPolicy) (*entity.Workflow, error)

	GetDraftWorkflowsByAppID(ctx context.Context, AppID int64) (map[int64]*vo.DraftInfo, map[int64]string, error)

	BatchCreateConnectorWorkflowVersion(ctx context.Context, appID, connectorID int64, workflowIDs []int64, version string) error

	IsApplicationConnectorWorkflowVersion(ctx context.Context, connectorID, workflowID int64, version string) (b bool, err error)

	GetObjectUrl(ctx context.Context, objectKey string, opts ...storage.GetOptFn) (string, error)

	compose.CheckPointStore
	idgen.IDGenerator

	GetKnowledgeRecallChatModel() modelbuilder.BaseChatModel
	ConversationRepository
	WorkflowConfig
	Suggester
}

var repositorySingleton Repository

func GetRepository() Repository {
	return repositorySingleton
}

func SetRepository(repository Repository) {
	repositorySingleton = repository
}
