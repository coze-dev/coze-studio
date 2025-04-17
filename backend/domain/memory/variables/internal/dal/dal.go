package dal

import (
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/memory/variables/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type VariablesDAO struct {
	IDGen idgen.IDGenerator
}

func NewDAO(db *gorm.DB, generator idgen.IDGenerator) *VariablesDAO {
	query.Use(db)

	return &VariablesDAO{
		IDGen: generator,
	}
}
