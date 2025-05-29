package crossmodelmgr

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/modelmgr"
)

// TODO(@fanlv): 参数引用需要修改。
type ModelMgr interface {
	MGetModelByID(ctx context.Context, req *modelmgr.MGetModelRequest) ([]*modelmgr.Model, error)
}

var defaultSVC ModelMgr

func DefaultSVC() ModelMgr {
	return defaultSVC
}

func SetDefaultSVC(c ModelMgr) {
	defaultSVC = c
}
