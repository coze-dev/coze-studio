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

package impl

import (
	"context"

	"github.com/cloudwego/eino/schema"

	crossagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent"
	model "github.com/coze-dev/coze-studio/backend/crossdomain/agent/model"
	agentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun/model"
	singleagent "github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/service"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

var defaultSVC crossagent.SingleAgent

type impl struct {
	DomainSVC singleagent.SingleAgent
}

func InitDomainService(c singleagent.SingleAgent) crossagent.SingleAgent {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (c *impl) StreamExecute(ctx context.Context, agentRuntime *crossagent.AgentRuntime,
) (*schema.StreamReader[*model.AgentEvent], error) {

	singleAgentStreamExecReq := c.buildSingleAgentStreamExecuteReq(ctx, agentRuntime)

	streamEvent, err := c.DomainSVC.StreamExecute(ctx, singleAgentStreamExecReq)
	logs.CtxInfof(ctx, "agent StreamExecute req:%v, streamEvent:%v, err:%v", conv.DebugJsonToStr(singleAgentStreamExecReq), streamEvent, err)
	return streamEvent, err
}

func (c *impl) buildSingleAgentStreamExecuteReq(ctx context.Context, agentRuntime *crossagent.AgentRuntime,
) *model.ExecuteRequest {

	return &model.ExecuteRequest{
		Identity:        c.buildIdentity(agentRuntime),
		Input:           agentRuntime.Input,
		History:         agentRuntime.HistoryMsg,
		UserID:          agentRuntime.UserID,
		CustomVariables: agentRuntime.CustomVariables,
		PreCallTools: slices.Transform(agentRuntime.PreRetrieveTools, func(tool *agentrun.Tool) *agentrun.ToolsRetriever {
			return &agentrun.ToolsRetriever{
				PluginID:  tool.PluginID,
				ToolName:  tool.ToolName,
				ToolID:    tool.ToolID,
				Arguments: tool.Arguments,
				Type: func(toolType agentrun.ToolType) agentrun.ToolType {
					switch toolType {
					case agentrun.ToolTypeWorkflow:
						return agentrun.ToolTypeWorkflow
					case agentrun.ToolTypePlugin:
						return agentrun.ToolTypePlugin
					}
					return agentrun.ToolTypePlugin
				}(tool.Type),
				PluginFrom: tool.PluginFrom,
			}
		}),
		ResumeInfo: agentRuntime.ResumeInfo,

		ConversationID: agentRuntime.ConversationId,
	}
}

func (c *impl) buildIdentity(agentRuntime *crossagent.AgentRuntime) *model.AgentIdentity {
	return &model.AgentIdentity{
		AgentID:     agentRuntime.AgentID,
		Version:     agentRuntime.AgentVersion,
		IsDraft:     agentRuntime.IsDraft,
		ConnectorID: agentRuntime.ConnectorID,
	}
}

func (c *impl) ObtainAgentByIdentity(ctx context.Context, identity *model.AgentIdentity) (*model.SingleAgent, error) {
	agentInfo, err := c.DomainSVC.ObtainAgentByIdentity(ctx, identity)
	if err != nil {
		return nil, err
	}
	if agentInfo == nil {
		return nil, nil
	}
	return agentInfo.SingleAgent, nil
}
