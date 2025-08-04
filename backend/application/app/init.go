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

package app

import (
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/app/repository"
	"github.com/coze-dev/coze-studio/backend/domain/app/service"
	connector "github.com/coze-dev/coze-studio/backend/domain/connector/service"
	variables "github.com/coze-dev/coze-studio/backend/domain/memory/variables/service"
	search "github.com/coze-dev/coze-studio/backend/domain/search/service"
	user "github.com/coze-dev/coze-studio/backend/domain/user/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
)

type ServiceComponents struct {
	IDGen           idgen.IDGenerator
	DB              *gorm.DB
	OSS             storage.Storage
	CacheCli        cache.Cmdable
	ProjectEventBus search.ProjectEventBus

	ModelMgr     modelmgr.Manager
	UserSVC      user.User
	ConnectorSVC connector.Connector
	VariablesSVC variables.Variables
}

func InitService(components *ServiceComponents) (*APPApplicationService, error) {
	appRepo := repository.NewAPPRepo(&repository.APPRepoComponents{
		IDGen:    components.IDGen,
		DB:       components.DB,
		CacheCli: components.CacheCli,
	})

	domainComponents := &service.Components{
		IDGen:   components.IDGen,
		DB:      components.DB,
		APPRepo: appRepo,
	}

	domainSVC := service.NewService(domainComponents)

	APPApplicationSVC.DomainSVC = domainSVC
	APPApplicationSVC.appRepo = appRepo

	APPApplicationSVC.oss = components.OSS
	APPApplicationSVC.projectEventBus = components.ProjectEventBus
	APPApplicationSVC.modelMgr = components.ModelMgr

	APPApplicationSVC.userSVC = components.UserSVC
	APPApplicationSVC.connectorSVC = components.ConnectorSVC
	APPApplicationSVC.variablesSVC = components.VariablesSVC

	return APPApplicationSVC, nil
}
