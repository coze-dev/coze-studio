package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/conversation"
)

type Conversation = conversation.Conversation

type CreateMeta struct {
	AgentID     int64              `json:"agent_id"`
	UserID      int64              `json:"user_id"`
	ConnectorID int64              `json:"connector_id"`
	Scene       conversation.Scene `json:"scene"`
	Ext         string             `json:"ext"`
}

type NewConversationCtxRequest struct {
	ID int64 `json:"id"`
}

type NewConversationCtxResponse struct {
	ID        int64 `json:"id"`
	SectionID int64 `json:"section_id"`
}

type GetCurrent = conversation.GetCurrent

type ListMeta struct {
	UserID      int64              `json:"user_id"`
	ConnectorID int64              `json:"connector_id"`
	Scene       conversation.Scene `json:"scene"`
	AgentID     int64              `json:"agent_id"`
	Limit       int                `json:"limit"`
	Page        int                `json:"page"`
}
