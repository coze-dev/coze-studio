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

package vo

import (
	"time"

	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/workflow"
)

type ContentType = workflow.WorkFlowType
type Tag = workflow.Tag
type Mode = workflow.WorkflowMode

type Meta struct {
	// the following fields are immutable
	SpaceID     int64
	CreatorID   int64
	CreatedAt   time.Time
	ContentType ContentType
	Tag         *Tag
	AppID       *int64
	SourceID    *int64
	AuthorID    int64

	// the following fields are mutable
	Name                   string
	Desc                   string
	IconURI                string
	IconURL                string
	Mode                   Mode
	UpdatedAt              *time.Time
	UpdaterID              *int64
	DeletedAt              *time.Time
	HasPublished           bool
	LatestPublishedVersion *string
}

type MetaCreate struct {
	Name             string
	Desc             string
	IconURI          string
	SpaceID          int64
	CreatorID        int64
	ContentType      ContentType
	AppID            *int64
	Mode             Mode
	InitCanvasSchema string
}

type MetaUpdate struct {
	Name                   *string
	Desc                   *string
	IconURI                *string
	HasPublished           *bool
	LatestPublishedVersion *string
}

type MetaQuery struct {
	IDs             []int64
	SpaceID         *int64
	Page            *Page
	Name            *string
	PublishStatus   *PublishStatus
	AppID           *int64
	LibOnly         bool
	NeedTotalNumber bool
	DescByUpdate    bool
}
