package conversation

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
)

type Conversation interface {
	Create(ctx context.Context, req *entity.CreateRequest) (*entity.CreateResponse, error)
	GetByID(ctx context.Context, req *entity.GetByIDRequest) (*entity.GetByIDResponse, error)
	Edit(ctx context.Context, req *entity.EditRequest) (*entity.EditResponse, error)
}
