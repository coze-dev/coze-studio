package ctxutil

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/session/entity"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

func GetUserSessionFromCtx(ctx context.Context) *entity.SessionData {
	data, ok := ctxcache.Get[*entity.SessionData](ctx, consts.SessionDataKeyInCtx)
	if !ok {
		return nil
	}

	return data
}

func MustGetUIDFromCtx(ctx context.Context) int64 {
	sessionData := GetUserSessionFromCtx(ctx)
	if sessionData == nil {
		panic("mustGetUIDFromCtx: sessionData is nil")
	}

	return sessionData.UserID
}

func GetUIDFromCtx(ctx context.Context) *int64 {
	sessionData := GetUserSessionFromCtx(ctx)
	if sessionData == nil {
		return nil
	}

	return &sessionData.UserID
}
