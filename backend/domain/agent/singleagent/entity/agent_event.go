package entity

import (
	"github.com/cloudwego/eino/schema"
)

type EventType string

const (
	EventTypeOfFinalAnswer  EventType = "final_answer"
	EventTypeOfToolsMessage EventType = "tools_message"
	EventTypeOfFuncCall     EventType = "func_call"
	EventTypeOfSuggest      EventType = "suggest"
	EventTypeOfKnowledge    EventType = "knowledge"
)

type AgentEvent struct {
	EventType EventType

	FinalAnswer  *schema.StreamReader[*schema.Message]
	ToolsMessage []*schema.Message
	FuncCall     *schema.Message
	Suggest      *schema.Message
	Knowledge    []*schema.Document
}
