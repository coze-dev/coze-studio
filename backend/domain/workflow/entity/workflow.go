package entity

import (
	"time"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type TypeInfo = vo.TypeInfo
type NamedTypeInfo = vo.NamedTypeInfo
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
	AppID       *int64
	SourceID    *int64
	AuthorID    int64
	VersionDesc string
	// BaseVersion *string TODO: may need to provide relationships between versions, such as to know which version is the latest

	Stage     Stage
	Name      string
	Desc      string
	IconURI   string
	IconURL   string
	Mode      Mode
	UpdatedAt *time.Time
	UpdaterID *int64
	DeletedAt *time.Time

	Canvas *string

	InputParams  []*vo.NamedTypeInfo
	OutputParams []*vo.NamedTypeInfo

	SubWorkflows []*Workflow

	TestRunSuccess bool
	Modified       bool

	HasPublished      bool
	LatestVersion     string
	LatestVersionDesc string
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

type WorkflowBasic struct {
	WorkflowIdentity
	SpaceID   int64
	AppID     *int64
	NodeCount int32
}

func (w *Workflow) GetBasic(nodeCount int32) *WorkflowBasic {
	return &WorkflowBasic{
		WorkflowIdentity: WorkflowIdentity{
			ID:      w.ID,
			Version: w.Version,
		},
		SpaceID:   w.SpaceID,
		AppID:     w.AppID,
		NodeCount: nodeCount,
	}
}
