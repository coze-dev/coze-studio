package entity

import (
	"context"
	"fmt"
	"strings"

	"code.byted.org/flow/opencoze/backend/api/model/agent_common"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
)

type Variables struct {
	Variables []*Variable
}

type Variable struct {
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
	PromptDisabled          bool
	SocietyVisibilityConfig *agent_common.SocietyVisibiltyConfig
}

func (v *Variable) ToProjectVariable() *project_memory.Variable {
	return &project_memory.Variable{
		Keyword:              v.Keyword,
		DefaultValue:         v.DefaultValue,
		VariableType:         v.VariableType,
		Channel:              v.Channel,
		Description:          v.Description,
		Enable:               v.Enable,
		EffectiveChannelList: v.EffectiveChannelList,
		Schema:               v.Schema,
		IsReadOnly:           v.IsReadOnly,
	}
}

func NewVariables(vars []*project_memory.Variable) *Variables {
	res := make([]*Variable, 0)
	for _, variable := range vars {
		res = append(res, &Variable{
			Keyword:              variable.Keyword,
			DefaultValue:         variable.DefaultValue,
			VariableType:         variable.VariableType,
			Channel:              variable.Channel,
			Description:          variable.Description,
			Enable:               variable.Enable,
			EffectiveChannelList: variable.EffectiveChannelList,
			Schema:               variable.Schema,
			IsReadOnly:           variable.IsReadOnly,
		})
	}
	return &Variables{
		Variables: res,
	}
}

func agentVariableMetaToProjectVariableMeta(variable *agent_common.Variable) *Variable {
	temp := &Variable{
		Keyword:                 variable.GetKey(),
		DefaultValue:            variable.GetDefaultValue(),
		VariableType:            project_memory.VariableType_KVVariable,
		Description:             variable.GetDescription(),
		Enable:                  !variable.GetIsDisabled(),
		Schema:                  fmt.Sprintf(stringSchema, variable.Key),
		PromptDisabled:          variable.GetPromptDisabled(),
		SocietyVisibilityConfig: variable.GetSocietyVisibilityConfig(),
	}
	if variable.GetIsSystem() {
		temp.IsReadOnly = true
		temp.Channel = project_memory.VariableChannel_System
	} else {
		temp.Channel = project_memory.VariableChannel_Custom
	}
	return temp
}

func (v *Variables) ToAgentVariables() []*agent_common.Variable {
	res := make([]*agent_common.Variable, 0, len(v.Variables))
	for _, v := range v.Variables {
		isSystem := v.Channel == project_memory.VariableChannel_System
		agentVariable := &agent_common.Variable{
			Key:          &v.Keyword,
			DefaultValue: &v.DefaultValue,
			Description:  &v.Description,
			IsDisabled:   &v.Enable,
			IsSystem:     &isSystem,
		}

		res = append(res, agentVariable)
	}

	return res
}

func (v *Variables) ToProjectVariables() []*project_memory.Variable {
	res := make([]*project_memory.Variable, 0, len(v.Variables))
	for _, v := range v.Variables {
		res = append(res, v.ToProjectVariable())
	}
	return res
}

func NewVariablesWithAgentVariables(vars []*agent_common.Variable) *Variables {
	res := make([]*Variable, 0)
	for _, variable := range vars {
		res = append(res, agentVariableMetaToProjectVariableMeta(variable))
	}
	return &Variables{
		Variables: res,
	}
}

func (v *Variables) FilterLocalChannel(ctx context.Context) {
	var res []*Variable
	for _, vv := range v.Variables {
		ch := v.genChannelFromName(vv.Keyword)
		if ch == project_memory.VariableChannel_Location {
			continue
		}
		res = append(res, vv)
	}

	v.Variables = res
}

func (v *Variables) SetupIsReadOnly(ctx context.Context) {
	for _, variable := range v.Variables {
		if variable.Channel == project_memory.VariableChannel_Feishu ||
			variable.Channel == project_memory.VariableChannel_Location ||
			variable.Channel == project_memory.VariableChannel_System {
			variable.IsReadOnly = true
		}
	}
}

func (v *Variables) SetupSchema(ctx context.Context) {
	for _, variable := range v.Variables {
		if variable.Schema == "" {
			variable.Schema = fmt.Sprintf(stringSchema, variable.Keyword)
		}
	}
}

func (v *Variables) genChannelFromName(name string) project_memory.VariableChannel {
	if strings.Contains(name, "lark") {
		return project_memory.VariableChannel_Feishu
	} else if strings.Contains(name, "lon") || strings.Contains(name, "lat") {
		return project_memory.VariableChannel_Location
	}
	return project_memory.VariableChannel_System
}

func (v *Variables) FilterFalseEnable(ctx context.Context) {
	var res []*Variable
	for _, vv := range v.Variables {
		if vv.Enable {
			res = append(res, vv)
		}
	}

	v.Variables = res
}

func (v *Variables) GroupByChannel() map[project_memory.VariableChannel][]*project_memory.Variable {
	res := make(map[project_memory.VariableChannel][]*project_memory.Variable)
	for _, variable := range v.Variables {
		ch := variable.Channel
		res[ch] = append(res[ch], variable.ToProjectVariable())
	}

	return res
}
