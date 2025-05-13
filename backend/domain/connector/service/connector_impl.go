package connector

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/connector/entity"
)

type connectorImpl struct {
}

func NewService() Connector {
	return &connectorImpl{}
}

func (c *connectorImpl) List(ctx context.Context) ([]*entity.Connector, error) {

	return entity.ConnectorLists, nil
}

func (c *connectorImpl) GetByIDs(ctx context.Context, ids []int64) ([]*entity.Connector, error) {

	var connectorsMap map[int64]*entity.Connector

	for _, connector := range entity.ConnectorLists {
		connectorsMap[connector.ID] = connector
	}

	var cr []*entity.Connector
	for _, id := range ids {
		if connector, ok := connectorsMap[id]; ok {
			cr = append(cr, connector)
		}
	}
	return cr, nil
}
