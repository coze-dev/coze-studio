package entity

import (
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

	Version              *string
	VersionDesc          *string
	ConnectorPublishInfo []ConnectorPublishInfo

	CreatedAtMS   int64
	UpdatedAtMS   int64
	PublishedAtMS *int64
}

type ConnectorPublishInfo struct {
	ConnectorID   int64                `json:"connector_id"`
	PublishStatus consts.PublishStatus `json:"publish_status"`
	PublishConfig PublishConfig        `json:"publish_config"`
}

type PublishConfig struct {
	SelectedWorkflows []*SelectedWorkflow `json:"selected_workflows,omitempty"`
}

type SelectedWorkflow struct {
	WorkflowID   int64  `json:"workflow_id"`
	WorkflowName string `json:"workflow_name"`
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
