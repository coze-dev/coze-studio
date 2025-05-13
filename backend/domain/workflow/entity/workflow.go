package entity

import (
	"time"

	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type TypeInfo = vo.TypeInfo
type ContentType = workflow.WorkFlowType
type Tag = workflow.Tag
type Mode = workflow.WorkflowMode
type DevStatus = workflow.WorkFlowDevStatus

type Workflow struct {
	WorkflowIdentity

	SpaceID     int64
	CreatorID   int64
	CreatedAt   time.Time
	ContentType ContentType
	Tag         *Tag
	ProjectID   *int64
	SourceID    *int64
	AuthorID    int64
	VersionDesc string
	// BaseVersion *string TODO: may need to provide relationships between versions, such as to know which version is the latest

	Stage
	Name      string
	Desc      string
	IconURI   string
	IconURL   string
	Mode      Mode
	DevStatus DevStatus
	UpdatedAt *time.Time
	UpdaterID *int64
	DeletedAt *time.Time

	Canvas       *string
	InputParams  map[string]*TypeInfo
	OutputParams map[string]*TypeInfo

	InputParamsOfString  string
	OutputParamsOfString string

	Operation *openapi3.Operation

	LatestFlowVersion     string
	LatestFlowVersionDesc string

	SubWorkflows []*Workflow

	TestRunSuccess bool
	Published      bool
}

type WorkflowIdentity struct {
	ID      int64
	Version string
}

type Stage uint8

const (
	StageDraft     Stage = 1
	StagePublished Stage = 2
)
