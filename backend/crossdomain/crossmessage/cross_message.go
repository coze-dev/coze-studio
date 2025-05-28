package crossmessage

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	message "code.byted.org/flow/opencoze/backend/domain/conversation/message/service"
)

// TODO(@fanlv): 参数引用需要修改。
type Message interface {
	GetByRunIDs(ctx context.Context, conversationID int64, runIDs []int64) ([]*entity.Message, error)
	Create(ctx context.Context, msg *entity.Message) (*entity.Message, error)
	Edit(ctx context.Context, msg *entity.Message) (*entity.Message, error)
}

var defaultSVC *impl

type impl struct {
	DomainSVC message.Message
}

func InitDomainService(c message.Message) {
	defaultSVC = &impl{
		DomainSVC: c,
	}
}

func DefaultSVC() Message {
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
