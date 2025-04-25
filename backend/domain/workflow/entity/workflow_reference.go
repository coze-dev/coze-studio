package entity

import (
	"time"
)

type WorkflowReference struct {
	ID          int64
	SpaceID     int64
	ReferringID int64
	ReferType
	ReferringBizType
	CreatedAt time.Time
	CreatorID int64

	Stage
	UpdatedAt *time.Time
	UpdaterID *int64
}

type ReferType uint8

const (
	ReferTypeSubWorkflow ReferType = 1
	ReferTypeTool        ReferType = 2
)

type ReferringBizType uint8

const (
	ReferringBizTypeWorkflow ReferringBizType = 1
	ReferringBizTypeAgent    ReferringBizType = 2
)
