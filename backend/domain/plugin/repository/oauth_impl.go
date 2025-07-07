package repository

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type OAuthRepoComponents struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewOAuthRepo(components *OAuthRepoComponents) OAuthRepository {
	return &oauthRepoImpl{
		oauthAuth: dal.NewPluginOAuthAuthDAO(components.DB, components.IDGen),
	}
}

type oauthRepoImpl struct {
	oauthAuth *dal.PluginOAuthAuthDAO
}

func (o *oauthRepoImpl) GetAuthorizationCode(ctx context.Context, meta *entity.AuthorizationCodeMeta) (info *entity.AuthorizationCodeInfo, exist bool, err error) {
	return o.oauthAuth.Get(ctx, meta)
}

func (o *oauthRepoImpl) UpsertAuthorizationCode(ctx context.Context, info *entity.AuthorizationCodeInfo) (err error) {
	return o.oauthAuth.Upsert(ctx, info)
}

func (o *oauthRepoImpl) UpdateAuthorizationCodeLastActiveAt(ctx context.Context, meta *entity.AuthorizationCodeMeta, lastActiveAtMs int64) (err error) {
	return o.oauthAuth.UpdateLastActiveAt(ctx, meta, lastActiveAtMs)
}

func (o *oauthRepoImpl) BatchDeleteAuthorizationCodeByIDs(ctx context.Context, ids []int64) (err error) {
	return o.oauthAuth.BatchDeleteByIDs(ctx, ids)
}

func (o *oauthRepoImpl) DeleteAuthorizationCode(ctx context.Context, meta *entity.AuthorizationCodeMeta) (err error) {
	return o.oauthAuth.Delete(ctx, meta)
}

func (o *oauthRepoImpl) GetAuthorizationCodeRefreshTokens(ctx context.Context, nextRefreshAt int64, limit int) (infos []*entity.AuthorizationCodeInfo, err error) {
	return o.oauthAuth.GetRefreshTokenList(ctx, nextRefreshAt, limit)
}

func (o *oauthRepoImpl) DeleteExpiredAuthorizationCodeTokens(ctx context.Context, expireAt int64, limit int) (err error) {
	return o.oauthAuth.DeleteExpiredTokens(ctx, expireAt, limit)
}

func (o *oauthRepoImpl) DeleteInactiveAuthorizationCodeTokens(ctx context.Context, lastActiveAt int64, limit int) (err error) {
	return o.oauthAuth.DeleteInactiveTokens(ctx, lastActiveAt, limit)
}
