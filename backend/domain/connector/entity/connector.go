package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
)

type Connector struct {
	ID              int64                                `json:"id"`
	Name            string                               `json:"name"`
	URI             string                               `json:"uri"`
	URL             string                               `json:"url"`
	Desc            string                               `json:"description"`
	ConnectorStatus developer_api.ConnectorDynamicStatus `json:"connector_status"`
}

func (c *Connector) ToVO() *developer_api.ConnectorInfo {
	return &developer_api.ConnectorInfo{
		ID:              conv.Int64ToStr(c.ID),
		Name:            c.Name,
		Icon:            c.URL,
		ConnectorStatus: c.ConnectorStatus,
	}
}
