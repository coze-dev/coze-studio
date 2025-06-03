package datacopy

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/datacopy/entity"
)

type DataCopy interface {
	CheckAndGenCopyTask(ctx context.Context, req *CheckAndGenCopyTaskReq) (*CheckAndGenCopyTaskResp, error)
	UpdateCopyTask(ctx context.Context, req *UpdateCopyTaskReq) error
}

type CheckAndGenCopyTaskReq struct {
	Task *entity.CopyDataTask
}

type CheckAndGenCopyTaskResp struct {
	CopyTaskStatus entity.DataCopyTaskStatus
	FailReason     string
	TargetID       int64
	CopyTaskID     int64
}

type UpdateCopyTaskReq struct {
	Task *entity.CopyDataTask
}
