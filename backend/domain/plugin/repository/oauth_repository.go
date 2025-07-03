package repository

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type OAuthRepository interface {
	GetAuthorizationCode(ctx context.Context, meta *entity.AuthorizationCodeMeta) (info *entity.AuthorizationCodeInfo, exist bool, err error)
	UpsertAuthorizationCode(ctx context.Context, info *entity.AuthorizationCodeInfo) (err error)
	UpdateAuthorizationCodeLastActiveAt(ctx context.Context, meta *entity.AuthorizationCodeMeta, lastActiveAtMs int64) (err error)
	BatchDeleteAuthorizationCodeByIDs(ctx context.Context, ids []int64) (err error)
	DeleteAuthorizationCode(ctx context.Context, meta *entity.AuthorizationCodeMeta) (err error)
	GetAuthorizationCodeRefreshTokens(ctx context.Context, nextRefreshAt int64, limit int) (infos []*entity.AuthorizationCodeInfo, err error)
	DeleteExpiredAuthorizationCodeTokens(ctx context.Context, expireAt int64, limit int) (err error)
	DeleteInactiveAuthorizationCodeTokens(ctx context.Context, lastActiveAt int64, limit int) (err error)
}
