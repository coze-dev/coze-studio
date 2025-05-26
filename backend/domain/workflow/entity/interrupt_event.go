package entity

import (
	"fmt"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type InterruptEvent struct {
	ID            int64              `json:"id"`
	NodeKey       vo.NodeKey         `json:"node_key"`
	InterruptData string             `json:"interrupt_data,omitempty"`
	NodeType      NodeType           `json:"node_type"`
	NodeTitle     string             `json:"node_title,omitempty"`
	NodeIcon      string             `json:"node_icon,omitempty"`
	EventType     InterruptEventType `json:"event_type"`
	NodePath      []string           `json:"node_path,omitempty"`

	// index within composite node -> interrupt info for that index
	// TODO: separate the following fields with InterruptEvent
	NestedInterruptInfo      map[int]*compose.InterruptInfo `json:"nested_interrupt_info,omitempty"`
	SubWorkflowInterruptInfo *compose.InterruptInfo         `json:"sub_workflow_interrupt_info,omitempty"`
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

type ResumeRequest struct {
	ExecuteID  int64
	EventID    int64
	ResumeData string
}

func (r *ResumeRequest) GetResumeID() string {
	return fmt.Sprintf("%d_%d", r.ExecuteID, r.EventID)
}
