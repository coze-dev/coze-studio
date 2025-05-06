package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type InterruptEvent struct {
	ID            int64              `json:"id"`
	NodeKey       vo.NodeKey         `json:"node_key"`
	InterruptData string             `json:"interrupt_data"`
	NodeType      NodeType           `json:"node_type"`
	NodeTitle     string             `json:"node_title"`
	NodeIcon      string             `json:"node_icon"`
	EventType     InterruptEventType `json:"event_type"`
}

type InterruptEventType = workflow.EventType

const (
	InterruptEventQuestion InterruptEventType = workflow.EventType_Question
	InterruptEventInput    InterruptEventType = workflow.EventType_InputNode
)
