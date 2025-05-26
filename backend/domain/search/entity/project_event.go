package entity

type OpType string

const (
	Created OpType = "created"
	Updated OpType = "updated"
	Deleted OpType = "deleted"
)

type ProjectDomainEvent struct {
	OpType  OpType           `json:"op_type"`
	Project *ProjectDocument `json:"project_document,omitempty"`
	Meta    *EventMeta       `json:"meta,omitempty"`
	Extra   map[string]any   `json:"extra"`
}

type EventMeta struct {
	SendTimeMs    int64 `json:"send_time_ms"`
	ReceiveTimeMs int64 `json:"receive_time_ms"`
}
