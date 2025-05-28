package crossconversation

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	conversation "code.byted.org/flow/opencoze/backend/domain/conversation/conversation/service"
)

// TODO(@fanlv): 参数引用需要修改。
type Conversation interface {
	GetCurrentConversation(ctx context.Context, req *entity.GetCurrent) (*entity.Conversation, error)
}

var defaultSVC *impl

type impl struct {
	DomainSVC conversation.Conversation
}

func InitDomainService(c conversation.Conversation) {
	defaultSVC = &impl{
		DomainSVC: c,
	}
}

func DefaultSVC() Conversation {
	return defaultSVC
}

func (s *impl) GetCurrentConversation(ctx context.Context, req *entity.GetCurrent) (*entity.Conversation, error) {
	return s.DomainSVC.GetCurrentConversation(ctx, req)
}
