package application

import (
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/domain/session/entity"
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
