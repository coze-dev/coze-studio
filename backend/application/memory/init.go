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

package memory

import (
	"gorm.io/gorm"

	database "github.com/coze-dev/coze-studio/backend/domain/memory/database/service"
	"github.com/coze-dev/coze-studio/backend/domain/memory/variables/repository"
	variables "github.com/coze-dev/coze-studio/backend/domain/memory/variables/service"
	search "github.com/coze-dev/coze-studio/backend/domain/search/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/rdb"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	rdbService "github.com/coze-dev/coze-studio/backend/infra/impl/rdb"
)

type MemoryApplicationServices struct {
	VariablesDomainSVC variables.Variables
	DatabaseDomainSVC  database.Database
	RDBDomainSVC       rdb.RDB
}

type ServiceComponents struct {
	IDGen                  idgen.IDGenerator
	DB                     *gorm.DB
	EventBus               search.ResourceEventBus
	TosClient              storage.Storage
	ResourceDomainNotifier search.ResourceEventBus
	CacheCli               cache.Cmdable
}

func InitService(c *ServiceComponents) *MemoryApplicationServices {
	repo := repository.NewVariableRepo(c.DB, c.IDGen)
	variablesDomainSVC := variables.NewService(repo)
	rdbSVC := rdbService.NewService(c.DB, c.IDGen)
	databaseDomainSVC := database.NewService(rdbSVC, c.DB, c.IDGen, c.TosClient, c.CacheCli)

	VariableApplicationSVC.DomainSVC = variablesDomainSVC
	DatabaseApplicationSVC.DomainSVC = databaseDomainSVC
	DatabaseApplicationSVC.eventbus = c.ResourceDomainNotifier

	return &MemoryApplicationServices{
		VariablesDomainSVC: variablesDomainSVC,
		DatabaseDomainSVC:  databaseDomainSVC,
		RDBDomainSVC:       rdbSVC,
	}
}
