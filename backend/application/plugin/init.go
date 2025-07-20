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

package plugin

import (
	"context"

	"gorm.io/gorm"

	pluginConf "github.com/coze-dev/coze-studio/backend/domain/plugin/conf"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/repository"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/service"
	search "github.com/coze-dev/coze-studio/backend/domain/search/service"
	user "github.com/coze-dev/coze-studio/backend/domain/user/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
)

type ServiceComponents struct {
	IDGen    idgen.IDGenerator
	DB       *gorm.DB
	OSS      storage.Storage
	EventBus search.ResourceEventBus
	UserSVC  user.User
}

func InitService(ctx context.Context, components *ServiceComponents) (*PluginApplicationService, error) {
	err := pluginConf.InitConfig(ctx)
	if err != nil {
		return nil, err
	}

	toolRepo := repository.NewToolRepo(&repository.ToolRepoComponents{
		IDGen: components.IDGen,
		DB:    components.DB,
	})

	pluginRepo := repository.NewPluginRepo(&repository.PluginRepoComponents{
		IDGen: components.IDGen,
		DB:    components.DB,
	})

	oauthRepo := repository.NewOAuthRepo(&repository.OAuthRepoComponents{
		IDGen: components.IDGen,
		DB:    components.DB,
	})

	pluginSVC := service.NewService(&service.Components{
		IDGen:      components.IDGen,
		DB:         components.DB,
		OSS:        components.OSS,
		PluginRepo: pluginRepo,
		ToolRepo:   toolRepo,
		OAuthRepo:  oauthRepo,
	})

	PluginApplicationSVC.DomainSVC = pluginSVC
	PluginApplicationSVC.eventbus = components.EventBus
	PluginApplicationSVC.oss = components.OSS
	PluginApplicationSVC.userSVC = components.UserSVC
	PluginApplicationSVC.pluginRepo = pluginRepo
	PluginApplicationSVC.toolRepo = toolRepo

	return PluginApplicationSVC, nil
}
