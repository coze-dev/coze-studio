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

func (o *oauthRepoImpl) GetAuthorizationCodeInfo(ctx context.Context, meta *entity.AuthorizationCodeMeta) (info *entity.AuthorizationCodeInfo, exist bool, err error) {
	return o.oauthAuth.Get(ctx, meta)
}

func (o *oauthRepoImpl) UpsertAuthorizationCodeInfo(ctx context.Context, info *entity.AuthorizationCodeInfo) (err error) {
	return o.oauthAuth.Upsert(ctx, info)
}

func (o *oauthRepoImpl) UpdateLastActiveAt(ctx context.Context, meta *entity.AuthorizationCodeMeta, lastActiveAtMs int64) (err error) {
	return o.oauthAuth.UpdateLastActiveAt(ctx, meta, lastActiveAtMs)
}
