package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/intelligence"
	appCommon "code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	resCommon "code.byted.org/flow/opencoze/backend/api/model/resource/common"
)

type SearchAppsRequest struct {
	SpaceID  int64
	OwnerID  int64
	Name     string
	Status   []appCommon.IntelligenceStatus
	AppTypes []appCommon.IntelligenceType

	IsPublished    bool
	IsFav          bool
	IsRecentlyOpen bool
	OrderBy        intelligence.OrderBy
	Order          appCommon.OrderByType

	Cursor string
	Limit  int
}

type SearchAppsResponse struct {
	HasMore    bool
	NextCursor string

	Data []*AppDocument
}

type AppDocument struct {
	ID           int64                        `json:"id"`
	Name         string                       `json:"name"`
	Desc         string                       `json:"desc"`
	SpaceID      int64                        `json:"space_id"`
	OwnerID      int64                        `json:"owner_id"`
	AppType      appCommon.IntelligenceType   `json:"app_type"`
	Status       appCommon.IntelligenceStatus `json:"status"`
	HasPublished int                          `json:"has_published"`
	CreateTime   int64                        `json:"create_time"`
	UpdateTime   int64                        `json:"update_time"`
	PublishTime  int64                        `json:"publish_time"`
}

type SearchResourcesRequest struct {
	SpaceID             int64
	OwnerID             int64
	Name                string
	ResTypeFilter       []resCommon.ResType
	PublishStatusFilter resCommon.PublishStatus
	SearchKeys          []string

	Cursor string
	Limit  int32
}

type SearchResourcesResponse struct {
	HasMore    bool
	NextCursor string

	Data []*ResourceDocument
}

type ResourceDocument struct {
	ResType       resCommon.ResType       `json:"res_type"`
	ResID         int64                   `json:"res_id"`
	ResSubType    int                     `json:"res_sub_type"`
	Name          string                  `json:"name"`
	OwnerID       int64                   `json:"owner_id"`
	SpaceID       int64                   `json:"space_id"`
	BizStatus     int64                   `json:"biz_status"`
	PublishStatus resCommon.PublishStatus `json:"has_published"`
	CreateTime    int64                   `json:"create_time"`
	UpdateTime    int64                   `json:"update_time"`
	PublishTime   int64                   `json:"publish_time"`
}
