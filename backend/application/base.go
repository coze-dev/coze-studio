package application

import (
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/domain/session/entity"
	"code.byted.org/flow/opencoze/backend/infra/pkg/ctxcache"
)

// TODO(@fanlv): 待讨论，这个错误放着里面是否合适？
var ErrUnauthorized = errors.New("unauthorized")

func getUserSession(ctx context.Context) *entity.SessionData {
	data, ok := ctxcache.Get[*entity.SessionData](ctx, SessionApplicationService{})
	if !ok {
		return nil
	}

	return data
}
