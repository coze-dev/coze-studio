package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/intelligence"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	resource "code.byted.org/flow/opencoze/backend/api/model/resource/common"
)

type SearchProjectsRequest struct {
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

type SearchProjectsResponse struct {
	HasMore    bool
	NextCursor string

	Data []*ProjectDocument
}

type SearchResourcesRequest struct {
	SpaceID             int64
	OwnerID             int64
	Name                string
	APPID               int64
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
