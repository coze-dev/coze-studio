package agentflow

import (
	"context"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossplugin"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
)

type toolPreCallConf struct {
}

func newPreToolRetriever(conf *toolPreCallConf) *toolPreCallConf {
	return &toolPreCallConf{}
}

func (pr *toolPreCallConf) toolPreRetrieve(ctx context.Context, ar *AgentRequest) ([]*schema.Message, error) {

	if len(ar.PreCallTools) == 0 {
		return nil, nil
	}

	var tms []*schema.Message
	for _, item := range ar.PreCallTools {
		execResp, err := crossplugin.DefaultSVC().ExecuteTool(ctx, &service.ExecuteToolRequest{
			PluginID:        item.PluginID,
			ToolID:          item.ToolID,
			ArgumentsInJson: item.Arguments,
			ExecScene: func(toolType entity.ToolType) consts.ExecuteScene {
				switch toolType {
				case entity.ToolTypeOfWorkflow:
					return consts.ExecSceneOfWorkflow
				case entity.ToolTypeOfPlugin:
					return consts.ExecSceneOfToolDebug
				}
				return consts.ExecSceneOfToolDebug
			}(item.Type),
		})
		if err != nil {
			return nil, err
		}

		if execResp != nil && execResp.TrimmedResp != "" {
			tms = append(tms, &schema.Message{
				Role: schema.Assistant,
				ToolCalls: []schema.ToolCall{
					{
						Type: "function",
						Function: schema.FunctionCall{
							Name:      item.ToolName,
							Arguments: item.Arguments,
						},
					},
				},
			})

			tms = append(tms, &schema.Message{
				Role:    schema.Tool,
				Content: execResp.TrimmedResp,
			})
		}
	}

	return tms, nil
}
