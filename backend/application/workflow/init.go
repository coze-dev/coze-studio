package workflow

import (
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	wfdatabase "code.byted.org/flow/opencoze/backend/crossdomain/workflow/database"
	wfknowledge "code.byted.org/flow/opencoze/backend/crossdomain/workflow/knowledge"
	wfmodel "code.byted.org/flow/opencoze/backend/crossdomain/workflow/model"
	wfplugin "code.byted.org/flow/opencoze/backend/crossdomain/workflow/plugin"
	wfsearch "code.byted.org/flow/opencoze/backend/crossdomain/workflow/search"
	"code.byted.org/flow/opencoze/backend/crossdomain/workflow/variable"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/memory/database"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	crosssearch "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/search"

	variables "code.byted.org/flow/opencoze/backend/domain/memory/variables/service"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	service2 "code.byted.org/flow/opencoze/backend/domain/plugin/service"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	crosscode "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/code"
	crossdatabase "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	crossknowledge "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge"
	crossmodel "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	crossplugin "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/plugin"
	crossvariable "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/impl/coderunner"
)

type ServiceComponents struct {
	IDGen              idgen.IDGenerator
	DB                 *gorm.DB
	Cache              *redis.Client
	DatabaseDomainSVC  database.Database
	VariablesDomainSVC variables.Variables
	PluginDomainSVC    service2.PluginService
	KnowledgeDomainSVC knowledge.Knowledge
	ModelManager       modelmgr.Manager
	DomainNotifier     search.ResourceEventbus
}

func InitService(components *ServiceComponents) *WorkflowApplicationService {
	workflowRepo := service.NewWorkflowRepository(components.IDGen, components.DB, components.Cache)
	workflow.SetRepository(workflowRepo)
	workflowDomainSVC := service.NewWorkflowService(workflowRepo)
	crossdatabase.SetDatabaseOperator(wfdatabase.NewDatabaseRepository(components.DatabaseDomainSVC))
	crossvariable.SetVariableHandler(variable.NewVariableHandler(components.VariablesDomainSVC))
	crossvariable.SetVariablesMetaGetter(variable.NewVariablesMetaGetter(components.VariablesDomainSVC))
	crossplugin.SetPluginRunner(wfplugin.NewPluginRunner(components.PluginDomainSVC))
	crossknowledge.SetKnowledgeOperator(wfknowledge.NewKnowledgeRepository(components.KnowledgeDomainSVC))
	crossmodel.SetManager(wfmodel.NewModelManager(components.ModelManager, nil))
	crosscode.SetCodeRunner(coderunner.NewRunner())
	crosssearch.SetNotifier(wfsearch.NewNotify(components.DomainNotifier))

	WorkflowSVC.DomainSVC = workflowDomainSVC

	return WorkflowSVC
}
