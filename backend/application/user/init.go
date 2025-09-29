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

package user

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/user/repository"
	"github.com/coze-dev/coze-studio/backend/domain/user/service"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
)

func InitService(ctx context.Context, db *gorm.DB, oss storage.Storage, idgen idgen.IDGenerator) *UserApplicationService {
	UserApplicationSVC.DomainSVC = service.NewUserDomain(ctx, &service.Components{
		IconOSS:   oss,
		IDGen:     idgen,
		UserRepo:  repository.NewUserRepo(db),
		SpaceRepo: repository.NewSpaceRepo(db),
	})
	UserApplicationSVC.oss = oss

	return UserApplicationSVC
}
