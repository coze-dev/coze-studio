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
	"path/filepath"

	"os"

	"gopkg.in/yaml.v3"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/compose"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/crossdomain/impl/code"

	knowledge "github.com/coze-dev/coze-studio/backend/domain/knowledge/service"
	dbservice "github.com/coze-dev/coze-studio/backend/domain/memory/database/service"
	variables "github.com/coze-dev/coze-studio/backend/domain/memory/variables/service"
	plugin "github.com/coze-dev/coze-studio/backend/domain/plugin/service"
	wrapPlugin "github.com/coze-dev/coze-studio/backend/domain/workflow/plugin"

	search "github.com/coze-dev/coze-studio/backend/domain/search/service"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/config"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/service"
	workflowservice "github.com/coze-dev/coze-studio/backend/domain/workflow/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/contract/coderunner"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/imagex"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
)

type ServiceComponents struct {
	IDGen                    idgen.IDGenerator
	DB                       *gorm.DB
	Cache                    cache.Cmdable
	DatabaseDomainSVC        dbservice.Database
	VariablesDomainSVC       variables.Variables
	PluginDomainSVC          plugin.PluginService
	KnowledgeDomainSVC       knowledge.Knowledge
	DomainNotifier           search.ResourceEventBus
	Tos                      storage.Storage
	ImageX                   imagex.ImageX
	CPStore                  compose.CheckPointStore
	CodeRunner               coderunner.Runner
	WorkflowBuildInChatModel chatmodel.BaseChatModel
}

func initWorkflowConfig() (workflow.WorkflowConfig, error) {
	wd, err := os.Getwd()
	if err != nil {
		return nil, err
	}
	configBs, err := os.ReadFile(filepath.Join(wd, "resources/conf/workflow/config.yaml"))
	if err != nil {
		return nil, err
	}
	var cfg *config.WorkflowConfig
	err = yaml.Unmarshal(configBs, &cfg)
	if err != nil {
		return nil, err
	}
	return cfg, nil
}

func InitService(_ context.Context, components *ServiceComponents) (*ApplicationService, error) {
	service.RegisterAllNodeAdaptors()

	cfg, err := initWorkflowConfig()
	if err != nil {
		return nil, err
	}

	workflowRepo, err := service.NewWorkflowRepository(components.IDGen, components.DB, components.Cache,
		components.Tos, components.CPStore, components.WorkflowBuildInChatModel, cfg)
	if err != nil {
		return nil, err
	}

	workflow.SetRepository(workflowRepo)

	workflowDomainSVC := service.NewWorkflowService(workflowRepo)
	wrapPlugin.SetOSS(components.Tos)

	code.SetCodeRunner(components.CodeRunner)
	callbacks.AppendGlobalHandlers(workflowservice.GetTokenCallbackHandler())

	setEventBus(components.DomainNotifier)

	SVC.DomainSVC = workflowDomainSVC
	SVC.ImageX = components.ImageX
	SVC.TosClient = components.Tos
	SVC.IDGenerator = components.IDGen

	err = SVC.InitNodeIconURLCache(context.Background())
	if err != nil {
		return nil, err
	}

	return SVC, nil
}
