package entity

import (
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
)

type Message struct {
	ID             int64                   `json:"id"`
	ConversationID int64                   `json:"conversation_id"`
	RunID          int64                   `json:"run_id"`
	AgentID        int64                   `json:"agent_id"`
	SectionID      int64                   `json:"section_id"`
	Content        string                  `json:"content"`
	MultiContent   []*entity.InputMetaData `json:"multi_content"`
	ContentType    entity.ContentType      `json:"content_type"`
	DisplayContent string                  `json:"display_content"`
	Role           schema.RoleType         `json:"role"`
	Name           string                  `json:"name"`
	Status         MessageStatus           `json:"status"`
	MessageType    entity.MessageType      `json:"message_type"`
	ModelContent   string                  `json:"model_content"`
	Position       int32                   `json:"position"`
	UserID         int64                   `json:"user_id"`
	Ext            map[string]string       `json:"ext"`
	CreatedAt      int64                   `json:"created_at"`
	UpdatedAt      int64                   `json:"updated_at"`
}

type ListMeta struct {
	ConversationID int64               `json:"conversation_id"`
	RunID          []*int64            `json:"run_id"`
	UserID         int64               `json:"user_id"`
	AgentID        int64               `json:"agent_id"`
	Limit          int                 `json:"limit"`
	Cursor         int64               `json:"cursor"`    // message id
	Direction      ScrollPageDirection `json:"direction"` //  "prev" "Next"
}

type ListResult struct {
	Messages   []*Message          `json:"messages"`
	PrevCursor int64               `json:"prev_cursor"`
	NextCursor int64               `json:"next_cursor"`
	HasMore    bool                `json:"has_more"`
	Direction  ScrollPageDirection `json:"direction"`
}

type GetByRunIDsRequest struct {
	ConversationID int64   `json:"conversation_id"`
	RunID          []int64 `json:"run_id"`
}

type DeleteMeta struct {
	MessageIDs []int64 `json:"message_ids"`
	RunIDs     []int64 `json:"run_ids"`
}

type BrokenMeta struct {
	ID       int64  `json:"id"`
	Position *int32 `json:"position"`
}
