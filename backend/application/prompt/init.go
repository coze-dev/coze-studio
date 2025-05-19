package prompt

import (
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/prompt/repository"
	prompt "code.byted.org/flow/opencoze/backend/domain/prompt/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

var promptDomainSVC prompt.Prompt

func InitService(db *gorm.DB, idGenSVC idgen.IDGenerator) {
	repo := repository.NewPromptRepo(db, idGenSVC)
	promptDomainSVC = prompt.NewService(repo)
}
