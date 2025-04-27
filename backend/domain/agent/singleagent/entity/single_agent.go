package entity

import (
	"github.com/cloudwego/eino/schema"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"
)

type SingleAgent struct {
	ID          int64
	AgentID     int64
	DeveloperID int64
	SpaceID     int64
	Name        string
	Desc        string
	IconURI     string
	CreatedAt   int64
	UpdatedAt   int64
	DeletedAt   gorm.DeletedAt

	State           AgentState
	VariablesMetaID *int64
	OnboardingInfo  *bot_common.OnboardingInfo
	ModelInfo       *bot_common.ModelInfo
	Prompt          *bot_common.PromptInfo
	Plugin          []*bot_common.PluginInfo
	Knowledge       *bot_common.Knowledge
	Workflow        []*bot_common.WorkflowInfo
	SuggestReply    *bot_common.SuggestReplyInfo
	JumpConfig      *bot_common.JumpConfig
}

type AgentIdentity struct {
	AgentID int64
	// State   AgentState
	Version string
}

func (a *AgentIdentity) IsDraft() bool {
	return len(a.Version) == 0
}

type PublishAgentRequest struct{}

type PublishAgentResponse struct{}

type QueryAgentRequest struct {
	Identities []*AgentIdentity

	User *userEntity.UserIdentity
}

type QueryAgentResponse struct {
	// Agents []*entity.SingleAgent
}

type ExecuteRequest struct {
	Identity *AgentIdentity
	User     *userEntity.UserIdentity

	Input   *schema.Message
	History []*schema.Message
}

type ExecuteResponse struct {
	Chunk *AgentEvent
}
