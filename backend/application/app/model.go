package app

import (
	"code.byted.org/flow/opencoze/backend/api/model/resource/common"
)

type copyMetaInfo struct {
	scene common.ResourceCopyScene

	userID     int64
	appSpaceID int64
	copyTaskID string

	fromAppID int64
	toAppID   *int64
}
