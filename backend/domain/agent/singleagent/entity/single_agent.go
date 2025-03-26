package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/common"
)

type SingleAgent struct {
	common.Info

	Prompt    *model.Prompt
	Model     *model.ModelInfo
	Workflows *model.Workflow
	Plugins   *model.Plugins
	Knowledge *model.Knowledge

	SuggestReply *model.SuggestReply
	JumpConfig   *model.JumpConfig
}
