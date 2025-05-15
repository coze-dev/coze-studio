package message

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
)

type Message interface {
	List(ctx context.Context, req *entity.ListRequest) (*entity.ListResponse, error)
	Create(ctx context.Context, req *entity.CreateRequest) (*entity.CreateResponse, error)
	GetByRunIDs(ctx context.Context, req *entity.GetByRunIDsRequest) (*entity.GetByRunIDsResponse, error)
	GetByID(ctx context.Context, req *entity.GetByIDRequest) (*entity.GetByIDResponse, error)
	Edit(ctx context.Context, req *entity.EditRequest) (*entity.EditResponse, error)
	Delete(ctx context.Context, req *entity.DeleteRequest) (*entity.DeleteResponse, error)
	Broken(ctx context.Context, req *entity.BrokenRequest) (*entity.BrokenResponse, error)
}
