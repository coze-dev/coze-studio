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

package application

import (
	"context"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/application/openauth"
	"github.com/coze-dev/coze-studio/backend/application/template"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crosssearch"
	"github.com/coze-dev/coze-studio/backend/api/handler/coze"
	"github.com/coze-dev/coze-studio/backend/domain/model/service"
	"github.com/coze-dev/coze-studio/backend/domain/model/repository"

	"github.com/coze-dev/coze-studio/backend/application/app"
	"github.com/coze-dev/coze-studio/backend/application/base/appinfra"
	"github.com/coze-dev/coze-studio/backend/application/connector"
	"github.com/coze-dev/coze-studio/backend/application/conversation"
	"github.com/coze-dev/coze-studio/backend/application/knowledge"
	"github.com/coze-dev/coze-studio/backend/application/memory"
	"github.com/coze-dev/coze-studio/backend/application/modelmgr"
	"github.com/coze-dev/coze-studio/backend/application/plugin"
	"github.com/coze-dev/coze-studio/backend/application/prompt"
	"github.com/coze-dev/coze-studio/backend/application/search"
	"github.com/coze-dev/coze-studio/backend/application/shortcutcmd"
	"github.com/coze-dev/coze-studio/backend/application/singleagent"
	"github.com/coze-dev/coze-studio/backend/application/upload"
	"github.com/coze-dev/coze-studio/backend/application/user"
	"github.com/coze-dev/coze-studio/backend/application/workflow"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossagent"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossagentrun"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossconnector"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossconversation"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossdatabase"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossdatacopy"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossknowledge"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossmessage"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossplugin"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossuser"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossvariables"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossworkflow"
	agentrunImpl "github.com/coze-dev/coze-studio/backend/crossdomain/impl/agentrun"
	connectorImpl "github.com/coze-dev/coze-studio/backend/crossdomain/impl/connector"
	conversationImpl "github.com/coze-dev/coze-studio/backend/crossdomain/impl/conversation"
	crossuserImpl "github.com/coze-dev/coze-studio/backend/crossdomain/impl/crossuser"
	databaseImpl "github.com/coze-dev/coze-studio/backend/crossdomain/impl/database"
	dataCopyImpl "github.com/coze-dev/coze-studio/backend/crossdomain/impl/datacopy"
	knowledgeImpl "github.com/coze-dev/coze-studio/backend/crossdomain/impl/knowledge"
	messageImpl "github.com/coze-dev/coze-studio/backend/crossdomain/impl/message"
	pluginImpl "github.com/coze-dev/coze-studio/backend/crossdomain/impl/plugin"
	searchImpl "github.com/coze-dev/coze-studio/backend/crossdomain/impl/search"
	singleagentImpl "github.com/coze-dev/coze-studio/backend/crossdomain/impl/singleagent"
	variablesImpl "github.com/coze-dev/coze-studio/backend/crossdomain/impl/variables"
	workflowImpl "github.com/coze-dev/coze-studio/backend/crossdomain/impl/workflow"
	"github.com/coze-dev/coze-studio/backend/infra/impl/checkpoint"
)

type eventbusImpl struct {
	resourceEventBus search.ResourceEventBus
	projectEventBus  search.ProjectEventBus
}

type basicServices struct {
	infra        *appinfra.AppDependencies
	eventbus     *eventbusImpl
	modelMgrSVC  *modelmgr.ModelmgrApplicationService
	connectorSVC *connector.ConnectorApplicationService
	userSVC      *user.UserApplicationService
	promptSVC    *prompt.PromptApplicationService
	templateSVC  *template.ApplicationService
	openAuthSVC  *openauth.OpenAuthApplicationService
}

type primaryServices struct {
	basicServices *basicServices
	infra         *appinfra.AppDependencies

	pluginSVC    *plugin.PluginApplicationService
	memorySVC    *memory.MemoryApplicationServices
	knowledgeSVC *knowledge.KnowledgeApplicationService
	workflowSVC  *workflow.ApplicationService
	shortcutSVC  *shortcutcmd.ShortcutCmdApplicationService
}

type complexServices struct {
	primaryServices *primaryServices
	singleAgentSVC  *singleagent.SingleAgentApplicationService
	appSVC          *app.APPApplicationService
	searchSVC       *search.SearchApplicationService
	conversationSVC *conversation.ConversationApplicationService
}

