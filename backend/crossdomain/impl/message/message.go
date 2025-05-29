package message

import (
	"context"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossmessage"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
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

func (c *impl) GetByRunIDs(ctx context.Context, conversationID int64, runIDs []int64) ([]*entity.Message, error) {
	return c.DomainSVC.GetByRunIDs(ctx, conversationID, runIDs)
}

func (c *impl) Create(ctx context.Context, msg *entity.Message) (*entity.Message, error) {
	return c.DomainSVC.Create(ctx, msg)
}

func (c *impl) Edit(ctx context.Context, msg *entity.Message) (*entity.Message, error) {
	return c.DomainSVC.Edit(ctx, msg)
}
