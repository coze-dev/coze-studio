/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package agentflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/components/tool/utils"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/variables"
	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/kvmemory"
	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/project_memory"
	crossvariables "github.com/coze-dev/coze-studio/backend/crossdomain/contract/variables"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
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
	if len(vb) > 0 {
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

	desc := `
## Skills Conditions
1. When the user's intention is to set a variable and the user provides the variable to be set, call the tool.
2. If the user wants to set a variable but does not provide the variable, do not call the tool.
3. If the user's intention is not to set a variable, do not call the tool.

## Constraints
- Only make decisions regarding tool invocation based on the user's intention and input related to variable setting.
- Do not call the tool in any other situation not meeting the above conditions.
`
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

type KVMeta struct {
	Keyword string `json:"keyword" jsonschema:"required,description=the keyword of memory variable"`
	Value   string `json:"value" jsonschema:"required,description=the value of memory variable"`
}
type KVMemoryVariable struct {
	Data []*KVMeta `json:"data"`
}

func (a *avTool) Invoke(ctx context.Context, v *KVMemoryVariable) (string, error) {

	vbMeta := &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        conv.Int64ToStr(a.Agent.AgentID),
		Version:      a.Agent.Version,
		ConnectorUID: a.UserID,
		ConnectorID:  a.ConnectorID,
	}

	var items []*kvmemory.KVItem
	if v != nil {
		for _, item := range v.Data {
			items = append(items, &kvmemory.KVItem{
				Keyword: item.Keyword,
				Value:   item.Value,
			})
		}
		if len(items) > 0 {
			_, err := crossvariables.DefaultSVC().SetVariableInstance(ctx, vbMeta, items)
			if err != nil {
				logs.CtxErrorf(ctx, "setVariableInstance failed, err=%v", err)
				return "fail", nil
			}
		}
	}

	return "success", nil
}
