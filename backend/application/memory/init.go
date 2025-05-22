package memory

import (
	"gorm.io/gorm"

	"github.com/redis/go-redis/v9"

	"code.byted.org/flow/opencoze/backend/domain/memory/database"
	databaseSVC "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
	rdbService "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/service"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/repository"
	variables "code.byted.org/flow/opencoze/backend/domain/memory/variables/service"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

type MemoryApplicationServices struct {
	VariablesDomainSVC variables.Variables
	DatabaseDomainSVC  database.Database
	RDBDomainSVC       rdb.RDB
}

type ServiceComponents struct {
	IDGen                  idgen.IDGenerator
	DB                     *gorm.DB
	Eventbus               search.ResourceEventbus
	TosClient              storage.Storage
	ResourceDomainNotifier search.ResourceEventbus
	CacheCli               *redis.Client
}

func InitService(c *ServiceComponents) *MemoryApplicationServices {
	repo := repository.NewVariableRepo(c.DB, c.IDGen)
	variablesDomainSVC := variables.NewService(repo)
	rdbService := rdbService.NewService(c.DB, c.IDGen)
	databaseDomainSVC := databaseSVC.NewService(rdbService, c.DB, c.IDGen, c.TosClient, c.ResourceDomainNotifier, c.CacheCli)

	VariableApplicationSVC.DomainSVC = variablesDomainSVC
	DatabaseApplicationSVC.DomainSVC = databaseDomainSVC

	return &MemoryApplicationServices{
		VariablesDomainSVC: variablesDomainSVC,
		DatabaseDomainSVC:  databaseDomainSVC,
		RDBDomainSVC:       rdbService,
	}
}
