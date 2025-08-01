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
	"strconv"
	"strings"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/plugin/conf"
	pluginConf "github.com/coze-dev/coze-studio/backend/domain/plugin/conf"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/repository"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/service"
	search "github.com/coze-dev/coze-studio/backend/domain/search/service"
	user "github.com/coze-dev/coze-studio/backend/domain/user/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/types/errno"
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

	err = checkIDExist(ctx, pluginSVC)
	if err != nil {
		return nil, err
	}

	PluginApplicationSVC.DomainSVC = pluginSVC
	PluginApplicationSVC.eventbus = components.EventBus
	PluginApplicationSVC.oss = components.OSS
	PluginApplicationSVC.userSVC = components.UserSVC
	PluginApplicationSVC.pluginRepo = pluginRepo
	PluginApplicationSVC.toolRepo = toolRepo

	return PluginApplicationSVC, nil
}

func checkIDExist(ctx context.Context, pluginService service.PluginService) error {
	pluginProducts := conf.GetAllPluginProducts()

	pluginIDs := make([]int64, 0, len(pluginProducts))
	var toolIDs []int64
	for _, p := range pluginProducts {
		pluginIDs = append(pluginIDs, p.Info.ID)
		toolIDs = append(toolIDs, p.ToolIDs...)
	}

	pluginInfos, err := pluginService.MGetDraftPlugins(ctx, pluginIDs)
	if err != nil {
		return err
	}
	if len(pluginInfos) > 0 {
		conflictsIDs := make([]int64, 0, len(pluginInfos))
		for _, p := range pluginInfos {
			conflictsIDs = append(conflictsIDs, p.ID)
		}

		return errorx.New(errno.ErrPluginIDExist,
			errorx.KV("plugin_id", strings.Join(slices.Transform(conflictsIDs, func(id int64) string {
				return strconv.FormatInt(id, 10)
			}), ",")),
		)
	}

	tools, err := pluginService.MGetDraftTools(ctx, toolIDs)
	if err != nil {
		return err
	}

	if len(tools) > 0 {
		conflictsIDs := make([]int64, 0, len(tools))
		for _, t := range tools {
			conflictsIDs = append(conflictsIDs, t.ID)
		}

		return errorx.New(errno.ErrToolIDExist,
			errorx.KV("tool_id", strings.Join(slices.Transform(conflictsIDs, func(id int64) string {
				return strconv.FormatInt(id, 10)
			}), ",")),
		)
	}
	return nil

}
