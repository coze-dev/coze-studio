package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr/entity"
)

type ModelMgr interface {
	MGetModelByID(ctx context.Context, req *modelmgr.MGetModelRequest) ([]*entity.Model, error)
}
