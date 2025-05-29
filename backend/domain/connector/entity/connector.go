package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/connector"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
)

// Use composition instead of aliasing for domain entities to enhance extensibility
type Connector struct {
	*connector.Connector
}

func (c *Connector) ToVO() *developer_api.ConnectorInfo {
	return &developer_api.ConnectorInfo{
		ID:              conv.Int64ToStr(c.ID),
		Name:            c.Name,
		Icon:            c.URL,
		ConnectorStatus: c.ConnectorStatus,
	}
}
