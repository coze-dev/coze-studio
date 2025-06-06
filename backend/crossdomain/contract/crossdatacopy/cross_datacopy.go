package crossdatacopy

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/datacopy"
)

type DataCopy interface {
	CheckAndGenCopyTask(ctx context.Context, req *datacopy.CheckAndGenCopyTaskReq) (*datacopy.CheckAndGenCopyTaskResp, error)
	UpdateCopyTask(ctx context.Context, req *datacopy.UpdateCopyTaskReq) error
	UpdateCopyTaskWithTX(ctx context.Context, req *datacopy.UpdateCopyTaskReq, tx *gorm.DB) error
}

var defaultSVC DataCopy

func DefaultSVC() DataCopy {
	return defaultSVC
}

func SetDefaultSVC(c DataCopy) {
	defaultSVC = c
}
