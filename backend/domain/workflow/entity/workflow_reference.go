package entity

import "time"

type WorkflowReference struct {
	ID               int64
	SpaceID          int64
	ReferringID      int64
	ReferringSpaceID int64
	ReferType
	ReferringBizType
	CreatedAt time.Time
	CreatorID int64

	Stage
	UpdatedAt *time.Time
	UpdaterID *int64
}

type ReferType string

const (
	ReferTypeSubWorkflow ReferType = "sub_workflow"
	ReferTypeTool        ReferType = "tool"
)

type ReferringBizType string

const (
	ReferringBizTypeWorkflow ReferringBizType = "workflow"
	ReferringBizTypeAgent    ReferringBizType = "agent"
)
