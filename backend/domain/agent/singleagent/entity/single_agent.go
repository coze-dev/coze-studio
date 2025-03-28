package entity

import (
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/common"
	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"
)

type SingleAgent struct {
	common.Info

	State     AgentState
	Prompt    *Prompt
	Model     *ModelInfo
	Workflows *Workflow
	Plugins   *Plugin
	Knowledge *Knowledge

	SuggestReply *SuggestReply
	JumpConfig   *JumpConfig
}

type AgentIdentity struct {
	AgentID int64
	State   AgentState
	Version string
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
	Chunk *AgentReply
}
