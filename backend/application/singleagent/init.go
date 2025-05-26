package singleagent

import (
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	singleagentCross "code.byted.org/flow/opencoze/backend/crossdomain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/repository"
	singleagent "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/service"
	connector "code.byted.org/flow/opencoze/backend/domain/connector/service"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	service2 "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
	variables "code.byted.org/flow/opencoze/backend/domain/memory/variables/service"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	user "code.byted.org/flow/opencoze/backend/domain/user/service"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/infra/impl/chatmodel"
	"code.byted.org/flow/opencoze/backend/pkg/jsoner"
)

type (
	SingleAgent = singleagent.SingleAgent
	Components  = singleagent.Components
)

var SingleAgentSVC *SingleAgentApplicationService

type ServiceComponents struct {
	IDGen       idgen.IDGenerator
	DB          *gorm.DB
	Cache       *redis.Client
	TosClient   storage.Storage
	ImageX      imagex.ImageX
	CounterRepo repository.CounterRepository

	KnowledgeDomainSVC knowledge.Knowledge
	ModelMgrDomainSVC  modelmgr.Manager
	PluginDomainSVC    service.PluginService
	WorkflowDomainSVC  workflow.Service
	UserDomainSVC      user.User
	VariablesDomainSVC variables.Variables
	EventBus           search.AppProjectEventBus
	Connector          connector.Connector
	DatabaseDomainSVC  service2.Database
}

func InitService(c *ServiceComponents) (*SingleAgentApplicationService, error) {
	domainComponents := &singleagent.Components{
		AgentDraftRepo:   repository.NewSingleAgentRepo(c.DB, c.IDGen, c.Cache),
		AgentVersionRepo: repository.NewSingleAgentVersionRepo(c.DB, c.IDGen),
		PublishInfoRepo:  jsoner.New[entity.PublishInfo]("agent:publish:last:", c.Cache),
		CounterRepo:      repository.NewCounterRepo(c.Cache),

		PluginSvr:    singleagentCross.NewPlugin(c.PluginDomainSVC),
		KnowledgeSvr: singleagentCross.NewKnowledge(c.KnowledgeDomainSVC),
		WorkflowSvr:  singleagentCross.NewWorkflow(c.WorkflowDomainSVC),
		// VariablesSvr:      singleagentCross.NewVariables(),
		ModelMgrSvr:  singleagentCross.NewModelManager(&singleagentCross.ModelManagerConfig{ModelMgrSVC: c.ModelMgrDomainSVC}),
		ModelFactory: chatmodel.NewDefaultFactory(nil),
		Connector:    singleagentCross.NewConnector(c.Connector),
		DatabaseSvr:  singleagentCross.NewDatabase(c.DatabaseDomainSVC),
	}

	singleAgentDomainSVC := singleagent.NewService(domainComponents)
	SingleAgentSVC = newApplicationService(c, singleAgentDomainSVC)

	return SingleAgentSVC, nil
}
