package message

import (
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/conversation/message"
)

type Message struct {
	ID               int64                   `json:"id"`
	ConversationID   int64                   `json:"conversation_id"`
	RunID            int64                   `json:"run_id"`
	AgentID          int64                   `json:"agent_id"`
	SectionID        int64                   `json:"section_id"`
	Content          string                  `json:"content"`
	MultiContent     []*InputMetaData        `json:"multi_content"`
	ContentType      ContentType             `json:"content_type"`
	DisplayContent   string                  `json:"display_content"`
	Role             schema.RoleType         `json:"role"`
	Name             string                  `json:"name"`
	Status           MessageStatus           `json:"status"`
	MessageType      MessageType             `json:"message_type"`
	ModelContent     string                  `json:"model_content"`
	Position         int32                   `json:"position"`
	UserID           int64                   `json:"user_id"`
	Ext              map[string]string       `json:"ext"`
	ReasoningContent string                  `json:"reasoning_content"`
	RequiredAction   *message.RequiredAction `json:"required_action"`
	CreatedAt        int64                   `json:"created_at"`
	UpdatedAt        int64                   `json:"updated_at"`
}

type InputMetaData struct {
	Type     InputType   `json:"type"`
	Text     string      `json:"text"`
	FileData []*FileData `json:"file_data"`
}

type MessageStatus int32

const (
	MessageStatusAvailable MessageStatus = 1
	MessageStatusDeleted   MessageStatus = 2
	MessageStatusBroken    MessageStatus = 4
)

type InputType string

const (
	InputTypeText  InputType = "text"
	InputTypeFile  InputType = "file"
	InputTypeImage InputType = "image"
)

type FileData struct {
	Url  string `json:"url"`
	Name string `json:"name"`
}

type ContentType string

const (
	ContentTypeText   ContentType = "text"
	ContentTypeImage  ContentType = "image"
	ContentTypeVideo  ContentType = "video"
	ContentTypeMusic  ContentType = "music"
	ContentTypeCard   ContentType = "card"
	ContentTypeWidget ContentType = "widget"
	ContentTypeAPP    ContentType = "app"
	ContentTypeMix    ContentType = "mix"
)

type MessageType string

const (
	MessageTypeAck          MessageType = "ack"
	MessageTypeQuestion     MessageType = "question"
	MessageTypeFunctionCall MessageType = "function_call"
	MessageTypeToolResponse MessageType = "tool_response"
	MessageTypeKnowledge    MessageType = "knowledge"
	MessageTypeAnswer       MessageType = "answer"
	MessageTypeFlowUp       MessageType = "follow_up"
	MessageTypeInterrupt    MessageType = "interrupt"
	MessageTypeVerbose      MessageType = "verbose"
)
