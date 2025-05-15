package conversation

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
)

type Conversation interface {
	Create(ctx context.Context, req *entity.CreateMeta) (*entity.Conversation, error)
	GetByID(ctx context.Context, id int64) (*entity.Conversation, error)
	NewConversationCtx(ctx context.Context, req *entity.NewConversationCtxRequest) (*entity.NewConversationCtxResponse, error)
	GetCurrentConversation(ctx context.Context, req *entity.GetCurrentRequest) (*entity.Conversation, error)
	Delete(ctx context.Context, req *entity.DeleteRequest) error
	List(ctx context.Context, req *entity.ListRequest) ([]*entity.Conversation, bool, error)
}
