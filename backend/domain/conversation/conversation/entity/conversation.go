package entity

type Conversation struct {
	ID          int64  `json:"id"`
	SectionID   int64  `json:"section_id"`
	AgentID     int64  `json:"agent_id"`
	ConnectorID int64  `json:"connector_id"`
	CreatorID   int64  `json:"creator_id"`
	Ext         string `json:"ext"`
	CreatedAt   int64  `json:"created_at"`
	UpdatedAt   int64  `json:"updated_at"`
}

type CreateRequest struct {
	AgentID     int64  `json:"agent_id"`
	CreatorID   int64  `json:"creator_id"`
	ConnectorID int64  `json:"connector_id"`
	Ext         string `json:"ext"`
}

type CreateResponse struct {
	ID int64 `json:"id"`
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
