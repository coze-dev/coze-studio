package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	resource "code.byted.org/flow/opencoze/backend/api/model/resource/common"
)

const (
	FieldOfCreateTime       = "create_time"
	FieldOfUpdateTime       = "update_time"
	FieldOfPublishTime      = "publish_time"
	FieldOfFavTime          = "fav_time"
	FieldOfRecentlyOpenTime = "recently_open_time"

	// resource index fields
	FieldOfResType       = "res_type"
	FieldOfPublishStatus = "publish_status"
	FieldOfResSubType    = "res_sub_type"
	FieldOfBizStatus     = "biz_status"
	FieldOfScores        = "scores"
)

type SearchProjectsRequest struct {
	SpaceID   int64
	ProjectID int64
	OwnerID   int64
	Name      string
	Status    []common.IntelligenceStatus
	Types     []common.IntelligenceType

	IsPublished    bool
	IsFav          bool
	IsRecentlyOpen bool
	OrderFiledName string
	OrderAsc       bool

	Cursor string
	Limit  int32
}

type SearchProjectsResponse struct {
	HasMore    bool
	NextCursor string

	Data []*ProjectDocument
}

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
	Limit  int32
}

type SearchResourcesResponse struct {
	HasMore    bool
	NextCursor string

	Data []*ResourceDocument
}
