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

	"code.byted.org/data_edc/workflow_engine_next/application/app"
	"code.byted.org/data_edc/workflow_engine_next/application/base/appinfra"
	"code.byted.org/data_edc/workflow_engine_next/application/connector"
	"code.byted.org/data_edc/workflow_engine_next/application/conversation"
	"code.byted.org/data_edc/workflow_engine_next/application/knowledge"
	"code.byted.org/data_edc/workflow_engine_next/application/memory"
	"code.byted.org/data_edc/workflow_engine_next/application/modelmgr"
	"code.byted.org/data_edc/workflow_engine_next/application/openauth"
	"code.byted.org/data_edc/workflow_engine_next/application/plugin"
	"code.byted.org/data_edc/workflow_engine_next/application/prompt"
	"code.byted.org/data_edc/workflow_engine_next/application/search"
	"code.byted.org/data_edc/workflow_engine_next/application/shortcutcmd"
	"code.byted.org/data_edc/workflow_engine_next/application/singleagent"
	"code.byted.org/data_edc/workflow_engine_next/application/template"
	"code.byted.org/data_edc/workflow_engine_next/application/upload"
	"code.byted.org/data_edc/workflow_engine_next/application/user"
	"code.byted.org/data_edc/workflow_engine_next/application/workflow"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crossagent"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crossagentrun"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crossconnector"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crossconversation"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crossdatabase"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crossdatacopy"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crossknowledge"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crossmessage"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crossmodelmgr"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crossplugin"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crosssearch"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crossuser"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crossvariables"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crossworkflow"
	agentrunImpl "code.byted.org/data_edc/workflow_engine_next/crossdomain/impl/agentrun"
	connectorImpl "code.byted.org/data_edc/workflow_engine_next/crossdomain/impl/connector"
	conversationImpl "code.byted.org/data_edc/workflow_engine_next/crossdomain/impl/conversation"
	crossuserImpl "code.byted.org/data_edc/workflow_engine_next/crossdomain/impl/crossuser"
	databaseImpl "code.byted.org/data_edc/workflow_engine_next/crossdomain/impl/database"
	dataCopyImpl "code.byted.org/data_edc/workflow_engine_next/crossdomain/impl/datacopy"
	knowledgeImpl "code.byted.org/data_edc/workflow_engine_next/crossdomain/impl/knowledge"
	messageImpl "code.byted.org/data_edc/workflow_engine_next/crossdomain/impl/message"
	modelmgrImpl "code.byted.org/data_edc/workflow_engine_next/crossdomain/impl/modelmgr"
	pluginImpl "code.byted.org/data_edc/workflow_engine_next/crossdomain/impl/plugin"
	searchImpl "code.byted.org/data_edc/workflow_engine_next/crossdomain/impl/search"
	singleagentImpl "code.byted.org/data_edc/workflow_engine_next/crossdomain/impl/singleagent"
	variablesImpl "code.byted.org/data_edc/workflow_engine_next/crossdomain/impl/variables"
	workflowImpl "code.byted.org/data_edc/workflow_engine_next/crossdomain/impl/workflow"

	"code.byted.org/data_edc/workflow_engine_next/infra/impl/checkpoint"
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
	crossmodelmgr.SetDefaultSVC(modelmgrImpl.InitDomainService(basicServices.modelMgrSVC.DomainSVC))
	crossplugin.SetDefaultSVC(pluginImpl.InitDomainService(primaryServices.pluginSVC.DomainSVC))
	crossvariables.SetDefaultSVC(variablesImpl.InitDomainService(primaryServices.memorySVC.VariablesDomainSVC))
	crossworkflow.SetDefaultSVC(workflowImpl.InitDomainService(primaryServices.workflowSVC.DomainSVC))
	crossconversation.SetDefaultSVC(conversationImpl.InitDomainService(complexServices.conversationSVC.ConversationDomainSVC))
	crossmessage.SetDefaultSVC(messageImpl.InitDomainService(complexServices.conversationSVC.MessageDomainSVC))
	crossagentrun.SetDefaultSVC(agentrunImpl.InitDomainService(complexServices.conversationSVC.AgentRunDomainSVC))
	crossagent.SetDefaultSVC(singleagentImpl.InitDomainService(complexServices.singleAgentSVC.DomainSVC))
	crossuser.SetDefaultSVC(crossuserImpl.InitDomainService(basicServices.userSVC.DomainSVC))
	crossdatacopy.SetDefaultSVC(dataCopyImpl.InitDomainService(basicServices.infra))
	crosssearch.SetDefaultSVC(searchImpl.InitDomainService(complexServices.searchSVC.DomainSVC))

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
	modelMgrSVC, err := modelmgr.InitService(infra.DB, infra.IDGenSVC, infra.TOSClient)
	if err != nil {
		return nil, err
	}
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
		IDGen:     b.infra.IDGenSVC,
		DB:        b.infra.DB,
		EventBus:  b.eventbus.resourceEventBus,
		TosClient: b.infra.TOSClient,
		// ResourceDomainNotifier: b.eventbus.resourceEventBus,
		CacheCli: b.infra.CacheCli,
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
		ModelManager:       b.modelMgrSVC.DomainSVC,
		DomainNotifier:     b.eventbus.resourceEventBus,
		CPStore:            checkpoint.NewRedisStore(b.infra.CacheCli),
	}
}

func (p *primaryServices) toSingleAgentServiceComponents() *singleagent.ServiceComponents {

	return &singleagent.ServiceComponents{
		IDGen:                p.basicServices.infra.IDGenSVC,
		DB:                   p.basicServices.infra.DB,
		Cache:                p.basicServices.infra.CacheCli,
		TosClient:            p.basicServices.infra.TOSClient,
		ImageX:               p.basicServices.infra.ImageXClient,
		ModelMgrDomainSVC:    p.basicServices.modelMgrSVC.DomainSVC,
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
