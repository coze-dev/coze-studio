package entity

import (
	"github.com/cloudwego/eino/schema"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/agent_common"
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

	State          AgentState
	Variable       []*agent_common.Variable
	OnboardingInfo *agent_common.OnboardingInfo
	ModelInfo      *agent_common.ModelInfo
	Prompt         *agent_common.PromptInfo
	Plugin         []*agent_common.PluginInfo
	Knowledge      *agent_common.Knowledge
	Workflow       []*agent_common.WorkflowInfo
	SuggestReply   *agent_common.SuggestReplyInfo
	JumpConfig     *agent_common.JumpConfig
}

type AgentIdentity struct {
	AgentID int64
	State   AgentState
	Version string
}

type PublishAgentRequest struct{}

type PublishAgentResponse struct{}

type ExecuteRequest struct {
	Identity *AgentIdentity
	User     *userEntity.UserIdentity

	Input   *schema.Message
	History []*schema.Message
}

type ExecuteResponse struct {
	Chunk *AgentEvent
}
