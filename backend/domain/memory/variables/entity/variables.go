package entity

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/api/model/agent_common"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
)

type VariablesMeta struct {
	ID        int64
	CreatorID int64
	BizType   int32
	BizID     string
	CreatedAt int64
	UpdatedAt int64
	Version   string
	Variables []*VariableMeta
}

func NewVariablesWithAgentVariables(vars []*agent_common.Variable) *VariablesMeta {
	res := make([]*VariableMeta, 0)
	for _, variable := range vars {
		res = append(res, agentVariableMetaToProjectVariableMeta(variable))
	}
	return &VariablesMeta{
		Variables: res,
	}
}

func NewVariables(vars []*project_memory.Variable) *VariablesMeta {
	res := make([]*VariableMeta, 0)
	for _, variable := range vars {
		res = append(res, &VariableMeta{
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
	return &VariablesMeta{
		Variables: res,
	}
}

func (v *VariableMeta) ToProjectVariable() *project_memory.Variable {
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

func (v *VariablesMeta) ToAgentVariables() []*agent_common.Variable {
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

func (v *VariablesMeta) ToProjectVariables() []*project_memory.Variable {
	res := make([]*project_memory.Variable, 0, len(v.Variables))
	for _, v := range v.Variables {
		res = append(res, v.ToProjectVariable())
	}
	return res
}

func (v *VariablesMeta) SetupIsReadOnly(ctx context.Context) {
	for _, variable := range v.Variables {
		if variable.Channel == project_memory.VariableChannel_Feishu ||
			variable.Channel == project_memory.VariableChannel_Location ||
			variable.Channel == project_memory.VariableChannel_System {
			variable.IsReadOnly = true
		}
	}
}

func (v *VariablesMeta) SetupSchema(ctx context.Context) {
	for _, variable := range v.Variables {
		if variable.Schema == "" {
			variable.Schema = fmt.Sprintf(stringSchema, variable.Keyword)
		}
	}
}

func agentVariableMetaToProjectVariableMeta(variable *agent_common.Variable) *VariableMeta {
	temp := &VariableMeta{
		Keyword:        variable.GetKey(),
		DefaultValue:   variable.GetDefaultValue(),
		VariableType:   project_memory.VariableType_KVVariable,
		Description:    variable.GetDescription(),
		Enable:         !variable.GetIsDisabled(),
		Schema:         fmt.Sprintf(stringSchema, variable.Key),
		PromptDisabled: variable.GetPromptDisabled(),
	}
	if variable.GetIsSystem() {
		temp.IsReadOnly = true
		temp.Channel = project_memory.VariableChannel_System
	} else {
		temp.Channel = project_memory.VariableChannel_Custom
	}
	return temp
}

func (v *VariablesMeta) GroupByChannel() map[project_memory.VariableChannel][]*project_memory.Variable {
	res := make(map[project_memory.VariableChannel][]*project_memory.Variable)
	for _, variable := range v.Variables {
		ch := variable.Channel
		res[ch] = append(res[ch], variable.ToProjectVariable())
	}

	return res
}

func (v *VariablesMeta) RemoveDisableVariable() {
	var res []*VariableMeta
	for _, vv := range v.Variables {
		if vv.Enable {
			res = append(res, vv)
		}
	}

	v.Variables = res
}

func (v *VariablesMeta) RemoveVariableWithChannel(ch project_memory.VariableChannel) {
	var res []*VariableMeta
	for _, vv := range v.Variables {
		if vv.Channel == ch {
			continue
		}

		res = append(res, vv)
	}

	v.Variables = res
}
