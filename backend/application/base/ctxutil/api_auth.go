package ctxutil

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/permission/openapiauth/entity"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

func GetApiAuthFromCtx(ctx context.Context) *entity.ApiKey {
	data, ok := ctxcache.Get[*entity.ApiKey](ctx, consts.OpenapiAuthKeyInCtx)

	if !ok {
		return nil
	}
	return data
}

func MustGetUIDFromApiAuthCtx(ctx context.Context) int64 {
	apiKeyInfo := GetApiAuthFromCtx(ctx)
	if apiKeyInfo == nil {
		panic("mustGetUIDFromApiAuthCtx: apiKeyInfo is nil")
	}
	return apiKeyInfo.UserID
}
