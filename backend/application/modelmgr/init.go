package modelmgr

import (
	"gorm.io/gorm"

	modelmgr "code.byted.org/flow/opencoze/backend/domain/modelmgr/service"
	"code.byted.org/flow/opencoze/backend/infra/impl/idgen"
)

func InitService(db *gorm.DB, idgen idgen.IDGenerator) *ModelmgrApplicationService {
	ModelmgrApplicationSVC.DomainSVC = modelmgr.NewModelManager(db, idgen)

	return &ModelmgrApplicationSVC
}
