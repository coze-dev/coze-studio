package domain

import (
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"gorm.io/gorm"
)

type InfraClients struct {
	DB    *gorm.DB
	IDGen idgen.IDGenerator
}
