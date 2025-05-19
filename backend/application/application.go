package application

import (
	"context"

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

// 本文件只引用 application/xxxx ，不要直接引用 domain service
// domain service 初始化放到 application/xxxx/init.go 中
func Init(ctx context.Context) (err error) {
	infra, err := appinfra.Init(ctx)
	if err != nil {
		return err
	}

	icon.InitService(infra.TOSClient)
	openapiauth.InitService(infra.DB, infra.IDGenSVC)
	prompt.InitService(infra.DB, infra.IDGenSVC)
	modelMgrSVC := modelmgr.InitService(infra.DB, infra.IDGenSVC)
	connectorSVC := connector.InitService(infra.TOSClient)
	resourceEventbus := search.NewResourceEventbus(infra.ResourceEventProducer)

	pluginDomainSVC, err := plugin.InitService(ctx, &plugin.ServiceComponents{
		IDGen:    infra.IDGenSVC,
		DB:       infra.DB,
		Eventbus: resourceEventbus,
	})
	if err != nil {
		return err
	}

	memoryServices := memory.InitService(infra.DB, infra.IDGenSVC, infra.TOSClient, resourceEventbus)

	knowledgeDomainSVC, err := knowledge.InitService(&knowledge.ServiceComponents{
		DB:       infra.DB,
		IDGenSVC: infra.IDGenSVC,
		Storage:  infra.TOSClient,
		RDB:      memoryServices.RDBService,
		ImageX:   infra.ImageXClient,
		ES:       infra.ESClient,
		Eventbus: resourceEventbus,
	})
	if err != nil {
		return err
	}

	userSVC := user.InitService(ctx, infra.DB, infra.TOSClient, infra.IDGenSVC)

	workflowDomainSVC := workflow.InitService(workflow.ServiceComponents{
		IDGen:              infra.IDGenSVC,
		DB:                 infra.DB,
		Cache:              infra.CacheCli,
		DatabaseDomainSVC:  memoryServices.DatabaseService,
		VariablesDomainSVC: memoryServices.VariablesService,
		PluginDomainSVC:    pluginDomainSVC,
		KnowledgeDomainSVC: knowledgeDomainSVC,
		ModelManager:       modelMgrSVC.DomainSVC,
		DomainNotifier:     resourceEventbus,
	})

	appEventbus := search.NewAppEventbus(infra.AppEventProducer)
	singleAgentDomainSVC, err := singleagent.InitService(&singleagent.ServiceComponents{
		IDGen:              infra.IDGenSVC,
		DB:                 infra.DB,
		Cache:              infra.CacheCli,
		TosClient:          infra.TOSClient,
		ImageX:             infra.ImageXClient,
		KnowledgeDomainSVC: knowledgeDomainSVC,
		ModelMgrDomainSVC:  modelMgrSVC.DomainSVC,
		PluginDomainSVC:    pluginDomainSVC,
		WorkflowDomainSVC:  workflowDomainSVC,
		UserDomainSVC:      userSVC.DomainSVC,
		Eventbus:           appEventbus,
		VariablesDomainSVC: memoryServices.VariablesService,
		Connector:          connectorSVC.DomainSVC,
		DatabaseDomainSVC:  memoryServices.DatabaseService,
	})
	if err != nil {
		return err
	}

	err = search.InitService(ctx, infra.TOSClient, infra.ESClient, singleAgentDomainSVC)
	if err != nil {
		return err
	}

	conversation.InitService(infra.DB, infra.IDGenSVC, infra.TOSClient, infra.ImageXClient,
		singleAgentDomainSVC)

	return nil
}
