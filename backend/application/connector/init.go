package connector

import (
	connector "code.byted.org/flow/opencoze/backend/domain/connector/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

func InitService(tos storage.Storage) connector.Connector {
	connectorDomainSVC := connector.NewService(tos)
	ConnectorApplicationSVC = New(connectorDomainSVC, tos)

	return connectorDomainSVC
}
