package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	publishAPI "code.byted.org/flow/opencoze/backend/api/model/publish"
	resource "code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/domain/app/consts"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
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
	PublishStatus    *consts.PublishStatus
	PublishExtraInfo *PublishRecordExtraInfo

	CreatedAtMS   int64
	UpdatedAtMS   int64
	PublishedAtMS *int64
}

func (a APP) Published() bool {
	return a.PublishedAtMS != nil && *a.PublishedAtMS > 0
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

func (a APP) GetPublishStatus() consts.PublishStatus {
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
	PackFailedInfo []*PackResourceFailedInfo
}

func (p PublishRecordExtraInfo) ToVO() *publishAPI.PublishRecordStatusDetail {
	if len(p.PackFailedInfo) == 0 {
		return &publishAPI.PublishRecordStatusDetail{}
	}

	packFailedDetail := make([]*publishAPI.PackFailedDetail, 0, len(p.PackFailedInfo))
	for _, info := range p.PackFailedInfo {
		packFailedDetail = append(packFailedDetail, &publishAPI.PackFailedDetail{
			EntityID:   info.ResourceID,
			EntityType: common.ResourceType(info.ResourceType),
			EntityName: info.ResourceName,
		})
	}

	return &publishAPI.PublishRecordStatusDetail{
		PackFailedDetail: packFailedDetail,
	}
}

type PackResourceFailedInfo struct {
	ResourceID   int64
	ResourceType resource.ResType
	ResourceName string
}
