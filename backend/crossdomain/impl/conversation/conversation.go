package conversation

import (
	"context"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/conversation"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossconversation"
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

func (s *impl) GetCurrentConversation(ctx context.Context, req *model.GetCurrent) (*model.Conversation, error) {
	return s.DomainSVC.GetCurrentConversation(ctx, req)
}
