package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/intelligence"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	resource "code.byted.org/flow/opencoze/backend/api/model/resource/common"
)

type SearchAppsRequest struct {
	SpaceID int64
	OwnerID int64
	Name    string
	Status  []common.IntelligenceStatus
	Types   []common.IntelligenceType

	IsPublished    bool
	IsFav          bool
	IsRecentlyOpen bool
	OrderBy        intelligence.OrderBy
	Order          common.OrderByType

	Cursor string
	Limit  int
}

type SearchAppsResponse struct {
	HasMore    bool
	NextCursor string

	Data []*AppDocument
}

type SearchResourcesRequest struct {
	SpaceID             int64
	OwnerID             int64
	Name                string
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
