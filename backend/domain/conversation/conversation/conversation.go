package conversation

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
)

type Conversation interface {
	Create(ctx context.Context, req *entity.CreateRequest) (*entity.CreateResponse, error)
	GetByID(ctx context.Context, req *entity.GetByIDRequest) (*entity.GetByIDResponse, error)
	NewConversationCtx(ctx context.Context, req *entity.NewConversationCtxRequest) (*entity.NewConversationCtxResponse, error)
	GetCurrentConversation(ctx context.Context, req *entity.GetCurrentRequest) (*entity.GetCurrentResponse, error)
	Delete(ctx context.Context, req *entity.DeleteRequest) (*entity.DeleteResponse, error)
}
