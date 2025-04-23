package entity

import (
	"time"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/api/model/plugin/plugin_common"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

type TypeInfo = nodes.TypeInfo

type Workflow struct {
	WorkflowIdentity

	CreatorID   int64
	CreatedAt   time.Time
	ContentType workflow.WorkFlowType
	Tag         *workflow.Tag
	ProjectID   *int64
	SourceID    *int64
	AuthorID    int64
	VersionDesc string
	// BaseVersion *string TODO: may need to provide relationships between versions, such as to know which version is the latest

	Name      string
	Desc      string
	IconURI   string
	IconURL   string
	Mode      workflow.WorkflowMode
	DevStatus workflow.WorkFlowDevStatus
	UpdatedAt *time.Time
	UpdaterID *int64
	DeletedAt *time.Time

	Canvas       string
	Schema       string
	InputParams  []*TypeInfo
	OutputParams []*TypeInfo

	ReqParameters  []*plugin_common.APIParameter // TODO: probably change this to JSON Schema
	RespParameters []*plugin_common.APIParameter // TODO: probably change this to JSON Schema
}

type WorkflowIdentity struct {
	ID      int64
	SpaceID int64
	Stage
	Version string
}

type Stage string

const (
	StageDraft     Stage = "draft"
	StagePublished Stage = "published"
)
