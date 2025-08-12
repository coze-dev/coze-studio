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
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	crossplugin "github.com/coze-dev/coze-studio/backend/crossdomain/contract/plugin"
	pluginEntity "github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/service"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

type toolConfig struct {
	spaceID       int64
	userID        string
	agentIdentity *entity.AgentIdentity
	toolConf      []*bot_common.PluginInfo
}

func newPluginTools(ctx context.Context, conf *toolConfig) ([]tool.InvokableTool, error) {
	req := &service.MGetAgentToolsRequest{
		SpaceID: conf.spaceID,
		AgentID: conf.agentIdentity.AgentID,
		IsDraft: conf.agentIdentity.IsDraft,
		VersionAgentTools: slices.Transform(conf.toolConf, func(a *bot_common.PluginInfo) pluginEntity.VersionAgentTool {
			return pluginEntity.VersionAgentTool{
				ToolID:       a.GetApiId(),
				AgentVersion: ptr.Of(conf.agentIdentity.Version),
			}
		}),
	}
	agentTools, err := crossplugin.DefaultSVC().MGetAgentTools(ctx, req)
	if err != nil {
		return nil, err
	}

	projectInfo := &plugin.ProjectInfo{
		ProjectID:      conf.agentIdentity.AgentID,
		ProjectType:    plugin.ProjectTypeOfAgent,
		ProjectVersion: ptr.Of(conf.agentIdentity.Version),
		ConnectorID:    conf.agentIdentity.ConnectorID,
	}

	tools := make([]tool.InvokableTool, 0, len(agentTools))
	for _, ti := range agentTools {
		tools = append(tools, &pluginInvokableTool{
			userID:      conf.userID,
			isDraft:     conf.agentIdentity.IsDraft,
			projectInfo: projectInfo,
			toolInfo:    ti,
		})
	}

	return tools, nil
}

type pluginInvokableTool struct {
	userID      string
	isDraft     bool
	toolInfo    *pluginEntity.ToolInfo
	projectInfo *plugin.ProjectInfo
}

func (p *pluginInvokableTool) Info(ctx context.Context) (*schema.ToolInfo, error) {
	paramInfos, err := p.toolInfo.Operation.ToEinoSchemaParameterInfo(ctx)
	if err != nil {
		return nil, err
	}

	if len(paramInfos) == 0 {
		return &schema.ToolInfo{
			Name:        p.toolInfo.GetName(),
			Desc:        p.toolInfo.GetDesc(),
			ParamsOneOf: nil,
		}, nil
	}

	return &schema.ToolInfo{
		Name:        p.toolInfo.GetName(),
		Desc:        p.toolInfo.GetDesc(),
		ParamsOneOf: schema.NewParamsOneOfByParams(paramInfos),
	}, nil
}

func (p *pluginInvokableTool) InvokableRun(ctx context.Context, argumentsInJSON string, _ ...tool.Option) (string, error) {
	req := &service.ExecuteToolRequest{
		UserID:          p.userID,
		PluginID:        p.toolInfo.PluginID,
		ToolID:          p.toolInfo.ID,
		ExecDraftTool:   false,
		ArgumentsInJson: argumentsInJSON,
		ExecScene: func() plugin.ExecuteScene {
			if p.isDraft {
				return plugin.ExecSceneOfDraftAgent
			}
			return plugin.ExecSceneOfOnlineAgent
		}(),
	}

	opts := []pluginEntity.ExecuteToolOpt{
		plugin.WithInvalidRespProcessStrategy(plugin.InvalidResponseProcessStrategyOfReturnDefault),
		plugin.WithToolVersion(p.toolInfo.GetVersion()),
		plugin.WithProjectInfo(p.projectInfo),
	}

	resp, err := crossplugin.DefaultSVC().ExecuteTool(ctx, req, opts...)
	if err != nil {
		return "", err
	}

	return resp.TrimmedResp, nil
}
