package connector

import (
	"gorm.io/gorm"

	connector "code.byted.org/flow/opencoze/backend/domain/connector/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

var (
	connectorDomainSVC connector.Connector
)

func InitService(db *gorm.DB, idGenSVC idgen.IDGenerator) {
	connectorDomainSVC = connector.NewService()
}
