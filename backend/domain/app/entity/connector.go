package entity

import (
	"code.byted.org/flow/opencoze/backend/types/consts"
)

var ConnectorIDWhiteList = []int64{
	consts.WebSDKConnectorID,
	consts.APIConnectorID,
}
