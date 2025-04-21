package entity

import (
	"context"
	"fmt"
	"strings"

	"code.byted.org/flow/opencoze/backend/api/model/memory_common"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/internal/dal/model"
)

type ProjectVariable struct {
	*model.VariablesMeta // TODO: 后面再改成字段逐一赋值
}

type Variables struct {
	Variables []*memory_common.Variable
}

type Variable struct {
	*memory_common.Variable

	EnablePromptRender bool // prompt 渲染是否使用
	Disabled           bool // 全场景禁用
}

func NewVariables(vars []*memory_common.Variable) *Variables {
	return &Variables{
		Variables: vars,
	}
}

func (v *Variables) FilterLocalChannel(ctx context.Context) {
	var res []*memory_common.Variable
	for _, vv := range v.Variables {
		ch := v.genChannelFromName(vv.Keyword)
		if ch == memory_common.VariableChannel_Location {
			continue
		}
		res = append(res, vv)
	}

	v.Variables = res
}

func (v *Variables) SetupIsReadOnly(ctx context.Context) {
	for _, variable := range v.Variables {
		if variable.Channel == memory_common.VariableChannel_Feishu ||
			variable.Channel == memory_common.VariableChannel_Location ||
			variable.Channel == memory_common.VariableChannel_System {
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

func (v *Variables) genChannelFromName(name string) memory_common.VariableChannel {
	if strings.Contains(name, "lark") {
		return memory_common.VariableChannel_Feishu
	} else if strings.Contains(name, "lon") || strings.Contains(name, "lat") {
		return memory_common.VariableChannel_Location
	}
	return memory_common.VariableChannel_System
}
