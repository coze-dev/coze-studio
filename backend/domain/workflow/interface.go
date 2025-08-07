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

	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
)

//go:generate mockgen -destination ../../internal/mock/domain/workflow/interface.go --package mockWorkflow -source interface.go
type Service interface {
	ListNodeMeta(ctx context.Context, nodeTypes map[entity.NodeType]bool) (map[string][]*entity.NodeTypeMeta, []entity.Category, error)
	Create(ctx context.Context, meta *vo.MetaCreate) (int64, error)
	Save(ctx context.Context, id int64, schema string) error
	Get(ctx context.Context, policy *vo.GetPolicy) (*entity.Workflow, error)
	MGet(ctx context.Context, policy *vo.MGetPolicy) ([]*entity.Workflow, int64, error)
	Delete(ctx context.Context, policy *vo.DeletePolicy) (err error)
	Publish(ctx context.Context, policy *vo.PublishPolicy) (err error)
	UpdateMeta(ctx context.Context, id int64, metaUpdate *vo.MetaUpdate) (err error)
	CopyWorkflow(ctx context.Context, workflowID int64, policy vo.CopyWorkflowPolicy) (*entity.Workflow, error)

	// Import/Export functionality
	ExportWorkflow(ctx context.Context, workflowIDs []int64, policy vo.ExportWorkflowPolicy) (*vo.WorkflowExportPackage, error)
	ImportWorkflow(ctx context.Context, importPackage *vo.WorkflowExportPackage, policy vo.ImportWorkflowPolicy) (*vo.ImportResult, error)
	ValidateImportPackage(ctx context.Context, importPackage *vo.WorkflowExportPackage, policy vo.ImportWorkflowPolicy) (*vo.ValidationResult, error)

	QueryNodeProperties(ctx context.Context, id int64) (map[string]*vo.NodeProperty, error) // only draft
	ValidateTree(ctx context.Context, id int64, validateConfig vo.ValidateTreeConfig) ([]*workflow.ValidateTreeInfo, error)

	GetWorkflowReference(ctx context.Context, id int64) (map[int64]*vo.Meta, error)

	Executable
	AsTool

	ReleaseApplicationWorkflows(ctx context.Context, appID int64, config *vo.ReleaseWorkflowConfig) ([]*vo.ValidateIssue, error)
	CopyWorkflowFromAppToLibrary(ctx context.Context, workflowID int64, appID int64, related vo.ExternalResourceRelated) (map[int64]entity.IDVersionPair, []*vo.ValidateIssue, error)
	DuplicateWorkflowsByAppID(ctx context.Context, sourceAPPID, targetAppID int64, related vo.ExternalResourceRelated) error
	GetWorkflowDependenceResource(ctx context.Context, workflowID int64) (*vo.DependenceResource, error)
	SyncRelatedWorkflowResources(ctx context.Context, appID int64, relatedWorkflows map[int64]entity.IDVersionPair, related vo.ExternalResourceRelated) error
}

type Repository interface {
	CreateMeta(ctx context.Context, meta *vo.Meta) (int64, error)
	CreateVersion(ctx context.Context, id int64, info *vo.VersionInfo, newRefs map[entity.WorkflowReferenceKey]struct{}) (err error)
	CreateOrUpdateDraft(ctx context.Context, id int64, draft *vo.DraftInfo) error
	Delete(ctx context.Context, id int64) error
	MDelete(ctx context.Context, ids []int64) error
	GetMeta(ctx context.Context, id int64) (*vo.Meta, error)
	UpdateMeta(ctx context.Context, id int64, metaUpdate *vo.MetaUpdate) error
	GetVersion(ctx context.Context, id int64, version string) (*vo.VersionInfo, error)

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

	// Import/Export functionality at repository level
	ExportWorkflowData(ctx context.Context, workflowID int64) (*vo.WorkflowExportData, error)
	ImportWorkflowData(ctx context.Context, importData *vo.WorkflowExportData, policy vo.ImportWorkflowPolicy) (*entity.Workflow, error)

	GetDraftWorkflowsByAppID(ctx context.Context, AppID int64) (map[int64]*vo.DraftInfo, map[int64]string, error)

	BatchCreateConnectorWorkflowVersion(ctx context.Context, appID, connectorID int64, workflowIDs []int64, version string) error

	IsApplicationConnectorWorkflowVersion(ctx context.Context, connectorID, workflowID int64, version string) (b bool, err error)

	compose.CheckPointStore
	idgen.IDGenerator
}

var repositorySingleton Repository

func GetRepository() Repository {
	return repositorySingleton
}

func SetRepository(repository Repository) {
	repositorySingleton = repository
}
