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
	knowledge "code.byted.org/flow/opencoze/backend/domain/knowledge/service"
	dbservice "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
	variables "code.byted.org/flow/opencoze/backend/domain/memory/variables/service"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	plugin "code.byted.org/flow/opencoze/backend/domain/plugin/service"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
	crosscode "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/code"
	crossdatabase "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	crossknowledge "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge"
	crossmodel "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	crossplugin "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/plugin"
	crosssearch "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/search"
	crossvariable "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/infra/impl/coderunner"
)

type ServiceComponents struct {
	IDGen              idgen.IDGenerator
	DB                 *gorm.DB
	Cache              *redis.Client
	DatabaseDomainSVC  dbservice.Database
	VariablesDomainSVC variables.Variables
	PluginDomainSVC    plugin.PluginService
	KnowledgeDomainSVC knowledge.Knowledge
	ModelManager       modelmgr.Manager
	DomainNotifier     search.ResourceEventBus
	Tos                storage.Storage
	ImageX             imagex.ImageX
}

func InitService(components *ServiceComponents) *ApplicationService {
	workflowRepo := service.NewWorkflowRepository(components.IDGen, components.DB, components.Cache, components.Tos)
	workflow.SetRepository(workflowRepo)

	workflowDomainSVC := service.NewWorkflowService(workflowRepo)
	crossdatabase.SetDatabaseOperator(wfdatabase.NewDatabaseRepository(components.DatabaseDomainSVC))
	crossvariable.SetVariableHandler(variable.NewVariableHandler(components.VariablesDomainSVC))
	crossvariable.SetVariablesMetaGetter(variable.NewVariablesMetaGetter(components.VariablesDomainSVC))
	crossplugin.SetToolService(wfplugin.NewToolService(components.PluginDomainSVC, components.Tos))
	crossknowledge.SetKnowledgeOperator(wfknowledge.NewKnowledgeRepository(components.KnowledgeDomainSVC))
	crossmodel.SetManager(wfmodel.NewModelManager(components.ModelManager, nil))
	crosscode.SetCodeRunner(coderunner.NewRunner())
	crosssearch.SetNotifier(wfsearch.NewNotify(components.DomainNotifier))

	SVC.DomainSVC = workflowDomainSVC
	SVC.ImageX = components.ImageX

	return SVC
}
