package agentflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/components/tool/utils"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/variables"
	"code.byted.org/flow/opencoze/backend/api/model/kvmemory"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossvariables"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type variableConf struct {
	Agent       *entity.SingleAgent
	UserID      string
	ConnectorID int64
}

func loadAgentVariables(ctx context.Context, vc *variableConf) (map[string]string, error) {
	vbs := make(map[string]string)

	vb, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        conv.Int64ToStr(vc.Agent.AgentID),
		Version:      vc.Agent.Version,
		ConnectorUID: vc.UserID,
		ConnectorID:  vc.ConnectorID,
	}, nil)

	if err != nil {
		return nil, err
	}
	if vb != nil {
		for _, v := range vb {
			vbs[v.Keyword] = v.Value
		}
	}
	return vbs, nil
}

func newAgentVariableTools(ctx context.Context, v *variableConf) ([]tool.InvokableTool, error) {
	tools := make([]tool.InvokableTool, 0, 1)
	a := &avTool{
		Agent:       v.Agent,
		UserID:      v.UserID,
		ConnectorID: v.ConnectorID,
	}

	desc := "When user needs to set variables, call this tool."
	at, err := utils.InferTool("setKeywordMemory", desc, a.Invoke)
	if err != nil {
		return nil, err
	}
	tools = append(tools, at)
	return tools, nil
}

type avTool struct {
	Agent       *entity.SingleAgent
	UserID      string
	ConnectorID int64
}

func (a *avTool) Invoke(ctx context.Context, v map[string]string) (string, error) {

	vbMeta := &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        conv.Int64ToStr(a.Agent.AgentID),
		Version:      a.Agent.Version,
		ConnectorUID: a.UserID,
		ConnectorID:  a.ConnectorID,
	}

	var items []*kvmemory.KVItem
	if v != nil {
		for keyword, value := range v {
			items = append(items, &kvmemory.KVItem{
				Keyword: keyword,
				Value:   value,
			})
		}
		_, err := crossvariables.DefaultSVC().SetVariableInstance(ctx, vbMeta, items)
		if err != nil {
			logs.CtxErrorf(ctx, "setVariableInstance failed, err=%v", err)
			return "fail", nil
		}
	}

	return "success", nil
}
