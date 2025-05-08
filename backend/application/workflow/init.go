package workflow

import (
	wfdatabase "code.byted.org/flow/opencoze/backend/crossdomain/workflow/database"
	wfknowledge "code.byted.org/flow/opencoze/backend/crossdomain/workflow/knowledge"
	wfmodel "code.byted.org/flow/opencoze/backend/crossdomain/workflow/model"
	wfplugin "code.byted.org/flow/opencoze/backend/crossdomain/workflow/plugin"
	"code.byted.org/flow/opencoze/backend/crossdomain/workflow/variable"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/memory/database"
	variables "code.byted.org/flow/opencoze/backend/domain/memory/variables/service"
	"code.byted.org/flow/opencoze/backend/domain/modelmgr"
	"code.byted.org/flow/opencoze/backend/domain/plugin"
	crosscode "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/code"
	crossdatabase "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	crossknowledge "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge"
	crossmodel "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	crossplugin "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/plugin"
	crossvariable "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/infra/impl/coderunner"
)

func InjectService(
	databaseDomainSVC database.Database,
	variablesDomainSVC variables.Variables,
	pluginDomainSVC plugin.PluginService,
	knowledgeDomainSVC knowledge.Knowledge,
	manager modelmgr.Manager) {
	crossdatabase.SetDatabaseOperator(wfdatabase.NewDatabaseRepository(databaseDomainSVC))
	crossvariable.SetVariableHandler(variable.NewVariableHandler(variablesDomainSVC))
	crossplugin.SetPluginRunner(wfplugin.NewPluginRunner(pluginDomainSVC))
	crossknowledge.SetKnowledgeOperator(wfknowledge.NewKnowledgeRepository(knowledgeDomainSVC))
	crossmodel.SetManager(wfmodel.NewModelManager(manager, nil))
	crosscode.SetCodeRunner(coderunner.NewRunner())
}
