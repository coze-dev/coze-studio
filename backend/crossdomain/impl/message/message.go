package message

import (
	"context"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/message"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossmessage"
	message "code.byted.org/flow/opencoze/backend/domain/conversation/message/service"
)

var defaultSVC crossmessage.Message

type impl struct {
	DomainSVC message.Message
}

func InitDomainService(c message.Message) crossmessage.Message {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (c *impl) GetByRunIDs(ctx context.Context, conversationID int64, runIDs []int64) ([]*model.Message, error) {
	return c.DomainSVC.GetByRunIDs(ctx, conversationID, runIDs)
}

func (c *impl) Create(ctx context.Context, msg *model.Message) (*model.Message, error) {
	return c.DomainSVC.Create(ctx, msg)
}

func (c *impl) Edit(ctx context.Context, msg *model.Message) (*model.Message, error) {
	return c.DomainSVC.Edit(ctx, msg)
}
