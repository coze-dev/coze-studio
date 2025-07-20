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

	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
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
