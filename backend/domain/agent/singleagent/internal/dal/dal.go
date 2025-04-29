package dal

import (
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

func NewSingleAgentDraftDAO(db *gorm.DB, idGen idgen.IDGenerator, cli *redis.Client) *SingleAgentDraftDAO {
	return &SingleAgentDraftDAO{
		idGen:       idGen,
		dbQuery:     query.Use(db),
		cacheClient: cli,
	}
}

func NewSingleAgentVersion(db *gorm.DB, idGen idgen.IDGenerator) *SingleAgentVersionDAO {
	return &SingleAgentVersionDAO{
		IDGen:   idGen,
		dbQuery: query.Use(db),
	}
}
