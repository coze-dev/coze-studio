package dal

import (
	"code.byted.org/flow/opencoze/backend/domain/prompt/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"gorm.io/gorm"
)

type PromptDAO struct {
	IDGen idgen.IDGenerator
}

func NewPromptDAO(db *gorm.DB, generator idgen.IDGenerator) *PromptDAO {
	query.Use(db)

	return &PromptDAO{
		IDGen: generator,
	}
}
