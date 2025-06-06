package datacopy

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/application/base/appinfra"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossdatacopy"
	"code.byted.org/flow/opencoze/backend/domain/datacopy"
	"code.byted.org/flow/opencoze/backend/domain/datacopy/service"
)

var defaultSVC crossdatacopy.DataCopy

type impl struct {
	DomainSVC datacopy.DataCopy
}

func InitDomainService(a *appinfra.AppDependencies) crossdatacopy.DataCopy {
	svc := service.NewDataCopySVC(&service.DataCopySVCConfig{
		DB:    a.DB,
		IDGen: a.IDGenSVC,
	})
	return svc
}

func (i *impl) CheckAndGenCopyTask(ctx context.Context, req *datacopy.CheckAndGenCopyTaskReq) (*datacopy.CheckAndGenCopyTaskResp, error) {
	return i.DomainSVC.CheckAndGenCopyTask(ctx, req)
}

func (i *impl) UpdateCopyTask(ctx context.Context, req *datacopy.UpdateCopyTaskReq) error {
	return i.DomainSVC.UpdateCopyTask(ctx, req)
}
func (i *impl) UpdateCopyTaskWithTX(ctx context.Context, req *datacopy.UpdateCopyTaskReq, tx *gorm.DB) error {
	return i.DomainSVC.UpdateCopyTaskWithTX(ctx, req, tx)
}
