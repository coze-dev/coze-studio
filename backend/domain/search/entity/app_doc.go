package entity

import "code.byted.org/flow/opencoze/backend/api/model/intelligence/common"

type AppDocument struct {
	ID           int64                     `json:"id"`
	Type         common.IntelligenceType   `json:"type"`
	Status       common.IntelligenceStatus `json:"status,omitempty"`
	Name         *string                   `json:"name,omitempty"`
	SpaceID      *int64                    `json:"space_id,omitempty"`
	OwnerID      *int64                    `json:"owner_id,omitempty"`
	Icon         *string                   `json:"icon,omitempty"`
	IconURL      string                    `json:"-"`
	HasPublished *int                      `json:"has_published,omitempty"`
	CreateTime   *int64                    `json:"create_time,omitempty"`
	UpdateTime   *int64                    `json:"update_time,omitempty"`
	PublishTime  *int64                    `json:"publish_time,omitempty"`
}

// GetName
func (a *AppDocument) GetName() string {
	if a.Name == nil {
		return ""
	}
	return *a.Name
}

// GetSpaceID
func (a *AppDocument) GetSpaceID() int64 {
	if a.SpaceID == nil {
		return 0
	}
	return *a.SpaceID
}

// GetOwnerID
func (a *AppDocument) GetOwnerID() int64 {
	if a.OwnerID == nil {
		return 0
	}
	return *a.OwnerID
}

// GetIcon
func (a *AppDocument) GetIcon() string {
	if a.Icon == nil {
		return ""
	}
	return *a.Icon
}

// GetCreateTime
func (a *AppDocument) GetCreateTime() int64 {
	if a.CreateTime == nil {
		return 0
	}
	return *a.CreateTime
}

// GetUpdateTime
func (a *AppDocument) GetUpdateTime() int64 {
	if a.UpdateTime == nil {
		return 0
	}
	return *a.UpdateTime
}

// GetPublishTime
func (a *AppDocument) GetPublishTime() int64 {
	if a.PublishTime == nil {
		return 0
	}
	return *a.PublishTime
}
