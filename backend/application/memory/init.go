package memory

import (
	database "code.byted.org/flow/opencoze/backend/domain/memory/database"
	databaseSVC "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
	rdb "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/service"
	variables "code.byted.org/flow/opencoze/backend/domain/memory/variables/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"

	"gorm.io/gorm"
)

var (
	variablesDomainSVC variables.Variables
	databaseDomainSVC  database.Database
)

func InjectService(db *gorm.DB, idGenSVC idgen.IDGenerator, tosClient storage.Storage) {
	variablesDomainSVC = variables.NewService(db, idGenSVC)
	rdbService := rdb.NewService(db, idGenSVC)
	databaseDomainSVC = databaseSVC.NewService(rdbService, db, idGenSVC, tosClient)
}
