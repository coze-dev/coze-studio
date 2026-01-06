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
	model "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
)

type Page struct {
	Size int32 `json:"size"`
	Page int32 `json:"page"`
}

func (p *Page) Offset() int {
	if p.Page == 0 {
		return 0
	}
	return int((p.Page - 1) * p.Size)
}

func (p *Page) Limit() int {
	return int(p.Size)
}

type PublishStatus string

const (
	UnPublished  PublishStatus = "UnPublished"
	HasPublished PublishStatus = "HasPublished"
)

type WorkFlowType string

const (
	User     WorkFlowType = "user"
	Official WorkFlowType = "official"
)

type QueryToolInfoOption struct {
	Page *Page
	IDs  []int64
}

type GetPolicy struct {
	ID       int64
	QType    model.Locator
	MetaOnly bool
	Version  string
	CommitID string
}

type DeletePolicy struct {
	ID    *int64
	IDs   []int64
	AppID *int64
}

type MGetPolicy struct {
	MetaQuery

	QType    model.Locator
	MetaOnly bool
	Versions map[int64]string
}

type MGetReferencePolicy struct {
	ReferredIDs      []int64
	ReferringIDs     []int64
	ReferringBizType []ReferringBizType
	ReferType        []ReferType
}

type ReferType uint8

const (
	ReferTypeSubWorkflow ReferType = 1
	ReferTypeTool        ReferType = 2
)

type ReferringBizType uint8

const (
	ReferringBizTypeWorkflow ReferringBizType = 1
	ReferringBizTypeAgent    ReferringBizType = 2
)
