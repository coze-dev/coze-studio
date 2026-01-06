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

package model

import (
	resource "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
)

type SearchResourcesRequest struct {
	SpaceID int64
	OwnerID int64
	Name    string
	APPID   int64

	OrderFiledName      string
	OrderAsc            bool
	ResTypeFilter       []resource.ResType
	PublishStatusFilter resource.PublishStatus
	SearchKeys          []string

	Cursor string
	Page   *int32
	Limit  int32
}

type SearchResourcesResponse struct {
	HasMore    bool
	NextCursor string
	TotalHits  *int64

	Data []*ResourceDocument
}

const (
	FieldOfCreateTime       = "create_time"
	FieldOfUpdateTime       = "update_time"
	FieldOfPublishTime      = "publish_time"
	FieldOfFavTime          = "fav_time"
	FieldOfRecentlyOpenTime = "recently_open_time"
)
