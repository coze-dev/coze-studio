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

package workflow

import (
	redis "code.byted.org/kv/goredis"
	"github.com/cloudwego/eino/compose"
	"gorm.io/gorm"

	wfdatabase "code.byted.org/data_edc/workflow_engine_next/crossdomain/workflow/database"
	wfknowledge "code.byted.org/data_edc/workflow_engine_next/crossdomain/workflow/knowledge"
	wfmodel "code.byted.org/data_edc/workflow_engine_next/crossdomain/workflow/model"
	wfplugin "code.byted.org/data_edc/workflow_engine_next/crossdomain/workflow/plugin"
	wfsearch "code.byted.org/data_edc/workflow_engine_next/crossdomain/workflow/search"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/workflow/variable"
	knowledge "code.byted.org/data_edc/workflow_engine_next/domain/knowledge/service"
	dbservice "code.byted.org/data_edc/workflow_engine_next/domain/memory/database/service"
	variables "code.byted.org/data_edc/workflow_engine_next/domain/memory/variables/service"
	"code.byted.org/data_edc/workflow_engine_next/domain/modelmgr"
	plugin "code.byted.org/data_edc/workflow_engine_next/domain/plugin/service"
	search "code.byted.org/data_edc/workflow_engine_next/domain/search/service"
	"code.byted.org/data_edc/workflow_engine_next/domain/workflow"
	crosscode "code.byted.org/data_edc/workflow_engine_next/domain/workflow/crossdomain/code"
	crossdatabase "code.byted.org/data_edc/workflow_engine_next/domain/workflow/crossdomain/database"
	crossknowledge "code.byted.org/data_edc/workflow_engine_next/domain/workflow/crossdomain/knowledge"
	crossmodel "code.byted.org/data_edc/workflow_engine_next/domain/workflow/crossdomain/model"
	crossplugin "code.byted.org/data_edc/workflow_engine_next/domain/workflow/crossdomain/plugin"
	crosssearch "code.byted.org/data_edc/workflow_engine_next/domain/workflow/crossdomain/search"
	crossvariable "code.byted.org/data_edc/workflow_engine_next/domain/workflow/crossdomain/variable"
	"code.byted.org/data_edc/workflow_engine_next/domain/workflow/service"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/idgen"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/imagex"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/storage"
	"code.byted.org/data_edc/workflow_engine_next/infra/impl/coderunner"
)

type ServiceComponents struct {
	IDGen              idgen.IDGenerator
	DB                 *gorm.DB
	Cache              *redis.Client
	DatabaseDomainSVC  dbservice.Database
	VariablesDomainSVC variables.Variables
	PluginDomainSVC    plugin.PluginService
	KnowledgeDomainSVC knowledge.Knowledge
	ModelManager       modelmgr.Manager
	DomainNotifier     search.ResourceEventBus
	Tos                storage.Storage
	ImageX             imagex.ImageX
	CPStore            compose.CheckPointStore
}

func InitService(components *ServiceComponents) *ApplicationService {
	workflowRepo := service.NewWorkflowRepository(components.IDGen, components.DB, components.Cache,
		components.Tos, components.CPStore)
	workflow.SetRepository(workflowRepo)

	workflowDomainSVC := service.NewWorkflowService(workflowRepo)
	crossdatabase.SetDatabaseOperator(wfdatabase.NewDatabaseRepository(components.DatabaseDomainSVC))
	crossvariable.SetVariableHandler(variable.NewVariableHandler(components.VariablesDomainSVC))
	crossvariable.SetVariablesMetaGetter(variable.NewVariablesMetaGetter(components.VariablesDomainSVC))
	crossplugin.SetPluginService(wfplugin.NewPluginService(components.PluginDomainSVC, components.Tos))
	crossknowledge.SetKnowledgeOperator(wfknowledge.NewKnowledgeRepository(components.KnowledgeDomainSVC, components.IDGen))
	crossmodel.SetManager(wfmodel.NewModelManager(components.ModelManager, nil))
	crosscode.SetCodeRunner(coderunner.NewRunner())
	crosssearch.SetNotifier(wfsearch.NewNotify(components.DomainNotifier))

	SVC.DomainSVC = workflowDomainSVC
	SVC.ImageX = components.ImageX
	SVC.IDGenerator = components.IDGen

	return SVC
}
