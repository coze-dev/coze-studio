package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr/entity"
)

//go:generate  mockgen -destination ../../../../internal/mock/domain/agent/singleagent/model_mgr_mock.go --package mock -source model_manager.go
type ModelMgr interface {
	MGetModelByID(ctx context.Context, req *modelmgr.MGetModelRequest) ([]*entity.Model, error)
}
