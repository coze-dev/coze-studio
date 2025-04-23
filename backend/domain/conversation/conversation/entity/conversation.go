package entity

import "code.byted.org/flow/opencoze/backend/domain/common"

type Conversation struct {
	ID          int64        `json:"id"`
	SectionID   int64        `json:"section_id"`
	AgentID     int64        `json:"agent_id"`
	ConnectorID int64        `json:"connector_id"`
	CreatorID   int64        `json:"creator_id"`
	Scene       common.Scene `json:"scene"`
	Ext         string       `json:"ext"`
	CreatedAt   int64        `json:"created_at"`
	UpdatedAt   int64        `json:"updated_at"`
}

type CreateRequest struct {
	AgentID     int64        `json:"agent_id"`
	UserID      int64        `json:"user_id"`
	ConnectorID int64        `json:"connector_id"`
	Scene       common.Scene `json:"scene"`
	Ext         string       `json:"ext"`
}

type CreateResponse struct {
	Conversation *Conversation `json:"conversation"`
}

type GetByIDRequest struct {
	ID int64 `json:"id"`
}
type GetByIDResponse struct {
	Conversation *Conversation `json:"conversation"`
}

type EditRequest struct {
	ID        int64  `json:"id"`
	SectionID int64  `json:"section_id"`
	Ext       string `json:"ext"`
}

type EditResponse struct {
}

type GetCurrentRequest struct {
	UserID  int64 `json:"user_id"`
	Scene   int32 `json:"scene"`
	AgentID int64 `json:"agent_id"`
}

type GetCurrentResponse struct {
	Conversation *Conversation `json:"conversation"`
}
