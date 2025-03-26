package entity

import (
	"github.com/cloudwego/eino/schema"
)

type ReplyType string

const (
	ReplyTypeOfAnswer     ReplyType = "answer"
	ReplyTypeOfToolOutput ReplyType = "tool"
	ReplyTypeOfLLMOutput  ReplyType = "llm"
	ReplyTypeOfSuggest    ReplyType = "suggest"
)

type Suggestion struct {
}

type AgentReply struct {
	ReplyType ReplyType

	Answer     *schema.Message
	ToolOutput *schema.Message
	LLMOutput  *schema.Message
	suggest    *Suggestion

	IsFinish bool
}
