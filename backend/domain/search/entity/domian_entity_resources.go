package entity

import (
	resCommon "code.byted.org/flow/opencoze/backend/api/model/resource/common"
)

// 复用AppDomainEvent中的DomainName和OpType

type ResourceDomainEvent struct {
	OpType OpType `json:"op_type"`

	Resource *Resource `json:"resource,omitempty"`

	Meta *EventMeta `json:"meta,omitempty"`

	Extra map[string]any `json:"extra"`
}

type Resource struct {
	ResType resCommon.ResType `json:"res_type,omitempty"`

	ID      int64  `json:"id"`
	Name    string `json:"name,omitempty"`
	IconURI string `json:"icon_uri,omitempty"`
	Desc    string `json:"desc,omitempty"`

	ResSubType    int32                   `json:"res_sub_type,omitempty"`
	SpaceID       int64                   `json:"space_id,omitempty"`
	OwnerID       int64                   `json:"owner_id,omitempty"`
	PublishStatus resCommon.PublishStatus `json:"publish_status,omitempty"`

	CreatedAt   int64 `json:"created_at,omitempty"`
	UpdatedAt   int64 `json:"updated_at,omitempty"`
	PublishedAt int64 `json:"published_at,omitempty"`
}

func (r *Resource) ToResourceDocument() *ResourceDocument {
	return &ResourceDocument{
		ResID:         r.ID,
		Name:          r.Name,
		Desc:          r.Desc,
		Icon:          r.IconURI,
		ResType:       r.ResType,
		ResSubType:    int(r.ResSubType),
		SpaceID:       r.SpaceID,
		OwnerID:       r.OwnerID,
		PublishStatus: r.PublishStatus,
		CreateTime:    r.CreatedAt,
		UpdateTime:    r.UpdatedAt,
		PublishTime:   r.PublishedAt,
	}
}
