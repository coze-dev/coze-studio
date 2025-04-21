package entity

import (
	"strconv"
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

	Meta  *EventMeta `json:"meta,omitempty"`
	Extra map[string]any
}

type Agent struct {
	ID          int64  `json:"id"`
	Name        string `json:"name,omitempty"`
	Desc        string `json:"desc,,omitempty"`
	OwnerID     int64  `json:"owner_id,omitempty"`
	IsPublished bool   `json:"is_published"`

	CreatedAt   int64 `json:"created_at,omitempty"`
	UpdatedAt   int64 `json:"updated_at,omitempty"`
	PublishedAt int64 `json:"published_at,omitempty"`
}

func (a *Agent) ToAppDocument() *AppDocument {
	return &AppDocument{
		ID:           strconv.FormatInt(a.ID, 10),
		Name:         a.Name,
		OwnerID:      strconv.FormatInt(a.OwnerID, 10),
		Type:         strconv.Itoa(int(AppTypeOfAgent)),
		Status:       strconv.Itoa(int(AppStatusOfUsing)),
		HasPublished: strconv.FormatBool(a.IsPublished),
		CreateTime:   a.CreatedAt,
		UpdateTime:   a.UpdatedAt,
		PublishTime:  a.PublishedAt,
	}
}

type EventMeta struct {
	SendTimeMs    int64 `json:"send_time_ms"`
	ReceiveTimeMs int64 `json:"receive_time_ms"`
}
