package connector

import "github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/developer_api"

type Connector struct {
	ID              int64                                `json:"id"`
	Name            string                               `json:"name"`
	URI             string                               `json:"uri"`
	URL             string                               `json:"url"`
	Desc            string                               `json:"description"`
	ConnectorStatus developer_api.ConnectorDynamicStatus `json:"connector_status"`
}
