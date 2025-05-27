package entity

import (
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type APP struct {
	ID      int64
	SpaceID int64
	IconURI *string
	Name    *string
	Desc    *string
	OwnerID int64

	Version      *string
	ConnectorIDs []int64

	CreatedAtMS   int64
	UpdatedAtMS   int64
	PublishedAtMS *int64
}

func (a APP) HasPublished() bool {
	return a.PublishedAtMS != nil && *a.PublishedAtMS > 0
}

func (a APP) GetPublishedAtMS() int64 {
	return ptr.FromOrDefault(a.PublishedAtMS, 0)
}

func (a APP) GetVersion() string {
	return ptr.FromOrDefault(a.Version, "")
}

func (a APP) GetName() string {
	return ptr.FromOrDefault(a.Name, "")
}

func (a APP) GetDesc() string {
	return ptr.FromOrDefault(a.Desc, "")
}

func (a APP) GetIconURI() string {
	return ptr.FromOrDefault(a.IconURI, "")
}
