package entity

import (
	"context"
	"fmt"
	"strings"

	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/internal/dal/model"
)

type ProjectVariable struct {
	*model.VariablesMeta // TODO: 后面再改成字段逐一赋值
}

type Variables struct {
	Variables []*project_memory.Variable
}

type Variable struct {
	*project_memory.Variable

	EnablePromptRender bool // prompt 渲染是否使用
	Disabled           bool // 全场景禁用
}

func NewVariables(vars []*project_memory.Variable) *Variables {
	return &Variables{
		Variables: vars,
	}
}

func (v *Variables) FilterLocalChannel(ctx context.Context) {
	var res []*project_memory.Variable
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
