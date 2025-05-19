package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

var PublishConnectorIDWhiteList = map[int64]bool{
	consts.WebSDKConnectorID:     true,
	consts.AgentAsAPIConnectorID: true,
}

type PublishConnectorData struct {
	PublishConnectorList  []*developer_api.PublishConnectorInfo
	SubmitBotMarketOption *developer_api.SubmitBotMarketOption
	LastSubmitConfig      *developer_api.SubmitBotMarketConfig
	ConnectorBrandInfoMap map[int64]*developer_api.ConnectorBrandInfo
	PublishTips           *developer_api.PublishTips
}
