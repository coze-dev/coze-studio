package modelmgr

import (
	"context"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossmodelmgr"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr/entity"
)

var defaultSVC crossmodelmgr.ModelMgr

type impl struct {
	DomainSVC modelmgr.Manager
}

func InitDomainService(c modelmgr.Manager) crossmodelmgr.ModelMgr {
	defaultSVC = &impl{
		DomainSVC: c,
	}
	return defaultSVC
}

func (s *impl) MGetModelByID(ctx context.Context, req *modelmgr.MGetModelRequest) ([]*entity.Model, error) {
	return s.DomainSVC.MGetModelByID(ctx, req)
}
