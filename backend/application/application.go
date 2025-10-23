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

	"github.com/coze-dev/coze-studio/backend/application/app"
	"github.com/coze-dev/coze-studio/backend/application/base/appinfra"
	"github.com/coze-dev/coze-studio/backend/application/connector"
	"github.com/coze-dev/coze-studio/backend/application/conversation"
	"github.com/coze-dev/coze-studio/backend/application/knowledge"
	"github.com/coze-dev/coze-studio/backend/application/memory"
	"github.com/coze-dev/coze-studio/backend/application/modelmgr"
	"github.com/coze-dev/coze-studio/backend/application/openauth"
	"github.com/coze-dev/coze-studio/backend/application/plugin"
	"github.com/coze-dev/coze-studio/backend/application/prompt"
	"github.com/coze-dev/coze-studio/backend/application/search"
	"github.com/coze-dev/coze-studio/backend/application/shortcutcmd"
	"github.com/coze-dev/coze-studio/backend/application/singleagent"
	"github.com/coze-dev/coze-studio/backend/application/template"
	"github.com/coze-dev/coze-studio/backend/application/upload"
	"github.com/coze-dev/coze-studio/backend/application/user"
	"github.com/coze-dev/coze-studio/backend/application/workflow"
	crossagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent"
	singleagentImpl "github.com/coze-dev/coze-studio/backend/crossdomain/agent/impl"
	crossagentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun"
	agentrunImpl "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun/impl"
	crossconnector "github.com/coze-dev/coze-studio/backend/crossdomain/connector"
	connectorImpl "github.com/coze-dev/coze-studio/backend/crossdomain/connector/impl"
	crossconversation "github.com/coze-dev/coze-studio/backend/crossdomain/conversation"
	conversationImpl "github.com/coze-dev/coze-studio/backend/crossdomain/conversation/impl"
	crossdatabase "github.com/coze-dev/coze-studio/backend/crossdomain/database"
	databaseImpl "github.com/coze-dev/coze-studio/backend/crossdomain/database/impl"
	crossdatacopy "github.com/coze-dev/coze-studio/backend/crossdomain/datacopy"
	dataCopyImpl "github.com/coze-dev/coze-studio/backend/crossdomain/datacopy/impl"
	crossknowledge "github.com/coze-dev/coze-studio/backend/crossdomain/knowledge"
	knowledgeImpl "github.com/coze-dev/coze-studio/backend/crossdomain/knowledge/impl"
	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/message"
	messageImpl "github.com/coze-dev/coze-studio/backend/crossdomain/message/impl"
	crossplugin "github.com/coze-dev/coze-studio/backend/crossdomain/plugin"
	pluginImpl "github.com/coze-dev/coze-studio/backend/crossdomain/plugin/impl"
	crosssearch "github.com/coze-dev/coze-studio/backend/crossdomain/search"
	searchImpl "github.com/coze-dev/coze-studio/backend/crossdomain/search/impl"
	crossupload "github.com/coze-dev/coze-studio/backend/crossdomain/upload"
	uploadImpl "github.com/coze-dev/coze-studio/backend/crossdomain/upload/impl"
	crossuser "github.com/coze-dev/coze-studio/backend/crossdomain/user"
	crossuserImpl "github.com/coze-dev/coze-studio/backend/crossdomain/user/impl"
	crossvariables "github.com/coze-dev/coze-studio/backend/crossdomain/variables"
	variablesImpl "github.com/coze-dev/coze-studio/backend/crossdomain/variables/impl"
	crossworkflow "github.com/coze-dev/coze-studio/backend/crossdomain/workflow"
	workflowImpl "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/impl"
	"github.com/coze-dev/coze-studio/backend/infra/checkpoint"
	"github.com/coze-dev/coze-studio/backend/infra/document/progressbar"
	progressBarImpl "github.com/coze-dev/coze-studio/backend/infra/document/progressbar/impl/progressbar"
	"github.com/coze-dev/coze-studio/backend/infra/eventbus"
	implEventbus "github.com/coze-dev/coze-studio/backend/infra/eventbus/impl"
	"github.com/coze-dev/coze-studio/backend/infra/sqlparser"
	sqlparserImpl "github.com/coze-dev/coze-studio/backend/infra/sqlparser/impl/sqlparser"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
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
	uploadSVC    *upload.UploadService
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
	ctx = ctxcache.Init(ctx)
	infra, err := appinfra.Init(ctx)
	if err != nil {
		return err
	}

	progressbar.New = progressBarImpl.NewProgressBar
	sqlparser.New = sqlparserImpl.NewSQLParser

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
	crossplugin.SetDefaultSVC(pluginImpl.InitDomainService(primaryServices.pluginSVC.DomainSVC, infra.OSS))
	crossvariables.SetDefaultSVC(variablesImpl.InitDomainService(primaryServices.memorySVC.VariablesDomainSVC))
	crossworkflow.SetDefaultSVC(workflowImpl.InitDomainService(primaryServices.workflowSVC.DomainSVC))
	crossconversation.SetDefaultSVC(conversationImpl.InitDomainService(complexServices.conversationSVC.ConversationDomainSVC))
	crossmessage.SetDefaultSVC(messageImpl.InitDomainService(complexServices.conversationSVC.MessageDomainSVC))
	crossagentrun.SetDefaultSVC(agentrunImpl.InitDomainService(complexServices.conversationSVC.AgentRunDomainSVC))
	crossagent.SetDefaultSVC(singleagentImpl.InitDomainService(complexServices.singleAgentSVC.DomainSVC))
	crossuser.SetDefaultSVC(crossuserImpl.InitDomainService(basicServices.userSVC.DomainSVC))
	crossdatacopy.SetDefaultSVC(dataCopyImpl.InitDomainService(basicServices.infra))
	crosssearch.SetDefaultSVC(searchImpl.InitDomainService(complexServices.searchSVC.DomainSVC))
	crossupload.SetDefaultSVC(uploadImpl.InitDomainService(basicServices.uploadSVC.UploadSVC))

	return nil
}

