package entity

import (
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/agentrun"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/conversation"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/message"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/internal/dal/model"
)

type RunRecord = model.RunRecord

type RunRecordMeta struct {
	ID             int64     `json:"id"`
	ConversationID int64     `json:"conversation_id"`
	SectionID      int64     `json:"section_id"`
	AgentID        int64     `json:"agent_id"`
	Status         RunStatus `json:"status"`
	Error          *RunError `json:"error"`
	Usage          *Usage    `json:"usage"`
	Ext            string    `json:"ext"`
	CreatedAt      int64     `json:"created_at"`
	UpdatedAt      int64     `json:"updated_at"`
	ChatRequest    *string   `json:"chat_message"`
	CompletedAt    int64     `json:"completed_at"`
	FailedAt       int64     `json:"failed_at"`
}

type ChunkRunItem = RunRecordMeta

type ChunkMessageItem struct {
	ID               int64               `json:"id"`
	ConversationID   int64               `json:"conversation_id"`
	SectionID        int64               `json:"section_id"`
	RunID            int64               `json:"run_id"`
	AgentID          int64               `json:"agent_id"`
	Role             RoleType            `json:"role"`
	Type             message.MessageType `json:"type"`
	Content          string              `json:"content"`
	ContentType      message.ContentType `json:"content_type"`
	MessageType      message.MessageType `json:"message_type"`
	ReplyID          int64               `json:"reply_id"`
	Ext              map[string]string   `json:"ext"`
	ReasoningContent *string             `json:"reasoning_content"`
	Index            int64               `json:"index"`
	SeqID            int64               `json:"seq_id"`
	CreatedAt        int64               `json:"created_at"`
	UpdatedAt        int64               `json:"updated_at"`
	IsFinish         bool                `json:"is_finish"`
}

type RunError struct {
	Code int64  `json:"code"`
	Msg  string `json:"msg"`
}

type CustomerConfig struct {
	ModelConfig *ModelConfig `json:"model_config"`
	AgentConfig *AgentConfig `json:"agent_config"`
}

type ModelConfig struct {
	ModelId *int64 `json:"model_id,omitempty"`
}

type AgentConfig struct {
	Prompt *string `json:"prompt"`
}

type Tool = agentrun.Tool

type AnswerFinshContent struct {
	MsgType  MessageSubType `json:"msg_type"`
	Data     string         `json:"data"`
	FromUnit string         `json:"from_unit"`
}
type Data struct {
	FinishReason int32  `json:"finish_reason"`
	FinData      string `json:"fin_data"`
}

type MetaInfo struct {
	Type MetaType `json:"type"`
	Info string   `json:"info"`
}

type Usage struct {
	LlmPromptTokens     int64  `json:"llm_prompt_tokens"`
	LlmCompletionTokens int64  `json:"llm_completion_tokens"`
	LlmTotalTokens      int64  `json:"llm_total_tokens"`
	WorkflowTokens      *int64 `json:"workflow_tokens"`
	WorkflowCost        *int64 `json:"workflow_cost"`
}
type AgentRunMeta struct {
	ConversationID   int64                    `json:"conversation_id"`
	ConnectorID      int64                    `json:"connector_id"`
	SpaceID          int64                    `json:"space_id"`
	Scene            conversation.Scene       `json:"scene"`
	SectionID        int64                    `json:"section_id"`
	Name             string                   `json:"name"`
	UserID           int64                    `json:"user_id"`
	AgentID          int64                    `json:"agent_id"`
	ContentType      message.ContentType      `json:"content_type"`
	Content          []*message.InputMetaData `json:"content"`
	PreRetrieveTools []*Tool                  `json:"tools"`
	IsDraft          bool                     `json:"is_draft"`
	CustomerConfig   *CustomerConfig          `json:"customer_config"`
	DisplayContent   string                   `json:"display_content"`
	CustomVariables  map[string]string        `json:"custom_variables"`
	Version          string                   `json:"version"`
	Ext              map[string]string        `json:"ext"`
}

type UpdateMeta struct {
	Status      RunStatus
	LastError   *RunError
	UpdatedAt   int64
	CompletedAt int64
	FailedAt    int64
}

type AgentRunResponse struct {
	Event            RunEvent          `json:"event"`
	ChunkRunItem     *ChunkRunItem     `json:"run_record_item"`
	ChunkMessageItem *ChunkMessageItem `json:"message_item"`
	Error            *RunError         `json:"error"`
}

type AgentRespEvent struct {
	EventType message.MessageType

	FinalAnswer  *schema.StreamReader[*schema.Message]
	ToolsMessage []*schema.Message
	FuncCall     *schema.Message
	Suggest      *schema.Message
	Knowledge    []*schema.Document
	Err          error
}

type FinalAnswerEvent struct {
	Message *schema.Message
	Err     error
}
