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

package crossapp

import (
	"context"

	crossapp "github.com/coze-dev/coze-studio/backend/crossdomain/app"
	"github.com/coze-dev/coze-studio/backend/domain/app/entity"
	"github.com/coze-dev/coze-studio/backend/domain/app/service"
)

type appServiceImpl struct {
	DomainSVC service.AppService
}

func InitDomainService(domainSVC service.AppService) crossapp.AppService {
	return &appServiceImpl{
		DomainSVC: domainSVC,
	}
}

func (a *appServiceImpl) GetDraftAPP(ctx context.Context, appID int64) (app *entity.APP, err error) {
	return a.DomainSVC.GetDraftAPP(ctx, appID)
}
