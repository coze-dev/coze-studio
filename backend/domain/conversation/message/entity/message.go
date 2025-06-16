package entity

import "code.byted.org/flow/opencoze/backend/api/model/crossdomain/message"

type Message = message.Message

type ListMeta struct {
	ConversationID int64               `json:"conversation_id"`
	RunID          []*int64            `json:"run_id"`
	UserID         string              `json:"user_id"`
	AgentID        int64               `json:"agent_id"`
	OrderBy        *string             `json:"order_by"`
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
