package entity

import resource "code.byted.org/flow/opencoze/backend/api/model/resource/common"

type ResourceDocument struct {
	ResID         int64                   `json:"res_id"`
	ResType       resource.ResType        `json:"res_type"`
	ResSubType    *int32                  `json:"res_sub_type,omitempty"`
	Name          *string                 `json:"name,omitempty"`
	OwnerID       *int64                  `json:"owner_id,omitempty"`
	SpaceID       *int64                  `json:"space_id,omitempty"`
	BizStatus     *int64                  `json:"biz_status,omitempty"`
	PublishStatus *resource.PublishStatus `json:"has_published,omitempty"`
	CreateTimeMS  *int64                  `json:"create_time,omitempty"`
	UpdateTimeMS  *int64                  `json:"update_time,omitempty"`
	PublishTimeMS *int64                  `json:"publish_time,omitempty"`
}

func (r *ResourceDocument) GetName() string {
	if r.Name != nil {
		return *r.Name
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
	if r.UpdateTimeMS != nil {
		return *r.UpdateTimeMS
	}
	return 0
}
