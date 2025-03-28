package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/common"
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
