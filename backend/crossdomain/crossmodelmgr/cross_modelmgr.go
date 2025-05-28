package crossmodelmgr

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr/entity"
)

// TODO(@fanlv): 参数引用需要修改。
type ModelMgr interface {
	MGetModelByID(ctx context.Context, req *modelmgr.MGetModelRequest) ([]*entity.Model, error)
}

var defaultSVC *impl

type impl struct {
	DomainSVC modelmgr.Manager
}

func InitDomainService(c modelmgr.Manager) {
	defaultSVC = &impl{
		DomainSVC: c,
	}
}

func DefaultSVC() ModelMgr {
	return defaultSVC
}

func (s *impl) MGetModelByID(ctx context.Context, req *modelmgr.MGetModelRequest) ([]*entity.Model, error) {
	return s.DomainSVC.MGetModelByID(ctx, req)
}
