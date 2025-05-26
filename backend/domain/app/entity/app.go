package entity

import (
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type Application struct {
	ID      int64
	SpaceID int64
	IconURI string
	Name    string
	Desc    string
	OwnerID int64

	CreatedAtMS   int64
	UpdatedAtMS   int64
	PublishedAtMS *int64
}

func (a Application) HasPublished() bool {
	return a.PublishedAtMS != nil && *a.PublishedAtMS > 0
}

func (a Application) GetPublishedAtMS() int64 {
	return ptr.FromOrDefault(a.PublishedAtMS, 0)
}
