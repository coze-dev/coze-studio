package workflow

import (
	"context"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

//go:generate mockgen -destination ../../internal/mock/domain/workflow/interface.go --package mockWorkflow -source interface.go
type Service interface {
	ListNodeMeta(ctx context.Context, nodeTypes map[entity.NodeType]bool) (map[string][]*entity.NodeTypeMeta, error)
	Create(ctx context.Context, meta *vo.Meta) (int64, error)
	Save(ctx context.Context, id int64, schema string) error
	Get(ctx context.Context, policy *vo.GetPolicy) (*entity.Workflow, error)
	MGet(ctx context.Context, policy *vo.MGetPolicy) ([]*entity.Workflow, error)
	Delete(ctx context.Context, policy *vo.DeletePolicy) (err error)
	Publish(ctx context.Context, policy *vo.PublishPolicy) (err error)
	UpdateMeta(ctx context.Context, id int64, metaUpdate *vo.MetaUpdate) (err error)
	QueryNodeProperties(ctx context.Context, id int64) (map[string]*vo.NodeProperty, error) // only draft
	ValidateTree(ctx context.Context, id int64, validateConfig vo.ValidateTreeConfig) ([]*workflow.ValidateTreeInfo, error)

	GetWorkflowReference(ctx context.Context, id int64) (map[int64]*vo.Meta, error)

	Executable
	AsTool

	CopyWorkflow(ctx context.Context, workflowID int64, cfg vo.CopyWorkflowConfig) (int64, error)
	ReleaseApplicationWorkflows(ctx context.Context, appID int64, config *vo.ReleaseWorkflowConfig) ([]*vo.ValidateIssue, error)
	CopyWorkflowFromAppToLibrary(ctx context.Context, workflowID int64, appID int64, relatedPlugins map[int64]entity.PluginEntity) ([]*vo.ValidateIssue, error)
}

type Repository interface {
	CreateMeta(ctx context.Context, meta *vo.Meta) (int64, error)
	CreateVersion(ctx context.Context, id int64, info *vo.VersionInfo) (err error)
	CreateOrUpdateDraft(ctx context.Context, id int64, draft *vo.DraftInfo) error
	Delete(ctx context.Context, id int64) error
	MDelete(ctx context.Context, ids []int64) error
	GetMeta(ctx context.Context, id int64) (*vo.Meta, error)
	UpdateMeta(ctx context.Context, id int64, metaUpdate *vo.MetaUpdate) error
	GetVersion(ctx context.Context, id int64, version string) (*vo.VersionInfo, error)

	GetEntity(ctx context.Context, policy *vo.GetPolicy) (*entity.Workflow, error)

	GetLatestVersion(ctx context.Context, id int64) (*vo.VersionInfo, error)

	DraftV2(ctx context.Context, id int64, commitID string) (*vo.DraftInfo, error)

	GetWorkflowReference(ctx context.Context, id int64) ([]*entity.WorkflowReference, error)

	UpdateWorkflowDraftTestRunSuccess(ctx context.Context, id int64) error

	GetParentWorkflowsBySubWorkflowID(ctx context.Context, id int64) ([]*entity.WorkflowReference, error)

	MGetMeta(ctx context.Context, query *vo.MetaQuery) (map[int64]*vo.Meta, error)
	MGetSubWorkflowReferences(ctx context.Context, id ...int64) (map[int64][]*entity.WorkflowReference, error)
	MGetDraft(ctx context.Context, ids []int64) (map[int64]*vo.DraftInfo, error)

	CreateSnapshotIfNeeded(ctx context.Context, id int64, commitID string) error

	InterruptEventStore
	CancelSignalStore
	ExecuteHistoryStore

	WorkflowAsTool(ctx context.Context, policy vo.GetPolicy, wfToolConfig vo.WorkflowToolConfig) (ToolFromWorkflow, error)
	CopyWorkflow(ctx context.Context, workflowID int64, cfg vo.CopyWorkflowConfig) (*entity.Workflow, error)

	GetDraftWorkflowsByAppID(ctx context.Context, AppID int64) (map[int64]*vo.DraftInfo, map[int64]string, error)
	CopyWorkflowFromAppToLibrary(ctx context.Context, workflowID int64, modifiedCanvasSchema string) (*entity.Workflow, error)

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
