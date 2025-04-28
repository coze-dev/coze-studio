package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
)

type VariableMeta struct {
	Keyword              string
	DefaultValue         string
	VariableType         project_memory.VariableType
	Channel              project_memory.VariableChannel
	Description          string
	Enable               bool
	EffectiveChannelList []string
	Schema               string
	IsReadOnly           bool

	// 以下字段为agent侧字段
	PromptDisabled bool
}
