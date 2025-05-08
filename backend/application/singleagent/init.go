package singleagent

import (
	"fmt"

	singleagentCross "code.byted.org/flow/opencoze/backend/crossdomain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	variables "code.byted.org/flow/opencoze/backend/domain/memory/variables/service"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	"code.byted.org/flow/opencoze/backend/domain/permission"
	"code.byted.org/flow/opencoze/backend/domain/plugin"
	searchSVC "code.byted.org/flow/opencoze/backend/domain/search/service"
	"code.byted.org/flow/opencoze/backend/domain/user"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	idgenInterface "code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/impl/eventbus/rmq"
)

var (
	singleAgentDomainSVC singleagent.SingleAgent
	permissionDomainSVC  permission.Permission
	knowledgeDomainSVC   knowledge.Knowledge
	modelMgrDomainSVC    modelmgr.Manager
	pluginDomainSVC      plugin.PluginService
	workflowDomainSVC    workflow.Service
	userDomainSVC        user.User
	variablesDomainSVC   variables.Variables

	idGenSVC idgenInterface.IDGenerator
)

type (
	SingleAgent = singleagent.SingleAgent
	Components  = singleagent.Components
)

type ServiceComponents struct {
	*singleagent.Components
	PermissionDomainSVC permission.Permission
	KnowledgeDomainSVC  knowledge.Knowledge
	ModelMgrDomainSVC   modelmgr.Manager
	PluginDomainSVC     plugin.PluginService
	WorkflowDomainSVC   workflow.Service
	UserDomainSVC       user.User
	VariablesDomainSVC  variables.Variables
}

func InitService(c *ServiceComponents) (singleagent.SingleAgent, error) {
	idGenSVC = c.IDGen
	permissionDomainSVC = c.PermissionDomainSVC
	knowledgeDomainSVC = c.KnowledgeDomainSVC
	modelMgrDomainSVC = c.ModelMgrDomainSVC
	pluginDomainSVC = c.PluginDomainSVC
	workflowDomainSVC = c.WorkflowDomainSVC
	userDomainSVC = c.UserDomainSVC
	variablesDomainSVC = c.VariablesDomainSVC

	// init single agent domain service
	searchProducer, err := rmq.NewProducer("127.0.0.1:9876", "opencoze_search", "opencoze_search", 1)
	if err != nil {
		return nil, fmt.Errorf("init search producer failed, err=%w", err)
	}

	domainNotifier, err := searchSVC.NewDomainNotifier(&searchSVC.DomainNotifierConfig{
		Producer: searchProducer,
	})
	if err != nil {
		return nil, err
	}

	c.DomainNotifierSvr = domainNotifier
	c.PluginSvr = singleagentCross.NewPlugin()
	singleAgentDomainSVC = singleagent.NewService(c.Components)

	return singleAgentDomainSVC, nil
}
