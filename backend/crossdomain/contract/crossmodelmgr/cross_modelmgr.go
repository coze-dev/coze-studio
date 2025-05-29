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

var defaultSVC ModelMgr

func DefaultSVC() ModelMgr {
	return defaultSVC
}

func SetDefaultSVC(c ModelMgr) {
	defaultSVC = c
}
