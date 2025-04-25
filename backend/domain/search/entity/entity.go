package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/intelligence"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
)

type SearchRequest struct {
	SpaceID  int64
	OwnerID  int64
	Name     string
	Status   []common.IntelligenceStatus
	AppTypes []common.IntelligenceType
	Scope    intelligence.SearchScope

	IsPublished    bool
	IsFav          bool
	IsRecentlyOpen bool
	OrderBy        intelligence.OrderBy
	Order          common.OrderByType

	Cursor string
	Limit  int
}

type AppDocument struct {
	ID           string                    `json:"id"`
	Name         string                    `json:"name"`
	Desc         string                    `json:"desc"`
	SpaceID      int64                     `json:"space_id"`
	OwnerID      int64                     `json:"owner_id"`
	AppType      common.IntelligenceType   `json:"app_type"`
	Status       common.IntelligenceStatus `json:"status"`
	HasPublished int                       `json:"has_published"`
	CreateTime   int64                     `json:"create_time"`
	UpdateTime   int64                     `json:"update_time"`
	PublishTime  int64                     `json:"publish_time"`
}

type SearchResponse struct {
	HasMore    bool
	NextCursor string

	Data []*AppDocument
}