func Init(ctx context.Context) (err error) {
	infra, err := appinfra.Init(ctx)
	if err != nil {
		return err
	}

	eventbus := initEventBus(infra)

	basicServices, err := initBasicServices(ctx, infra, eventbus)
	if err != nil {
		return fmt.Errorf("Init - initBasicServices failed, err: %v", err)
	}

	primaryServices, err := initPrimaryServices(ctx, basicServices)
	if err != nil {
		return fmt.Errorf("Init - initPrimaryServices failed, err: %v", err)
	}

	complexServices, err := initComplexServices(ctx, primaryServices)
	if err != nil {
		return fmt.Errorf("Init - initVitalServices failed, err: %v", err)
	}

	crossconnector.SetDefaultSVC(connectorImpl.InitDomainService(basicServices.connectorSVC.DomainSVC))
	crossdatabase.SetDefaultSVC(databaseImpl.InitDomainService(primaryServices.memorySVC.DatabaseDomainSVC))
	crossknowledge.SetDefaultSVC(knowledgeImpl.InitDomainService(primaryServices.knowledgeSVC.DomainSVC))
	crossplugin.SetDefaultSVC(pluginImpl.InitDomainService(primaryServices.pluginSVC.DomainSVC))
	crossvariables.SetDefaultSVC(variablesImpl.InitDomainService(primaryServices.memorySVC.VariablesDomainSVC))
	crossworkflow.SetDefaultSVC(workflowImpl.InitDomainService(primaryServices.workflowSVC.DomainSVC))
	crossconversation.SetDefaultSVC(conversationImpl.InitDomainService(complexServices.conversationSVC.ConversationDomainSVC))
	crossmessage.SetDefaultSVC(messageImpl.InitDomainService(complexServices.conversationSVC.MessageDomainSVC))
	crossagentrun.SetDefaultSVC(agentrunImpl.InitDomainService(complexServices.conversationSVC.AgentRunDomainSVC))
	crossagent.SetDefaultSVC(singleagentImpl.InitDomainService(complexServices.singleAgentSVC.DomainSVC, infra.ImageXClient))
	crossuser.SetDefaultSVC(crossuserImpl.InitDomainService(basicServices.userSVC.DomainSVC))
	crossdatacopy.SetDefaultSVC(dataCopyImpl.InitDomainService(basicServices.infra))
	crosssearch.SetDefaultSVC(searchImpl.InitDomainService(complexServices.searchSVC.DomainSVC))

	// Initialize Model Service
	modelService := initModelService(infra)
	if modelService != nil {
		coze.InitModelService(modelService)
	}

	return nil
}

func initEventBus(infra *appinfra.AppDependencies) *eventbusImpl {
	e := &eventbusImpl{}
	e.resourceEventBus = search.NewResourceEventBus(infra.ResourceEventProducer)
	e.projectEventBus = search.NewProjectEventBus(infra.AppEventProducer)

	return e
}

// initBasicServices init basic services that only depends on infra.
func initBasicServices(ctx context.Context, infra *appinfra.AppDependencies, e *eventbusImpl) (*basicServices, error) {
	upload.InitService(infra.TOSClient, infra.CacheCli)
	openAuthSVC := openauth.InitService(infra.DB, infra.IDGenSVC)
	promptSVC := prompt.InitService(infra.DB, infra.IDGenSVC, e.resourceEventBus)
	modelMgrSVC := modelmgr.InitService(infra.ModelMgr, infra.TOSClient)
	connectorSVC := connector.InitService(infra.TOSClient)
	userSVC := user.InitService(ctx, infra.DB, infra.TOSClient, infra.IDGenSVC)
	templateSVC := template.InitService(ctx, &template.ServiceComponents{
		DB:      infra.DB,
		IDGen:   infra.IDGenSVC,
		Storage: infra.TOSClient,
	})

	return &basicServices{
		infra:        infra,
		eventbus:     e,
		modelMgrSVC:  modelMgrSVC,
		connectorSVC: connectorSVC,
		userSVC:      userSVC,
		promptSVC:    promptSVC,
		templateSVC:  templateSVC,
		openAuthSVC:  openAuthSVC,
	}, nil
}

