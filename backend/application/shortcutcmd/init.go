package shortcutcmd

import (
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/shortcutcmd/repository"
	"code.byted.org/flow/opencoze/backend/domain/shortcutcmd/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

var ShortcutCmdSVC *ShortcutCmdApplicationService

func InitService(db *gorm.DB, idGenSVC idgen.IDGenerator) *ShortcutCmdApplicationService {

	components := &service.Components{
		ShortCutCmdRepo: repository.NewShortCutCmdRepo(db, idGenSVC),
	}
	shortcutCmdDomainSVC := service.NewShortcutCommandService(components)

	ShortcutCmdSVC = &ShortcutCmdApplicationService{
		ShortCutDomainSVC: shortcutCmdDomainSVC,
	}
	return ShortcutCmdSVC
}
