package entity

import (
	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type InterruptEvent struct {
	ID                     int64                          `json:"id"`
	NodeKey                vo.NodeKey                     `json:"node_key"`
	InterruptData          string                         `json:"interrupt_data,omitempty"`
	NodeType               NodeType                       `json:"node_type"`
	NodeTitle              string                         `json:"node_title,omitempty"`
	NodeIcon               string                         `json:"node_icon,omitempty"`
	EventType              InterruptEventType             `json:"event_type"`
	NodePath               []string                       `json:"node_path,omitempty"`
	CompositeInterruptInfo map[int]*compose.InterruptInfo `json:"composite_interrupt_info,omitempty"` // index within composite node -> interrupt info for that index
}

type InterruptEventType = workflow.EventType

const (
	InterruptEventQuestion = workflow.EventType_Question
	InterruptEventInput    = workflow.EventType_InputNode
)

func (i *InterruptEvent) String() string {
	s, _ := sonic.MarshalIndent(i, "", "  ")
	return string(s)
}
