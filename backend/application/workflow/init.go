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
	"context"

	"github.com/cloudwego/eino/compose"
	"gorm.io/gorm"

	"github.com/cloudwego/eino/callbacks"
	"github.com/coze-dev/coze-studio/backend/application/internal"

	wfdatabase "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/database"
	wfknowledge "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/knowledge"
	wfmodel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	wfplugin "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/plugin"
	wfsearch "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/search"
	"github.com/coze-dev/coze-studio/backend/crossdomain/workflow/variable"
	knowledge "github.com/coze-dev/coze-studio/backend/domain/knowledge/service"
	dbservice "github.com/coze-dev/coze-studio/backend/domain/memory/database/service"
	variables "github.com/coze-dev/coze-studio/backend/domain/memory/variables/service"
	plugin "github.com/coze-dev/coze-studio/backend/domain/plugin/service"
	search "github.com/coze-dev/coze-studio/backend/domain/search/service"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	crosscode "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/code"
	crossdatabase "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/database"
	crossknowledge "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/knowledge"
	crossmodel "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/model"
	crossplugin "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/plugin"
	crosssearch "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/search"
	crossvariable "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/variable"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/service"
	workflowservice "github.com/coze-dev/coze-studio/backend/domain/workflow/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/coderunner"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/imagex"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type ServiceComponents struct {
	IDGen              idgen.IDGenerator
	DB                 *gorm.DB
	Cache              cache.Cmdable
	DatabaseDomainSVC  dbservice.Database
	VariablesDomainSVC variables.Variables
	PluginDomainSVC    plugin.PluginService
	KnowledgeDomainSVC knowledge.Knowledge
	ModelManager       modelmgr.Manager
	DomainNotifier     search.ResourceEventBus
	Tos                storage.Storage
	ImageX             imagex.ImageX
	CPStore            compose.CheckPointStore
	CodeRunner         coderunner.Runner
}

func InitService(ctx context.Context, components *ServiceComponents) (*ApplicationService, error) {
	bcm, ok, err := internal.GetBuiltinChatModel(ctx, "WKR_")
	if err != nil {
		return nil, err
	}
	if !ok {
		logs.CtxWarnf(ctx, "workflow builtin chat model for knowledge recall not configured")
	}

	service.RegisterAllNodeAdaptors()

	workflowRepo := service.NewWorkflowRepository(components.IDGen, components.DB, components.Cache,
		components.Tos, components.CPStore, bcm)
	workflow.SetRepository(workflowRepo)

	workflowDomainSVC := service.NewWorkflowService(workflowRepo)
	crossdatabase.SetDatabaseOperator(wfdatabase.NewDatabaseRepository(components.DatabaseDomainSVC))
	crossvariable.SetVariableHandler(variable.NewVariableHandler(components.VariablesDomainSVC))
	crossvariable.SetVariablesMetaGetter(variable.NewVariablesMetaGetter(components.VariablesDomainSVC))
	crossplugin.SetPluginService(wfplugin.NewPluginService(components.PluginDomainSVC, components.Tos))
	crossknowledge.SetKnowledgeOperator(wfknowledge.NewKnowledgeRepository(components.KnowledgeDomainSVC, components.IDGen))
	crossmodel.SetManager(wfmodel.NewModelManager(components.ModelManager, nil))
	crosscode.SetCodeRunner(components.CodeRunner)
	crosssearch.SetNotifier(wfsearch.NewNotify(components.DomainNotifier))
	callbacks.AppendGlobalHandlers(workflowservice.GetTokenCallbackHandler())

	SVC.DomainSVC = workflowDomainSVC
	SVC.ImageX = components.ImageX
	SVC.TosClient = components.Tos
	SVC.IDGenerator = components.IDGen

	return SVC, err
}
