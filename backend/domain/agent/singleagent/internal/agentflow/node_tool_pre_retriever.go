package agentflow

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/agentrun"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossplugin"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossworkflow"
	pluginEntity "code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	workflowEntity "code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type toolPreCallConf struct{}

func newPreToolRetriever(conf *toolPreCallConf) *toolPreCallConf {
	return &toolPreCallConf{}
}

func (pr *toolPreCallConf) toolPreRetrieve(ctx context.Context, ar *AgentRequest) ([]*schema.Message, error) {
	if len(ar.PreCallTools) == 0 {
		return nil, nil
	}

	var tms []*schema.Message
	for _, item := range ar.PreCallTools {

		var toolResp string
		switch item.Type {
		case agentrun.ToolTypePlugin:

			etr := &service.ExecuteToolRequest{
				UserID:          ar.UserID,
				ExecDraftTool:   false,
				PluginID:        item.PluginID,
				ToolID:          item.ToolID,
				ArgumentsInJson: item.Arguments,
				ExecScene: func(isDraft bool) plugin.ExecuteScene {
					if isDraft {
						return plugin.ExecSceneOfDraftAgent
					} else {
						return plugin.ExecSceneOfOnlineAgent
					}
				}(ar.Identity.IsDraft),
			}

			opts := []pluginEntity.ExecuteToolOpt{
				plugin.WithProjectInfo(&plugin.ProjectInfo{
					ProjectID:      ar.Identity.AgentID,
					ProjectType:    plugin.ProjectTypeOfBot,
					ProjectVersion: ptr.Of(ar.Identity.Version),
				}),
			}
			execResp, err := crossplugin.DefaultSVC().ExecuteTool(ctx, etr, opts...)
			if err != nil {
				return nil, err
			}
			toolResp = execResp.TrimmedResp

		case agentrun.ToolTypeWorkflow:
			var input map[string]any
			err := json.Unmarshal([]byte(item.Arguments), &input)
			if err != nil {
				logs.CtxErrorf(ctx, "Failed to unmarshal json arguments: %s", item.Arguments)
				return nil, err
			}
			execResp, _, err := crossworkflow.DefaultSVC().SyncExecuteWorkflow(ctx, &workflowEntity.WorkflowIdentity{
				ID: item.PluginID,
			}, input, vo.ExecuteConfig{
				ConnectorID:  ar.Identity.ConnectorID,
				ConnectorUID: ar.UserID,
				TaskType:     vo.TaskTypeForeground,
				AgentID:      ptr.Of(ar.Identity.AgentID),
				Mode: func() vo.ExecuteMode {
					if ar.Identity.IsDraft {
						return vo.ExecuteModeDebug
					} else {
						return vo.ExecuteModeRelease
					}
				}(),
			})

			if err != nil {
				return nil, err
			}
			toolResp = ptr.From(execResp.Output)
		}

		if toolResp != "" {
			uID := uuid.New()
			toolCallID := "call_" + uID.String()
			tms = append(tms, &schema.Message{
				Role: schema.Assistant,
				ToolCalls: []schema.ToolCall{
					{
						Type: "function",
						Function: schema.FunctionCall{
							Name:      item.ToolName,
							Arguments: item.Arguments,
						},
						ID: toolCallID,
					},
				},
			})

			tms = append(tms, &schema.Message{
				Role:       schema.Tool,
				Content:    toolResp,
				ToolCallID: toolCallID,
			})
		}
	}

	return tms, nil
}
