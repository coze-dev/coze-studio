package search

import (
	resource "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
)

type SearchResourcesRequest struct {
	SpaceID int64
	OwnerID int64
	Name    string
	APPID   int64

	OrderFiledName      string
	OrderAsc            bool
	ResTypeFilter       []resource.ResType
	PublishStatusFilter resource.PublishStatus
	SearchKeys          []string

	Cursor string
	Page   *int32
	Limit  int32
}

type SearchResourcesResponse struct {
	HasMore    bool
	NextCursor string
	TotalHits  *int64

	Data []*ResourceDocument
}

const (
	FieldOfCreateTime       = "create_time"
	FieldOfUpdateTime       = "update_time"
	FieldOfPublishTime      = "publish_time"
	FieldOfFavTime          = "fav_time"
	FieldOfRecentlyOpenTime = "recently_open_time"
)
