package entity

import "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"

type ConnectorInfo struct {
	ID              string
	Name            string
	Icon            string
	ConnectorStatus int64 // 0: normal, 1: offline, 2: token disconnect
	ShareLink       *string
}

func (c *ConnectorInfo) ToVO() *developer_api.ConnectorInfo {
	return &developer_api.ConnectorInfo{
		ID:              c.ID,
		Name:            c.Name,
		Icon:            c.Icon,
		ConnectorStatus: developer_api.ConnectorDynamicStatus(c.ConnectorStatus),
		ShareLink:       c.ShareLink,
	}
}
