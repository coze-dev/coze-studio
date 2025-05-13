package singleagent

import (
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	singleagentCross "code.byted.org/flow/opencoze/backend/crossdomain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/repository"
	singleagent "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/service"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	variables "code.byted.org/flow/opencoze/backend/domain/memory/variables/service"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	"code.byted.org/flow/opencoze/backend/domain/permission"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	"code.byted.org/flow/opencoze/backend/domain/search"
	"code.byted.org/flow/opencoze/backend/domain/user"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

type (
	SingleAgent = singleagent.SingleAgent
	Components  = singleagent.Components
)

var SingleAgentSVC SingleAgentApplicationService

type ServiceComponents struct {
	IDGen     idgen.IDGenerator
	DB        *gorm.DB
	Cache     *redis.Client
	TosClient storage.Storage
	ImageX    imagex.ImageX

	PermissionDomainSVC permission.Permission
	KnowledgeDomainSVC  knowledge.Knowledge
	ModelMgrDomainSVC   modelmgr.Manager
	PluginDomainSVC     service.PluginService
	WorkflowDomainSVC   workflow.Service
	UserDomainSVC       user.User
	VariablesDomainSVC  variables.Variables
	DomainNotifier      search.AppDomainNotifier
}

func InitService(c *ServiceComponents) (singleagent.SingleAgent, error) {
	domainComponents := &singleagent.Components{
		AgentDraftRepo:   repository.NewSingleAgentRepo(c.DB, c.IDGen, c.Cache),
		AgentVersionRepo: repository.NewSingleAgentVersionRepo(c.DB, c.IDGen),
		PluginSvr:        singleagentCross.NewPlugin(c.PluginDomainSVC),
		// KnowledgeSvr:      singleagentCross.NewKnowledge(),
		// WorkflowSvr:       singleagentCross.NewWorkflow(),
		// VariablesSvr:      singleagentCross.NewVariables(),
		// ModelMgrSvr:       singleagentCross.NewModelMgr(),
		// ModelFactory:      singleagentCross.NewModelFactory(),
	}

	singleAgentDomainSVC := singleagent.NewService(domainComponents)
	SingleAgentSVC = newApplicationService(c, singleAgentDomainSVC)

	return singleAgentDomainSVC, nil
}
