package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/conversation/common"
)

type Conversation struct {
	ID          int64              `json:"id"`
	SectionID   int64              `json:"section_id"`
	AgentID     int64              `json:"agent_id"`
	ConnectorID int64              `json:"connector_id"`
	CreatorID   int64              `json:"creator_id"`
	Scene       common.Scene       `json:"scene"`
	Status      ConversationStatus `json:"status"`
	Ext         string             `json:"ext"`
	CreatedAt   int64              `json:"created_at"`
	UpdatedAt   int64              `json:"updated_at"`
}

type CreateMeta struct {
	AgentID     int64        `json:"agent_id"`
	UserID      int64        `json:"user_id"`
	ConnectorID int64        `json:"connector_id"`
	Scene       common.Scene `json:"scene"`
	Ext         string       `json:"ext"`
}

type NewConversationCtxRequest struct {
	ID int64 `json:"id"`
}

type NewConversationCtxResponse struct {
	ID        int64 `json:"id"`
	SectionID int64 `json:"section_id"`
}

type GetCurrent struct {
	UserID      int64        `json:"user_id"`
	Scene       common.Scene `json:"scene"`
	AgentID     int64        `json:"agent_id"`
	ConnectorID int64        `json:"connector_id"`
}

type ListMeta struct {
	UserID      int64        `json:"user_id"`
	ConnectorID int64        `json:"connector_id"`
	Scene       common.Scene `json:"scene"`
	AgentID     int64        `json:"agent_id"`
	Limit       int          `json:"limit"`
	Page        int          `json:"page"`
}
