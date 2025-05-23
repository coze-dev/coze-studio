package entity

import resource "code.byted.org/flow/opencoze/backend/api/model/resource/common"

type ResourceDocument struct {
	ResType       resource.ResType        `json:"res_type"`
	ResID         int64                   `json:"res_id"`
	ResSubType    *int32                  `json:"res_sub_type,omitempty"`
	Name          *string                 `json:"name,omitempty"`
	Desc          *string                 `json:"desc,omitempty"`
	IconURI       *string                 `json:"icon,omitempty"`
	IconURL       string                  `json:"-"`
	OwnerID       *int64                  `json:"owner_id,omitempty"`
	SpaceID       *int64                  `json:"space_id,omitempty"`
	BizStatus     *int64                  `json:"biz_status,omitempty"`
	PublishStatus *resource.PublishStatus `json:"has_published,omitempty"`
	CreateTime    *int64                  `json:"create_time,omitempty"`
	UpdateTime    *int64                  `json:"update_time,omitempty"`
	PublishTime   *int64                  `json:"publish_time,omitempty"`
}

func (r *ResourceDocument) GetIconURI() string {
	if r.IconURI != nil {
		return *r.IconURI
	}
	return ""
}

func (r *ResourceDocument) GetOwnerID() int64 {
	if r.OwnerID != nil {
		return *r.OwnerID
	}
	return 0
}

// GetUpdateTime 获取更新时间
func (r *ResourceDocument) GetUpdateTime() int64 {
	if r.UpdateTime != nil {
		return *r.UpdateTime
	}
	return 0
}
