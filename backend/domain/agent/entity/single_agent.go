package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/common"
)

type ReactAgent struct {
	common.Info

	Prompt    *Prompt
	Model     *Model
	Workflows []*Workflow
	Plugins   []*Plugin
	Knowledge *Knowledge
	Memory    *Memory
}