func initEventBus(infra *appinfra.AppDependencies) *eventbusImpl {
	e := &eventbusImpl{}
	eventbus.SetDefaultSVC(implEventbus.NewConsumerService())
	e.resourceEventBus = search.NewResourceEventBus(infra.ResourceEventProducer)
	e.projectEventBus = search.NewProjectEventBus(infra.AppEventProducer)

	return e
}

// initBasicServices init basic services that only depends on infra.
func initBasicServices(ctx context.Context, infra *appinfra.AppDependencies, e *eventbusImpl) (*basicServices, error) {
	uploadSVC := upload.InitService(&upload.UploadComponents{Cache: infra.CacheCli, Oss: infra.OSS, DB: infra.DB, Idgen: infra.IDGenSVC})
	openAuthSVC := openauth.InitService(infra.DB, infra.IDGenSVC)
	promptSVC := prompt.InitService(infra.DB, infra.IDGenSVC, e.resourceEventBus)
	modelMgrSVC := modelmgr.InitService(infra.OSS)
	connectorSVC := connector.InitService(infra.OSS)
	userSVC := user.InitService(ctx, infra.DB, infra.OSS, infra.IDGenSVC)
	templateSVC := template.InitService(ctx, &template.ServiceComponents{
		DB:      infra.DB,
		IDGen:   infra.IDGenSVC,
		Storage: infra.OSS,
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
		uploadSVC:    uploadSVC,
	}, nil
}

// initPrimaryServices init primary services that depends on basic services.
func initPrimaryServices(ctx context.Context, basicServices *basicServices) (*primaryServices, error) {
	pluginSVC, err := plugin.InitService(ctx, basicServices.toPluginServiceComponents())
	if err != nil {
		return nil, err
	}

	memorySVC := memory.InitService(basicServices.toMemoryServiceComponents())

	knowledgeSVC, err := knowledge.InitService(ctx,
		basicServices.toKnowledgeServiceComponents(memorySVC),
		basicServices.eventbus.resourceEventBus)
	if err != nil {
		return nil, err
	}

	workflowDomainSVC, err := workflow.InitService(ctx,
		basicServices.toWorkflowServiceComponents(pluginSVC, memorySVC, knowledgeSVC))
	if err != nil {
		return nil, err
	}

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
		OSS:      b.infra.OSS,
		UserSVC:  b.userSVC.DomainSVC,
	}
}

func (b *basicServices) toKnowledgeServiceComponents(memoryService *memory.MemoryApplicationServices) *knowledge.ServiceComponents {
	return &knowledge.ServiceComponents{
		DB:                  b.infra.DB,
		IDGen:               b.infra.IDGenSVC,
		RDB:                 memoryService.RDBDomainSVC,
		Producer:            b.infra.KnowledgeEventProducer,
		SearchStoreManagers: b.infra.SearchStoreManagers,
		ParseManager:        b.infra.ParserManager,
		Storage:             b.infra.OSS,
		Rewriter:            b.infra.Rewriter,
		Reranker:            b.infra.Reranker,
		NL2Sql:              b.infra.NL2SQL,
		CacheCli:            b.infra.CacheCli,
	}
}

func (b *basicServices) toMemoryServiceComponents() *memory.ServiceComponents {
	return &memory.ServiceComponents{
		IDGen:                  b.infra.IDGenSVC,
		DB:                     b.infra.DB,
		EventBus:               b.eventbus.resourceEventBus,
		TosClient:              b.infra.OSS,
		ResourceDomainNotifier: b.eventbus.resourceEventBus,
		CacheCli:               b.infra.CacheCli,
	}
}

func (b *basicServices) toWorkflowServiceComponents(pluginSVC *plugin.PluginApplicationService, memorySVC *memory.MemoryApplicationServices, knowledgeSVC *knowledge.KnowledgeApplicationService) *workflow.ServiceComponents {
	return &workflow.ServiceComponents{
		IDGen:                    b.infra.IDGenSVC,
		DB:                       b.infra.DB,
		Cache:                    b.infra.CacheCli,
		Tos:                      b.infra.OSS,
		ImageX:                   b.infra.ImageXClient,
		DatabaseDomainSVC:        memorySVC.DatabaseDomainSVC,
		VariablesDomainSVC:       memorySVC.VariablesDomainSVC,
		PluginDomainSVC:          pluginSVC.DomainSVC,
		KnowledgeDomainSVC:       knowledgeSVC.DomainSVC,
		DomainNotifier:           b.eventbus.resourceEventBus,
		CPStore:                  checkpoint.NewRedisStore(b.infra.CacheCli),
		CodeRunner:               b.infra.CodeRunner,
		WorkflowBuildInChatModel: b.infra.WorkflowBuildInChatModel,
	}
}

func (p *primaryServices) toSingleAgentServiceComponents() *singleagent.ServiceComponents {
	return &singleagent.ServiceComponents{
		IDGen:                p.basicServices.infra.IDGenSVC,
		DB:                   p.basicServices.infra.DB,
		Cache:                p.basicServices.infra.CacheCli,
		TosClient:            p.basicServices.infra.OSS,
		ImageX:               p.basicServices.infra.ImageXClient,
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
		TOS:                  infra.OSS,
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
		OSS:             infra.OSS,
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
		TosClient:            infra.OSS,
		ImageX:               infra.ImageXClient,
		SingleAgentDomainSVC: singleAgentSVC.DomainSVC,
	}
}
