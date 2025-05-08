package singleagent

import (
	singleagentCross "code.byted.org/flow/opencoze/backend/crossdomain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	"code.byted.org/flow/opencoze/backend/domain/permission"
	"code.byted.org/flow/opencoze/backend/domain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/search"
	"code.byted.org/flow/opencoze/backend/domain/user"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	idgenInterface "code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

var (
	singleAgentDomainSVC singleagent.SingleAgent
	permissionDomainSVC  permission.Permission
	knowledgeDomainSVC   knowledge.Knowledge
	modelMgrDomainSVC    modelmgr.Manager
	pluginDomainSVC      plugin.PluginService
	workflowDomainSVC    workflow.Service
	userDomainSVC        user.User
	idGenSVC             idgenInterface.IDGenerator
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
	DomainNotifier      search.DomainNotifier
}

func InitService(c *ServiceComponents) (singleagent.SingleAgent, error) {
	idGenSVC = c.IDGen
	permissionDomainSVC = c.PermissionDomainSVC
	knowledgeDomainSVC = c.KnowledgeDomainSVC
	modelMgrDomainSVC = c.ModelMgrDomainSVC
	pluginDomainSVC = c.PluginDomainSVC
	workflowDomainSVC = c.WorkflowDomainSVC
	userDomainSVC = c.UserDomainSVC

	c.PluginSvr = singleagentCross.NewPlugin()
	singleAgentDomainSVC = singleagent.NewService(c.Components)

	return singleAgentDomainSVC, nil
}
