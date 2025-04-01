package dal

import (
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"gorm.io/gorm"
)

type SingleAgentDAO struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewSingleAgentDAO(db *gorm.DB, generator idgen.IDGenerator) *SingleAgentDAO {
	query.Use(db)

	return &SingleAgentDAO{
		IDGen: generator,
		DB:    db,
	}
}
