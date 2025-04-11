package dal

import (
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

func NewSingleAgentDAO(db *gorm.DB, idGen idgen.IDGenerator) *SingleAgentDraftDAO {
	return &SingleAgentDraftDAO{
		IDGen:   idGen,
		dbQuery: query.Use(db),
	}
}

func NewSingleAgentVersion(db *gorm.DB, idGen idgen.IDGenerator) *SingleAgentVersionDAO {
	return &SingleAgentVersionDAO{
		IDGen:   idGen,
		dbQuery: query.Use(db),
	}
}
