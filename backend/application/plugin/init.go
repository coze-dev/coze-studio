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

	pluginConf "code.byted.org/data_edc/workflow_engine_next/domain/plugin/conf"
	"code.byted.org/data_edc/workflow_engine_next/domain/plugin/repository"
	"code.byted.org/data_edc/workflow_engine_next/domain/plugin/service"
	search "code.byted.org/data_edc/workflow_engine_next/domain/search/service"
	user "code.byted.org/data_edc/workflow_engine_next/domain/user/service"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/idgen"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/storage"
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
