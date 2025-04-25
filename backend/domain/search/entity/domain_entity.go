package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
)

type DomainName string

const (
	SingleAgent DomainName = "single_agent"
	Project     DomainName = "project"
	Workflow    DomainName = "workflow"
	Knowledge   DomainName = "knowledge"
	Plugin      DomainName = "plugin"
	Model       DomainName = "model"
	Tool        DomainName = "tool"
	Variable    DomainName = "variable"
	Session     DomainName = "session"
	Prompt      DomainName = "prompt"
)

type OpType string

const (
	Created OpType = "created"
	Updated OpType = "updated"
	Deleted OpType = "deleted"
)

type DomainEvent struct {
	DomainName DomainName `json:"domain_name"`
	OpType     OpType     `json:"op_type"`

	Agent *Agent `json:"agent,omitempty"`

	Meta *EventMeta `json:"meta,omitempty"`

	Extra map[string]any `json:"extra"`
}

type Agent struct {
	ID           int64  `json:"id"`
	Name         string `json:"name,omitempty"`
	Desc         string `json:"desc,,omitempty"`
	SpaceID      int64  `json:"space_id,omitempty"`
	OwnerID      int64  `json:"owner_id,omitempty"`
	HasPublished bool   `json:"is_published"`

	CreatedAt   int64 `json:"created_at,omitempty"`
	UpdatedAt   int64 `json:"updated_at,omitempty"`
	PublishedAt int64 `json:"published_at,omitempty"`
}

func (a *Agent) ToAppDocument() *AppDocument {
	return &AppDocument{
		ID:           a.ID,
		Name:         a.Name,
		Desc:         a.Desc,
		SpaceID:      a.SpaceID,
		OwnerID:      a.OwnerID,
		AppType:      common.IntelligenceType_Bot,
		Status:       common.IntelligenceStatus_Using,
		HasPublished: HasPublishedEnum(a.HasPublished),
		CreateTime:   a.CreatedAt,
		UpdateTime:   a.UpdatedAt,
		PublishTime:  a.PublishedAt,
	}
}

type EventMeta struct {
	SendTimeMs    int64 `json:"send_time_ms"`
	ReceiveTimeMs int64 `json:"receive_time_ms"`
}

func HasPublishedEnum(p bool) int {
	if p {
		return 1
	}
	return 0
}
