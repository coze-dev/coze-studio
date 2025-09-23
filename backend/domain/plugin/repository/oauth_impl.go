/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package repository

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
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

func (o *oauthRepoImpl) GetAuthorizationCode(ctx context.Context, meta *dto.AuthorizationCodeMeta) (info *dto.AuthorizationCodeInfo, exist bool, err error) {
	return o.oauthAuth.Get(ctx, meta)
}

func (o *oauthRepoImpl) UpsertAuthorizationCode(ctx context.Context, info *dto.AuthorizationCodeInfo) (err error) {
	return o.oauthAuth.Upsert(ctx, info)
}

func (o *oauthRepoImpl) UpdateAuthorizationCodeLastActiveAt(ctx context.Context, meta *dto.AuthorizationCodeMeta, lastActiveAtMs int64) (err error) {
	return o.oauthAuth.UpdateLastActiveAt(ctx, meta, lastActiveAtMs)
}

func (o *oauthRepoImpl) BatchDeleteAuthorizationCodeByIDs(ctx context.Context, ids []int64) (err error) {
	return o.oauthAuth.BatchDeleteByIDs(ctx, ids)
}

func (o *oauthRepoImpl) DeleteAuthorizationCode(ctx context.Context, meta *dto.AuthorizationCodeMeta) (err error) {
	return o.oauthAuth.Delete(ctx, meta)
}

func (o *oauthRepoImpl) GetAuthorizationCodeRefreshTokens(ctx context.Context, nextRefreshAt int64, limit int) (infos []*dto.AuthorizationCodeInfo, err error) {
	return o.oauthAuth.GetRefreshTokenList(ctx, nextRefreshAt, limit)
}

func (o *oauthRepoImpl) DeleteExpiredAuthorizationCodeTokens(ctx context.Context, expireAt int64, limit int) (err error) {
	return o.oauthAuth.DeleteExpiredTokens(ctx, expireAt, limit)
}

func (o *oauthRepoImpl) DeleteInactiveAuthorizationCodeTokens(ctx context.Context, lastActiveAt int64, limit int) (err error) {
	return o.oauthAuth.DeleteInactiveTokens(ctx, lastActiveAt, limit)
}
