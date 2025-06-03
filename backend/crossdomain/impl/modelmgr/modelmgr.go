package modelmgr

import (
	"context"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/modelmgr"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossmodelmgr"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
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

func (s *impl) MGetModelByID(ctx context.Context, req *modelmgr.MGetModelRequest) ([]*model.Model, error) {
	res, err := s.DomainSVC.MGetModelByID(ctx, req)
	if err != nil {
		return nil, err
	}

	ret := make([]*model.Model, 0, len(res))
	for _, v := range res {
		ret = append(ret, v.Model)
	}

	return ret, nil
}
