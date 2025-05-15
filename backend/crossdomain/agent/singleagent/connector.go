package singleagent

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/connector/entity"
	connector "code.byted.org/flow/opencoze/backend/domain/connector/service"
)

type ConnectorImpl struct {
	svc connector.Connector
}

func NewConnector(c connector.Connector) *ConnectorImpl {
	return &ConnectorImpl{
		svc: c,
	}
}

func (c *ConnectorImpl) GetByIDs(ctx context.Context, ids []int64) (map[int64]*crossdomain.ConnectorEntity, error) {
	dos, err := c.svc.GetByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}

	result := make(map[int64]*crossdomain.ConnectorEntity, len(dos))
	for _, do := range dos {
		result[do.ID] = connectorToCrossEntity(do)
	}

	return result, nil
}

func connectorToCrossEntity(c *entity.Connector) *crossdomain.ConnectorEntity {
	return &crossdomain.ConnectorEntity{
		ID:   c.ID,
		Name: c.Name,
		URI:  c.URI,
		URL:  c.URL,
		Desc: c.Desc,
	}
}
