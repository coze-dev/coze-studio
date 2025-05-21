package prompt

import (
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/application/search"
	"code.byted.org/flow/opencoze/backend/domain/prompt/repository"
	prompt "code.byted.org/flow/opencoze/backend/domain/prompt/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

func InitService(db *gorm.DB, idGenSVC idgen.IDGenerator, re search.ResourceEventbus) {
	repo := repository.NewPromptRepo(db, idGenSVC)
	PromptSVC.DomainSVC = prompt.NewService(repo)
	PromptSVC.eventbus = re
}
