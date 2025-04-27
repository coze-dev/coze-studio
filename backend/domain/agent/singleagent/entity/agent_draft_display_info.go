package entity

import "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"

type AgentDraftDisplayInfo struct {
	AgentID     int64
	DisplayInfo *developer_api.DraftBotDisplayInfoData
	SpaceID     *string
}
