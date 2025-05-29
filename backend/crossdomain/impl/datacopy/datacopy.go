package datacopy

import (
	"context"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossdatacopy"
	"code.byted.org/flow/opencoze/backend/domain/datacopy"
)

var defaultSVC crossdatacopy.DataCopy

type impl struct {
	DomainSVC datacopy.DataCopy
}

func InitDomainService(c datacopy.DataCopy) crossdatacopy.DataCopy {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (i *impl) CheckAndGenCopyTask(ctx context.Context, req *datacopy.CheckAndGenCopyTaskReq) (*datacopy.CheckAndGenCopyTaskResp, error) {
	return i.DomainSVC.CheckAndGenCopyTask(ctx, req)
}

func (i *impl) UpdateCopyTask(ctx context.Context, req *datacopy.UpdateCopyTaskReq) error {
	return i.DomainSVC.UpdateCopyTask(ctx, req)
}
