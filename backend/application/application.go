package application

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/application/template"

	"code.byted.org/flow/opencoze/backend/application/app"
	"code.byted.org/flow/opencoze/backend/application/base/appinfra"
	"code.byted.org/flow/opencoze/backend/application/connector"
	"code.byted.org/flow/opencoze/backend/application/conversation"
	"code.byted.org/flow/opencoze/backend/application/icon"
	"code.byted.org/flow/opencoze/backend/application/knowledge"
	"code.byted.org/flow/opencoze/backend/application/memory"
	"code.byted.org/flow/opencoze/backend/application/modelmgr"
	"code.byted.org/flow/opencoze/backend/application/openapiauth"
	"code.byted.org/flow/opencoze/backend/application/plugin"
	"code.byted.org/flow/opencoze/backend/application/prompt"
	"code.byted.org/flow/opencoze/backend/application/search"
	"code.byted.org/flow/opencoze/backend/application/shortcutcmd"
	"code.byted.org/flow/opencoze/backend/application/singleagent"
	"code.byted.org/flow/opencoze/backend/application/user"
	"code.byted.org/flow/opencoze/backend/application/workflow"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossagent"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossagentrun"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossconnector"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossconversation"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossdatabase"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossdatacopy"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossknowledge"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossmessage"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossmodelmgr"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossplugin"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossuser"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossvariables"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossworkflow"
	agentrunImpl "code.byted.org/flow/opencoze/backend/crossdomain/impl/agentrun"
	connectorImpl "code.byted.org/flow/opencoze/backend/crossdomain/impl/connector"
	conversationImpl "code.byted.org/flow/opencoze/backend/crossdomain/impl/conversation"
	crossuserImpl "code.byted.org/flow/opencoze/backend/crossdomain/impl/crossuser"
	databaseImpl "code.byted.org/flow/opencoze/backend/crossdomain/impl/database"
	dataCopyImpl "code.byted.org/flow/opencoze/backend/crossdomain/impl/datacopy"
	knowledgeImpl "code.byted.org/flow/opencoze/backend/crossdomain/impl/knowledge"
	messageImpl "code.byted.org/flow/opencoze/backend/crossdomain/impl/message"
	modelmgrImpl "code.byted.org/flow/opencoze/backend/crossdomain/impl/modelmgr"
	pluginImpl "code.byted.org/flow/opencoze/backend/crossdomain/impl/plugin"
	singleagentImpl "code.byted.org/flow/opencoze/backend/crossdomain/impl/singleagent"
	variablesImpl "code.byted.org/flow/opencoze/backend/crossdomain/impl/variables"
	workflowImpl "code.byted.org/flow/opencoze/backend/crossdomain/impl/workflow"
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
}

type primaryServices struct {
	basicServices *basicServices
	pluginSVC     *plugin.PluginApplicationService
	memorySVC     *memory.MemoryApplicationServices
	knowledgeSVC  *knowledge.KnowledgeApplicationService
	workflowSVC   *workflow.ApplicationService
	shortcutSVC   *shortcutcmd.ShortcutCmdApplicationService
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
	icon.InitService(infra.TOSClient)
	openapiauth.InitService(infra.DB, infra.IDGenSVC)
	promptSVC := prompt.InitService(infra.DB, infra.IDGenSVC, e.resourceEventBus)

	modelMgrSVC := modelmgr.InitService(infra.DB, infra.IDGenSVC, infra.TOSClient)
	connectorSVC := connector.InitService(infra.TOSClient)
	userSVC := user.InitService(ctx, infra.DB, infra.TOSClient, infra.IDGenSVC)
	templateSVC := template.InitService(ctx, &template.ServiceComponents{
		DB:    infra.DB,
		IDGen: infra.IDGenSVC,
	})

	return &basicServices{
		infra:        infra,
		eventbus:     e,
		modelMgrSVC:  modelMgrSVC,
		connectorSVC: connectorSVC,
		userSVC:      userSVC,
		promptSVC:    promptSVC,
		templateSVC:  templateSVC,
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
		ModelManager:       b.modelMgrSVC.DomainSVC,
		DomainNotifier:     b.eventbus.resourceEventBus,
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
		ConnectorDomainSVC:   p.basicServices.connectorSVC.DomainSVC,
		KnowledgeDomainSVC:   p.knowledgeSVC.DomainSVC,
		PluginDomainSVC:      p.pluginSVC.DomainSVC,
		WorkflowDomainSVC:    p.workflowSVC.DomainSVC,
		VariablesDomainSVC:   p.memorySVC.VariablesDomainSVC,
		ShortcutCMDDomainSVC: p.shortcutSVC.ShortCutDomainSVC,
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
		ProjectEventBus: basic.eventbus.projectEventBus,
		UserSVC:         basic.userSVC.DomainSVC,
		ConnectorSVC:    basic.connectorSVC.DomainSVC,
		WorkflowSVC:     p.workflowSVC.DomainSVC,
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
