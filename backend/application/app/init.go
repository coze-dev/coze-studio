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
	redis "code.byted.org/kv/goredis"
	"gorm.io/gorm"

	"code.byted.org/data_edc/workflow_engine_next/domain/app/repository"
	"code.byted.org/data_edc/workflow_engine_next/domain/app/service"
	connector "code.byted.org/data_edc/workflow_engine_next/domain/connector/service"
	variables "code.byted.org/data_edc/workflow_engine_next/domain/memory/variables/service"
	search "code.byted.org/data_edc/workflow_engine_next/domain/search/service"
	user "code.byted.org/data_edc/workflow_engine_next/domain/user/service"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/idgen"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/storage"
)

type ServiceComponents struct {
	IDGen           idgen.IDGenerator
	DB              *gorm.DB
	OSS             storage.Storage
	CacheCli        *redis.Client
	ProjectEventBus search.ProjectEventBus

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

	APPApplicationSVC.userSVC = components.UserSVC
	APPApplicationSVC.connectorSVC = components.ConnectorSVC
	APPApplicationSVC.variablesSVC = components.VariablesSVC

	return APPApplicationSVC, nil
}
