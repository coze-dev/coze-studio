package search

import (
	resource "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
)

type ResourceDocument struct {
	ResID         int64                   `json:"res_id"`
	ResType       resource.ResType        `json:"res_type"`
	ResSubType    *int32                  `json:"res_sub_type,omitempty"`
	Name          *string                 `json:"name,omitempty"`
	OwnerID       *int64                  `json:"owner_id,omitempty"`
	SpaceID       *int64                  `json:"space_id,omitempty"`
	APPID         *int64                  `json:"app_id,omitempty"`
	BizStatus     *int64                  `json:"biz_status,omitempty"`
	PublishStatus *resource.PublishStatus `json:"publish_status,omitempty"`

	CreateTimeMS  *int64 `json:"create_time,omitempty"`
	UpdateTimeMS  *int64 `json:"update_time,omitempty"`
	PublishTimeMS *int64 `json:"publish_time,omitempty"`
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

func (r *ResourceDocument) GetResSubType() int32 {
	if r.ResSubType != nil {
		return *r.ResSubType
	}
	return 0
}

func (r *ResourceDocument) GetCreateTime() int64 {
	if r.CreateTimeMS == nil {
		return 0
	}
	return *r.CreateTimeMS
}

func (r *ResourceDocument) GetPublishTime() int64 {
	if r.PublishTimeMS == nil {
		return 0
	}
	return *r.PublishTimeMS
}
