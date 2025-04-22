package crossdomain

import (
	"context"

	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
)

type SingleAgent interface {
	StreamExecute(ctx context.Context, ch chan *entity.AgentRespEvent, historyMsg []*msgEntity.Message, query *msgEntity.Message) error
}
