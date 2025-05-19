package memory

import (
	database "code.byted.org/flow/opencoze/backend/domain/memory/database"
	databaseSVC "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
	rdbService "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/service"
	"code.byted.org/flow/opencoze/backend/domain/search"

	"code.byted.org/flow/opencoze/backend/domain/memory/variables/repository"
	variables "code.byted.org/flow/opencoze/backend/domain/memory/variables/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"

	"gorm.io/gorm"
)

var (
	variablesDomainSVC variables.Variables
	databaseDomainSVC  database.Database
)

type MemoryServices struct {
	VariablesService variables.Variables
	DatabaseService  database.Database
	RDBService       rdb.RDB
}

func InitService(db *gorm.DB, idGenSVC idgen.IDGenerator, tosClient storage.Storage, resourceDomainNotifier search.ResourceEventbus) *MemoryServices {
	repo := repository.NewVariableRepo(db, idGenSVC)
	variablesDomainSVC = variables.NewService(repo)
	rdbService := rdbService.NewService(db, idGenSVC)
	databaseDomainSVC = databaseSVC.NewService(rdbService, db, idGenSVC, tosClient, resourceDomainNotifier)

	return &MemoryServices{
		VariablesService: variablesDomainSVC,
		DatabaseService:  databaseDomainSVC,
		RDBService:       rdbService,
	}
}
