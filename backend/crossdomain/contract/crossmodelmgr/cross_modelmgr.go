package crossmodelmgr

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/modelmgr"
)

type ModelMgr interface {
	MGetModelByID(ctx context.Context, req *modelmgr.MGetModelRequest) ([]*modelmgr.Model, error)
}

type Model = modelmgr.Model

var defaultSVC ModelMgr

func DefaultSVC() ModelMgr {
	return defaultSVC
}

func SetDefaultSVC(c ModelMgr) {
	defaultSVC = c
}
