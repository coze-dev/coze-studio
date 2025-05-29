package conversation

import (
	"context"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossconversation"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	conversation "code.byted.org/flow/opencoze/backend/domain/conversation/conversation/service"
)

var defaultSVC crossconversation.Conversation

type impl struct {
	DomainSVC conversation.Conversation
}

func InitDomainService(c conversation.Conversation) crossconversation.Conversation {
	defaultSVC = &impl{
		DomainSVC: c,
	}
	return defaultSVC
}

func (s *impl) GetCurrentConversation(ctx context.Context, req *entity.GetCurrent) (*entity.Conversation, error) {
	return s.DomainSVC.GetCurrentConversation(ctx, req)
}
