package entity

import "code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"

type Message struct {
	ID             int64              `json:"id"`
	ConversationID int64              `json:"conversation_id"`
	RunID          int64              `json:"run_id"`
	AgentID        int64              `json:"agent_id"`
	SectionID      int64              `json:"section_id"`
	Content        string             `json:"content"`
	ContentType    entity.ContentType `json:"content_type"`
	DisplayContent string             `json:"display_content"`
	Role           entity.RoleType    `json:"role"`
	MessageType    entity.MessageType `json:"message_type"`
	UserID         int64              `json:"user_id"`
	Ext            string             `json:"ext"`
	CreatedAt      int64              `json:"created_at"`
	UpdatedAt      int64              `json:"updated_at"`
}

type ListRequest struct {
	ConversationID int64               `json:"conversation_id"`
	RunID          []*int64            `json:"run_id"`
	UserID         int64               `json:"user_id"`
	AgentID        int64               `json:"agent_id"`
	Limit          int                 `json:"limit"`
	Cursor         int64               `json:"cursor"`    // message id
	Direction      ScrollPageDirection `json:"direction"` //  "prev" "Next"
}

type ListResponse struct {
	Messages []*Message `json:"messages"`
	HasMore  bool       `json:"has_more"`
}

type CreateRequest struct {
	Message *Message `json:"message"`
}

type CreateResponse struct {
	Message *Message `json:"message"`
}

type BatchCreateRequest struct {
	Messages []*Message `json:"messages"`
}

type BatchCreateResponse struct {
	Messages []*Message `json:"messages"`
}

type GetByRunIDRequest struct {
	ConversationID int64   `json:"conversation_id"`
	RunID          []int64 `json:"run_id"`
}
type GetByRunIDResponse struct {
	Messages []*Message `json:"message"`
}

type EditRequest struct {
	Message *Message `json:"message"`
}

type EditResponse struct {
	Message *Message `json:"message"`
}
