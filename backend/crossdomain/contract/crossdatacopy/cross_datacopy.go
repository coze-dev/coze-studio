package crossdatacopy

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/datacopy"
)

type DataCopy interface {
	CheckAndGenCopyTask(ctx context.Context, req *datacopy.CheckAndGenCopyTaskReq) (*datacopy.CheckAndGenCopyTaskResp, error)
	UpdateCopyTask(ctx context.Context, req *datacopy.UpdateCopyTaskReq) error
}

var defaultSVC DataCopy

func DefaultSVC() DataCopy {
	return defaultSVC
}

func SetDefaultSVC(c DataCopy) {
	defaultSVC = c
}
