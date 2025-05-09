package prompt

import (
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/permission"
	"code.byted.org/flow/opencoze/backend/domain/prompt"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

var (
	promptDomainSVC     prompt.Prompt
	permissionDomainSVC permission.Permission
)

func InitService(db *gorm.DB, idGenSVC idgen.IDGenerator, pSVC permission.Permission) {
	promptDomainSVC = prompt.NewService(db, idGenSVC)
	permissionDomainSVC = pSVC
}