// initPrimaryServices init primary services that depends on basic services.
func initPrimaryServices(ctx context.Context, basicServices *basicServices) (*primaryServices, error) {
	pluginSVC, err := plugin.InitService(ctx, basicServices.toPluginServiceComponents())
	if err != nil {
		return nil, err
	}

	memorySVC := memory.InitService(basicServices.toMemoryServiceComponents())

	knowledgeSVC, err := knowledge.InitService(basicServices.toKnowledgeServiceComponents(memorySVC))
	if err != nil {
		return nil, err
	}

	workflowDomainSVC := workflow.InitService(
		basicServices.toWorkflowServiceComponents(pluginSVC, memorySVC, knowledgeSVC))

	shortcutSVC := shortcutcmd.InitService(basicServices.infra.DB, basicServices.infra.IDGenSVC)

	return &primaryServices{
		basicServices: basicServices,
		pluginSVC:     pluginSVC,
		memorySVC:     memorySVC,
		knowledgeSVC:  knowledgeSVC,
		workflowSVC:   workflowDomainSVC,
		shortcutSVC:   shortcutSVC,
		infra:         basicServices.infra,
	}, nil
}

// initComplexServices init complex services that depends on primary services.
func initComplexServices(ctx context.Context, p *primaryServices) (*complexServices, error) {
	singleAgentSVC, err := singleagent.InitService(p.toSingleAgentServiceComponents())
	if err != nil {
		return nil, err
	}

	appSVC, err := app.InitService(p.toAPPServiceComponents())
	if err != nil {
		return nil, err
	}

	searchSVC, err := search.InitService(ctx, p.toSearchServiceComponents(singleAgentSVC, appSVC))
	if err != nil {
		return nil, err
	}

	conversationSVC := conversation.InitService(p.toConversationComponents(singleAgentSVC))

	return &complexServices{
		primaryServices: p,
		singleAgentSVC:  singleAgentSVC,
		appSVC:          appSVC,
		searchSVC:       searchSVC,
		conversationSVC: conversationSVC,
	}, nil
}

func (b *basicServices) toPluginServiceComponents() *plugin.ServiceComponents {
	return &plugin.ServiceComponents{
		IDGen:    b.infra.IDGenSVC,
		DB:       b.infra.DB,
		EventBus: b.eventbus.resourceEventBus,
		OSS:      b.infra.TOSClient,
		UserSVC:  b.userSVC.DomainSVC,
	}
}

func (b *basicServices) toKnowledgeServiceComponents(memoryService *memory.MemoryApplicationServices) *knowledge.ServiceComponents {
	return &knowledge.ServiceComponents{
		DB:       b.infra.DB,
		IDGenSVC: b.infra.IDGenSVC,
		Storage:  b.infra.TOSClient,
		RDB:      memoryService.RDBDomainSVC,
		ImageX:   b.infra.ImageXClient,
		ES:       b.infra.ESClient,
		EventBus: b.eventbus.resourceEventBus,
		CacheCli: b.infra.CacheCli,
	}
}

func (b *basicServices) toMemoryServiceComponents() *memory.ServiceComponents {
	return &memory.ServiceComponents{
		IDGen:                  b.infra.IDGenSVC,
		DB:                     b.infra.DB,
		EventBus:               b.eventbus.resourceEventBus,
		TosClient:              b.infra.TOSClient,
		ResourceDomainNotifier: b.eventbus.resourceEventBus,
		CacheCli:               b.infra.CacheCli,
	}
}

func (b *basicServices) toWorkflowServiceComponents(pluginSVC *plugin.PluginApplicationService, memorySVC *memory.MemoryApplicationServices, knowledgeSVC *knowledge.KnowledgeApplicationService) *workflow.ServiceComponents {
	return &workflow.ServiceComponents{
		IDGen:              b.infra.IDGenSVC,
		DB:                 b.infra.DB,
		Cache:              b.infra.CacheCli,
		Tos:                b.infra.TOSClient,
		ImageX:             b.infra.ImageXClient,
		DatabaseDomainSVC:  memorySVC.DatabaseDomainSVC,
		VariablesDomainSVC: memorySVC.VariablesDomainSVC,
		PluginDomainSVC:    pluginSVC.DomainSVC,
		KnowledgeDomainSVC: knowledgeSVC.DomainSVC,
		ModelManager:       b.infra.ModelMgr,
		DomainNotifier:     b.eventbus.resourceEventBus,
		CPStore:            checkpoint.NewRedisStore(b.infra.CacheCli),
		CodeRunner:         b.infra.CodeRunner,
	}
}

