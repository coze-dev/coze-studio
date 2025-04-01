package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/common"
	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"
	"github.com/cloudwego/eino/schema"
)

type SingleAgent struct {
	common.Info

	State     AgentState
	Prompt    *model.Prompt
	Model     *model.ModelInfo
	Workflows *model.Workflow
	Plugins   *model.Plugin
	Knowledge *model.Knowledge

	SuggestReply *model.SuggestReply
	JumpConfig   *model.JumpConfig
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
