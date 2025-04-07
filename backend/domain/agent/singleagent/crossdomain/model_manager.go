package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/chatmodel"
	"code.byted.org/flow/opencoze/backend/domain/chatmodel/entity"
)

type ModelMgr interface {
	MGetModelByID(ctx context.Context, req *chatmodel.MGetModelRequest) ([]*entity.Model, error)
}
