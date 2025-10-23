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

// TODO(fanlv):  remove pluginEntity
import (
	"context"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	crossplugin "github.com/coze-dev/coze-studio/backend/crossdomain/plugin"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	pluginEntity "github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

type toolConfig struct {
	spaceID       int64
	userID        string
	agentIdentity *entity.AgentIdentity
	toolConf      []*bot_common.PluginInfo

	conversationID int64
}

func newPluginTools(ctx context.Context, conf *toolConfig) ([]tool.InvokableTool, error) {
	req := &model.MGetAgentToolsRequest{
		SpaceID: conf.spaceID,
		AgentID: conf.agentIdentity.AgentID,
		IsDraft: conf.agentIdentity.IsDraft,
		VersionAgentTools: slices.Transform(conf.toolConf, func(a *bot_common.PluginInfo) model.VersionAgentTool {
			return model.VersionAgentTool{
				ToolID:       a.GetApiId(),
				AgentVersion: ptr.Of(conf.agentIdentity.Version),
				PluginFrom:   a.PluginFrom,
				PluginID:     a.GetPluginId(),
			}
		}),
	}
	agentTools, err := crossplugin.DefaultSVC().MGetAgentTools(ctx, req)
	if err != nil {
		return nil, err
	}

	projectInfo := &model.ProjectInfo{
		ProjectID:      conf.agentIdentity.AgentID,
		ProjectType:    consts.ProjectTypeOfAgent,
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
			pluginFrom:  ti.Source,

			conversationID: conf.conversationID,
		})
	}

	return tools, nil
}

type pluginInvokableTool struct {
	userID      string
	isDraft     bool
	toolInfo    *pluginEntity.ToolInfo
	projectInfo *model.ProjectInfo

	pluginFrom *bot_common.PluginFrom

	conversationID int64
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
	req := &model.ExecuteToolRequest{
		UserID:          p.userID,
		PluginID:        p.toolInfo.PluginID,
		ToolID:          p.toolInfo.ID,
		ExecDraftTool:   false,
		PluginFrom:      p.pluginFrom,
		ArgumentsInJson: argumentsInJSON,
		ExecScene: func() consts.ExecuteScene {
			if p.isDraft {
				return consts.ExecSceneOfDraftAgent
			}
			return consts.ExecSceneOfOnlineAgent
		}(),
	}

	opts := []model.ExecuteToolOpt{
		model.WithInvalidRespProcessStrategy(consts.InvalidResponseProcessStrategyOfReturnDefault),
		model.WithToolVersion(p.toolInfo.GetVersion()),
		model.WithProjectInfo(p.projectInfo),
		model.WithPluginHTTPHeader(p.conversationID),
	}

	resp, err := crossplugin.DefaultSVC().ExecuteTool(ctx, req, opts...)
	if err != nil {
		return "", err
	}

	return resp.TrimmedResp, nil
}