func (p *primaryServices) toSingleAgentServiceComponents() *singleagent.ServiceComponents {
	return &singleagent.ServiceComponents{
		IDGen:                p.basicServices.infra.IDGenSVC,
		DB:                   p.basicServices.infra.DB,
		Cache:                p.basicServices.infra.CacheCli,
		TosClient:            p.basicServices.infra.TOSClient,
		ImageX:               p.basicServices.infra.ImageXClient,
		ModelMgr:             p.infra.ModelMgr,
		UserDomainSVC:        p.basicServices.userSVC.DomainSVC,
		EventBus:             p.basicServices.eventbus.projectEventBus,
		DatabaseDomainSVC:    p.memorySVC.DatabaseDomainSVC,
		ConnectorDomainSVC:   p.basicServices.connectorSVC.DomainSVC,
		KnowledgeDomainSVC:   p.knowledgeSVC.DomainSVC,
		PluginDomainSVC:      p.pluginSVC.DomainSVC,
		WorkflowDomainSVC:    p.workflowSVC.DomainSVC,
		VariablesDomainSVC:   p.memorySVC.VariablesDomainSVC,
		ShortcutCMDDomainSVC: p.shortcutSVC.ShortCutDomainSVC,
		CPStore:              checkpoint.NewRedisStore(p.infra.CacheCli),
	}
}

func (p *primaryServices) toSearchServiceComponents(singleAgentSVC *singleagent.SingleAgentApplicationService, appSVC *app.APPApplicationService) *search.ServiceComponents {
	infra := p.basicServices.infra

	return &search.ServiceComponents{
		DB:                   infra.DB,
		Cache:                infra.CacheCli,
		TOS:                  infra.TOSClient,
		ESClient:             infra.ESClient,
		ProjectEventBus:      p.basicServices.eventbus.projectEventBus,
		SingleAgentDomainSVC: singleAgentSVC.DomainSVC,
		APPDomainSVC:         appSVC.DomainSVC,
		KnowledgeDomainSVC:   p.knowledgeSVC.DomainSVC,
		PluginDomainSVC:      p.pluginSVC.DomainSVC,
		WorkflowDomainSVC:    p.workflowSVC.DomainSVC,
		UserDomainSVC:        p.basicServices.userSVC.DomainSVC,
		ConnectorDomainSVC:   p.basicServices.connectorSVC.DomainSVC,
		PromptDomainSVC:      p.basicServices.promptSVC.DomainSVC,
		DatabaseDomainSVC:    p.memorySVC.DatabaseDomainSVC,
	}
}

func (p *primaryServices) toAPPServiceComponents() *app.ServiceComponents {
	infra := p.basicServices.infra
	basic := p.basicServices
	return &app.ServiceComponents{
		IDGen:           infra.IDGenSVC,
		DB:              infra.DB,
		OSS:             infra.TOSClient,
		CacheCli:        infra.CacheCli,
		ModelMgr:        infra.ModelMgr,
		ProjectEventBus: basic.eventbus.projectEventBus,
		UserSVC:         basic.userSVC.DomainSVC,
		ConnectorSVC:    basic.connectorSVC.DomainSVC,
		VariablesSVC:    p.memorySVC.VariablesDomainSVC,
	}
}

func (p *primaryServices) toConversationComponents(singleAgentSVC *singleagent.SingleAgentApplicationService) *conversation.ServiceComponents {
	infra := p.basicServices.infra

	return &conversation.ServiceComponents{
		DB:                   infra.DB,
		IDGen:                infra.IDGenSVC,
		TosClient:            infra.TOSClient,
		ImageX:               infra.ImageXClient,
		SingleAgentDomainSVC: singleAgentSVC.DomainSVC,
	}
}

func initModelService(infra *appinfra.AppDependencies) service.ModelService {
	repo := repository.NewModelRepository(infra.DB)
	return service.NewModelService(repo)
}
