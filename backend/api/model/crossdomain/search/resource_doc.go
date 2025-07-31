/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

// GetUpdateTime Get the update time
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
