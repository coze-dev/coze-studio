package entity

import (
	"github.com/cloudwego/eino/schema"
)

type ReplyType string

const (
	ReplyTypeOfFinalAnswer     ReplyType = "final_answer"
	ReplyTypeOfToolOutput      ReplyType = "tool"
	ReplyTypeOfChatModelOutput ReplyType = "chat_model"
	ReplyTypeOfSuggest         ReplyType = "suggest"
	ReplyTypeOfKnowledge       ReplyType = "knowledge"
)

type Suggestion struct {
}

type ToolOutput struct {
	ToolName string
	Result   string
}

type AgentReply struct {
	ReplyType ReplyType
	// identity which step's output.
	// when one step has stream output, this could identity different chunks in same step
	ReplyID int

	FinalAnswer     *schema.Message
	ToolOutput      *ToolOutput
	ChatModelOutput *schema.Message
	Suggest         *Suggestion
	Knowledge       []*schema.Document

	IsFinish bool
}
