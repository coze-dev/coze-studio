package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	resource "code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/domain/search/consts"
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
	OrderBy        consts.OrderByType
	Order          common.OrderByType

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

	OrderBy             consts.OrderByType
	Order               common.OrderByType
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
