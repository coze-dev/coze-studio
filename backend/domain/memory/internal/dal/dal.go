package dal

import (
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/memory/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type MemoryDAO struct {
	IDGen idgen.IDGenerator
}

func NewDAO(db *gorm.DB, generator idgen.IDGenerator) *MemoryDAO {
	query.Use(db)

	return &MemoryDAO{
		IDGen: generator,
	}
}
