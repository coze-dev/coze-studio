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
	"github.com/coze-dev/coze-studio/backend/api/model/app/intelligence/common"
	publishAPI "github.com/coze-dev/coze-studio/backend/api/model/app/intelligence/publish"
	resourceCommon "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type APP struct {
	ID      int64
	SpaceID int64
	IconURI *string
	Name    *string
	Desc    *string
	OwnerID int64

	ConnectorIDs     []int64
	Version          *string
	VersionDesc      *string
	PublishRecordID  *int64
	PublishStatus    *PublishStatus
	PublishExtraInfo *PublishRecordExtraInfo

	CreatedAtMS   int64
	UpdatedAtMS   int64
	PublishedAtMS *int64
}

func (a APP) Published() bool {
	return a.PublishStatus != nil && *a.PublishStatus == PublishStatusOfPublishDone
}

func (a APP) GetPublishedAtMS() int64 {
	return ptr.FromOrDefault(a.PublishedAtMS, 0)
}

func (a APP) GetVersion() string {
	return ptr.FromOrDefault(a.Version, "")
}

func (a APP) GetName() string {
	return ptr.FromOrDefault(a.Name, "")
}

func (a APP) GetDesc() string {
	return ptr.FromOrDefault(a.Desc, "")
}

func (a APP) GetVersionDesc() string {
	return ptr.FromOrDefault(a.VersionDesc, "")
}

func (a APP) GetIconURI() string {
	return ptr.FromOrDefault(a.IconURI, "")
}

func (a APP) GetPublishStatus() PublishStatus {
	return ptr.FromOrDefault(a.PublishStatus, 0)
}

func (a APP) GetPublishRecordID() int64 {
	return ptr.FromOrDefault(a.PublishRecordID, 0)
}

type PublishRecord struct {
	APP                     *APP
	ConnectorPublishRecords []*ConnectorPublishRecord
}

type PublishRecordExtraInfo struct {
	PackFailedInfo []*PackResourceFailedInfo `json:"pack_failed_info,omitempty"`
}

func (p *PublishRecordExtraInfo) ToVO() *publishAPI.PublishRecordStatusDetail {
	if p == nil || len(p.PackFailedInfo) == 0 {
		return &publishAPI.PublishRecordStatusDetail{}
	}

	packFailedDetail := make([]*publishAPI.PackFailedDetail, 0, len(p.PackFailedInfo))
	for _, info := range p.PackFailedInfo {
		packFailedDetail = append(packFailedDetail, &publishAPI.PackFailedDetail{
			EntityID:   info.ResID,
			EntityType: common.ResourceType(info.ResType),
			EntityName: info.ResName,
		})
	}

	return &publishAPI.PublishRecordStatusDetail{
		PackFailedDetail: packFailedDetail,
	}
}

type PackResourceFailedInfo struct {
	ResID   int64                  `json:"res_id"`
	ResType resourceCommon.ResType `json:"res_type"`
	ResName string                 `json:"res_name"`
}

type ResourceCopyResult struct {
	ResID        int64                            `json:"res_id"`
	ResType      ResourceType                     `json:"res_type"`
	ResName      string                           `json:"res_name"`
	CopyStatus   ResourceCopyStatus               `json:"copy_status"`
	CopyScene    resourceCommon.ResourceCopyScene `json:"copy_scene"`
	FailedReason string                           `json:"reason"`
}

type Resource struct {
	ResID   int64
	ResType ResourceType
	ResName string
}
