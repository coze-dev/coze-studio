package entity

type Connector struct {
	ID              int64  `json:"id"`
	Name            string `json:"name"`
	Icon            string `json:"icon"`
	Desc            string `json:"description"`
	ConnectorStatus int32  `json:"connector_status"`
}
