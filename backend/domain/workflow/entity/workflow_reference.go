package entity

import (
	"time"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type WorkflowReference struct {
	ID int64
	WorkflowReferenceKey
	CreatedAt time.Time
	Enabled   bool
}

type WorkflowReferenceKey struct {
	ReferredID  int64
	ReferringID int64
	vo.ReferType
	vo.ReferringBizType
}
