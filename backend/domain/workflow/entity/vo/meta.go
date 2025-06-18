package vo

import (
	"time"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
)

type ContentType = workflow.WorkFlowType
type Tag = workflow.Tag
type Mode = workflow.WorkflowMode

type Meta struct {
	// the following fields are immutable
	SpaceID     int64
	CreatorID   int64
	CreatedAt   time.Time
	ContentType ContentType
	Tag         *Tag
	AppID       *int64
	SourceID    *int64
	AuthorID    int64

	// the following fields are mutable
	Name                   string
	Desc                   string
	IconURI                string
	IconURL                string
	Mode                   Mode
	UpdatedAt              *time.Time
	UpdaterID              *int64
	DeletedAt              *time.Time
	HasPublished           bool
	LatestPublishedVersion *string
}

type MetaCreate struct {
	Name             string
	Desc             string
	IconURI          string
	SpaceID          int64
	CreatorID        int64
	ContentType      ContentType
	AppID            *int64
	Mode             Mode
	InitCanvasSchema string
}

type MetaUpdate struct {
	Name                   *string
	Desc                   *string
	IconURI                *string
	HasPublished           *bool
	LatestPublishedVersion *string
}

type MetaQuery struct {
	IDs           []int64
	SpaceID       *int64
	Page          *Page
	Name          *string
	PublishStatus *PublishStatus
	AppID         *int64
	LibOnly       bool
}
