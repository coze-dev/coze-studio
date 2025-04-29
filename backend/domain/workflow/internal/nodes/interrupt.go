package nodes

import (
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
)

type InterruptEvent struct {
	ID            int64
	InterruptData string
	NodeType      entity.NodeType
	ResumeData    string
	EventType     InterruptEventType
}

type InterruptEventType = workflow.EventType

const (
	InterruptEventQuestion InterruptEventType = workflow.EventType_Question
	InterruptEventInput    InterruptEventType = workflow.EventType_InputNode
)

type InterruptEventStore interface {
	GetInterruptEvent(eventID int64) (*InterruptEvent, bool, error)
	SetInterruptEvent(eventID int64, value *InterruptEvent) error
}
