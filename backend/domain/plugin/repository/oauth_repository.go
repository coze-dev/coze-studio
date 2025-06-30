package repository

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type OAuthRepository interface {
	GetAuthorizationCodeInfo(ctx context.Context, meta *entity.AuthorizationCodeMeta) (info *entity.AuthorizationCodeInfo, exist bool, err error)
	UpsertAuthorizationCodeInfo(ctx context.Context, info *entity.AuthorizationCodeInfo) (err error)
	UpdateLastActiveAt(ctx context.Context, meta *entity.AuthorizationCodeMeta, lastActiveAtMs int64) (err error)
}
