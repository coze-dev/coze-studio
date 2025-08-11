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
	"encoding/json"

	"github.com/google/uuid"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/agentrun"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	crossplugin "github.com/coze-dev/coze-studio/backend/crossdomain/contract/plugin"
	crossworkflow "github.com/coze-dev/coze-studio/backend/crossdomain/contract/workflow"
	pluginEntity "github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/service"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
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
				plugin.WithInvalidRespProcessStrategy(plugin.InvalidResponseProcessStrategyOfReturnDefault),
				plugin.WithProjectInfo(&plugin.ProjectInfo{
					ProjectID:      ar.Identity.AgentID,
					ProjectType:    plugin.ProjectTypeOfAgent,
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
			execResp, _, err := crossworkflow.DefaultSVC().SyncExecuteWorkflow(ctx, vo.ExecuteConfig{
				ID:           item.PluginID,
				ConnectorID:  ar.Identity.ConnectorID,
				ConnectorUID: ar.UserID,
				TaskType:     crossworkflow.TaskTypeForeground,
				AgentID:      ptr.Of(ar.Identity.AgentID),
				Mode: func() crossworkflow.ExecuteMode {
					if ar.Identity.IsDraft {
						return crossworkflow.ExecuteModeDebug
					} else {
						return crossworkflow.ExecuteModeRelease
					}
				}(),
			}, input)

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
