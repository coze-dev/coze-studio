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

package entity

import "github.com/coze-dev/coze-studio/backend/api/model/intelligence/common"

type ProjectDocument struct {
	ID             int64                     `json:"id"`
	Type           common.IntelligenceType   `json:"type"`
	Status         common.IntelligenceStatus `json:"status,omitempty"`
	Name           *string                   `json:"name,omitempty"`
	SpaceID        *int64                    `json:"space_id,omitempty"`
	OwnerID        *int64                    `json:"owner_id,omitempty"`
	HasPublished   *int                      `json:"has_published,omitempty"`
	CreateTimeMS   *int64                    `json:"create_time,omitempty"`
	UpdateTimeMS   *int64                    `json:"update_time,omitempty"`
	PublishTimeMS  *int64                    `json:"publish_time,omitempty"`
	RecentlyOpenMS *int64                    `json:"recently_open_time,omitempty"`
	FavTimeMS      *int64                    `json:"fav_time,omitempty"`
	IsFav          *int                      `json:"is_fav,omitempty"`
	IsRecentlyOpen *int                      `json:"is_recently_open,omitempty"`
}

// GetName
func (a *ProjectDocument) GetName() string {
	if a.Name == nil {
		return ""
	}
	return *a.Name
}

// GetSpaceID
func (a *ProjectDocument) GetSpaceID() int64 {
	if a.SpaceID == nil {
		return 0
	}
	return *a.SpaceID
}

// GetOwnerID
func (a *ProjectDocument) GetOwnerID() int64 {
	if a.OwnerID == nil {
		return 0
	}
	return *a.OwnerID
}

// GetCreateTime
func (a *ProjectDocument) GetCreateTime() int64 {
	if a.CreateTimeMS == nil {
		return 0
	}
	return *a.CreateTimeMS
}

// GetUpdateTime
func (a *ProjectDocument) GetUpdateTime() int64 {
	if a.UpdateTimeMS == nil {
		return 0
	}
	return *a.UpdateTimeMS
}

// GetPublishTime
func (a *ProjectDocument) GetPublishTime() int64 {
	if a.PublishTimeMS == nil {
		return 0
	}
	return *a.PublishTimeMS
}

// GetRecentlyOpenTime
func (a *ProjectDocument) GetRecentlyOpenTime() int64 {
	if a.RecentlyOpenMS == nil {
		return 0
	}
	return *a.RecentlyOpenMS
}

// GetFavTime
func (a *ProjectDocument) GetFavTime() int64 {
	if a.FavTimeMS == nil {
		return 0
	}
	return *a.FavTimeMS
}

// GetIsFav
func (a *ProjectDocument) GetIsFav() bool {
	if a.IsFav == nil {
		return false
	}
	return *a.IsFav == 1
}
