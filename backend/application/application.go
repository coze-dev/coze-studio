package application

import (
	"context"
	"fmt"

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
	"code.byted.org/flow/opencoze/backend/application/singleagent"
	"code.byted.org/flow/opencoze/backend/application/user"
	"code.byted.org/flow/opencoze/backend/application/workflow"
)

type eventbusImpl struct {
	resourceEventbus search.ResourceEventbus
	appEventbus      search.AppEventbus
}

type basicServices struct {
	infra        *appinfra.AppDependencies
	eventbus     *eventbusImpl
	modelMgrSVC  *modelmgr.ModelmgrApplicationService
	connectorSVC *connector.ConnectorApplicationService
	userSVC      *user.UserApplicationService
	promptSVC    *prompt.PromptApplicationService
}

type primaryServices struct {
	basicServices *basicServices
	pluginSVC     *plugin.PluginApplicationService
	memorySVC     *memory.MemoryApplicationServices
	knowledgeSVC  *knowledge.KnowledgeApplicationService
	workflowSVC   *workflow.WorkflowApplicationService
}

type vitalServices struct {
	primaryServices *primaryServices
	singleAgentSVC  *singleagent.SingleAgentApplicationService
}

// 本文件只引用 application/xxxx ，不要直接引用 domain service
// domain service 初始化放到 application/xxxx/init.go 中
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

	_, err = initVitalServices(ctx, primaryServices)
	if err != nil {
		return fmt.Errorf("Init - initVitalServices failed, err: %v", err)
	}

	return nil
}

func initEventBus(infra *appinfra.AppDependencies) *eventbusImpl {
	e := &eventbusImpl{}
	e.resourceEventbus = search.NewResourceEventbus(infra.ResourceEventProducer)
	e.appEventbus = search.NewAppEventbus(infra.AppEventProducer)

	return e
}

func initBasicServices(ctx context.Context, infra *appinfra.AppDependencies, e *eventbusImpl) (*basicServices, error) {
	// 初始化无依赖的简单服务
	icon.InitService(infra.TOSClient)
	openapiauth.InitService(infra.DB, infra.IDGenSVC)
	promptSVC := prompt.InitService(infra.DB, infra.IDGenSVC, e.resourceEventbus)

	// 初始化有返回值的服务
	modelMgrSVC := modelmgr.InitService(infra.DB, infra.IDGenSVC)
	connectorSVC := connector.InitService(infra.TOSClient)
	userSVC := user.InitService(ctx, infra.DB, infra.TOSClient, infra.IDGenSVC)

	return &basicServices{
		infra:        infra,
		eventbus:     e,
		modelMgrSVC:  modelMgrSVC,
		connectorSVC: connectorSVC,
		userSVC:      userSVC,
		promptSVC:    promptSVC,
	}, nil
}

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

	return &primaryServices{
		basicServices: basicServices,
		pluginSVC:     pluginSVC,
		memorySVC:     memorySVC,
		knowledgeSVC:  knowledgeSVC,
		workflowSVC:   workflowDomainSVC,
	}, nil
}

func initVitalServices(ctx context.Context, p *primaryServices) (*vitalServices, error) {
	singleAgentSVC, err := singleagent.InitService(p.toSingleAgentServiceComponents())
	if err != nil {
		return nil, err
	}

	infra := p.basicServices.infra
	err = search.InitService(ctx, p.toSearchServiceComponents(singleAgentSVC))
	if err != nil {
		return nil, err
	}

	conversation.InitService(infra.DB, infra.IDGenSVC, infra.TOSClient, infra.ImageXClient,
		singleAgentSVC.DomainSVC)

	return &vitalServices{
		primaryServices: p,
	}, nil
}

func (b *basicServices) toPluginServiceComponents() *plugin.ServiceComponents {
	return &plugin.ServiceComponents{
		IDGen:    b.infra.IDGenSVC,
		DB:       b.infra.DB,
		Eventbus: b.eventbus.resourceEventbus,
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
		Eventbus: b.eventbus.resourceEventbus,
	}
}

func (b *basicServices) toMemoryServiceComponents() *memory.ServiceComponents {
	return &memory.ServiceComponents{
		IDGen:                  b.infra.IDGenSVC,
		DB:                     b.infra.DB,
		Eventbus:               b.eventbus.resourceEventbus,
		TosClient:              b.infra.TOSClient,
		ResourceDomainNotifier: b.eventbus.resourceEventbus,
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
		DomainNotifier:     b.eventbus.resourceEventbus,
	}
}

func (p *primaryServices) toSingleAgentServiceComponents() *singleagent.ServiceComponents {
	return &singleagent.ServiceComponents{
		IDGen:              p.basicServices.infra.IDGenSVC,
		DB:                 p.basicServices.infra.DB,
		Cache:              p.basicServices.infra.CacheCli,
		TosClient:          p.basicServices.infra.TOSClient,
		ImageX:             p.basicServices.infra.ImageXClient,
		ModelMgrDomainSVC:  p.basicServices.modelMgrSVC.DomainSVC,
		UserDomainSVC:      p.basicServices.userSVC.DomainSVC,
		Eventbus:           p.basicServices.eventbus.appEventbus,
		Connector:          p.basicServices.connectorSVC.DomainSVC,
		KnowledgeDomainSVC: p.knowledgeSVC.DomainSVC,
		PluginDomainSVC:    p.pluginSVC.DomainSVC,
		WorkflowDomainSVC:  p.workflowSVC.DomainSVC,
		VariablesDomainSVC: p.memorySVC.VariablesDomainSVC,
		DatabaseDomainSVC:  p.memorySVC.DatabaseDomainSVC,
	}
}

func (p *primaryServices) toSearchServiceComponents(singleAgentSVC *singleagent.SingleAgentApplicationService) *search.ServiceComponents {
	infra := p.basicServices.infra

	return &search.ServiceComponents{
		DB:                   infra.DB,
		Cache:                infra.CacheCli,
		TOS:                  infra.TOSClient,
		ESClient:             infra.ESClient,
		SingleAgentDomainSVC: singleAgentSVC.DomainSVC,
		KnowledgeDomainSVC:   p.knowledgeSVC.DomainSVC,
		PluginDomainSVC:      p.pluginSVC.DomainSVC,
		WorkflowDomainSVC:    p.workflowSVC.DomainSVC,
		UserDomainSVC:        p.basicServices.userSVC.DomainSVC,
		ConnectorDomainSVC:   p.basicServices.connectorSVC.DomainSVC,
		PromptDomainSVC:      p.basicServices.promptSVC.DomainSVC,
		DatabaseDomainSVC:    p.memorySVC.DatabaseDomainSVC,
	}
}
