package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/dal/model"
)

type SingleAgent struct {
	ID          int64
	Name        string
	Description string

	DeveloperID int64
	SpaceID     int64

	CreateTimeMS int64
	UpdateTimeMS int64
	DeleteTimeMS int64

	Prompt    *model.Prompt
	Model     *model.ModelInfo
	Workflows *model.Workflow
	Plugins   *model.Plugins
	Knowledge *model.Knowledge

	SuggestReply *model.SuggestReply
	JumpConfig   *model.JumpConfig
}
