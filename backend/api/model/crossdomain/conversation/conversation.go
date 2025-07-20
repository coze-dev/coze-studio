package conversation

import "github.com/coze-dev/coze-studio/backend/api/model/conversation/common"

type GetCurrent struct {
	UserID      int64        `json:"user_id"`
	Scene       common.Scene `json:"scene"`
	AgentID     int64        `json:"agent_id"`
	ConnectorID int64        `json:"connector_id"`
}

type Scene int32

const (
	SceneDefault           Scene = 0
	SceneExplore           Scene = 1
	SceneBotStore          Scene = 2
	SceneCozeHome          Scene = 3
	ScenePlayground        Scene = 4
	SceneEvaluation        Scene = 5
	SceneAgentAPP          Scene = 6
	ScenePromptOptimize    Scene = 7
	SceneGenerateAgentInfo Scene = 8
	SceneOpenApi           Scene = 9
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

type ConversationStatus int32

const (
	ConversationStatusNormal  ConversationStatus = 1
	ConversationStatusDeleted ConversationStatus = 2
)
