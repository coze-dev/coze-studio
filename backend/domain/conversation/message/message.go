package message

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
)

type Message interface {
	List(ctx context.Context, req *entity.ListRequest) (*entity.ListResponse, error)
	Create(ctx context.Context, req *entity.CreateRequest) (*entity.CreateResponse, error)
	BatchCreate(ctx context.Context, req *entity.BatchCreateRequest) (*entity.BatchCreateResponse, error)
	GetByRunID(ctx context.Context, req *entity.GetByRunIDRequest) (*entity.GetByRunIDResponse, error)
	Edit(ctx context.Context, req *entity.EditRequest) (*entity.EditResponse, error)
}
