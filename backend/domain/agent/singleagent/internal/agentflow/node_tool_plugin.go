package agentflow

import (
	"context"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossplugin"
	pluginEntity "code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type toolConfig struct {
	spaceID       int64
	userID        int64
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
		ProjectType:    plugin.ProjectTypeOfBot,
		ProjectVersion: ptr.Of(conf.agentIdentity.Version),
		ConnectorID:    conf.agentIdentity.ConnectorID,
		UserID:         conf.userID,
	}

	tools := make([]tool.InvokableTool, 0, len(agentTools))
	for _, ti := range agentTools {
		tools = append(tools, &pluginInvokableTool{
			isDraft:     conf.agentIdentity.IsDraft,
			projectInfo: projectInfo,
			toolInfo:    ti,
		})
	}

	return tools, nil
}

type pluginInvokableTool struct {
	isDraft     bool
	toolInfo    *pluginEntity.ToolInfo
	projectInfo *plugin.ProjectInfo
}

func (p *pluginInvokableTool) Info(ctx context.Context) (*schema.ToolInfo, error) {
	paramInfos, err := p.toolInfo.Operation.ToEinoSchemaParameterInfo()
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
		ExecScene: func() plugin.ExecuteScene {
			if p.isDraft {
				return plugin.ExecSceneOfDraftAgent
			}
			return plugin.ExecSceneOfOnlineAgent
		}(),
		PluginID:        p.toolInfo.PluginID,
		ToolID:          p.toolInfo.ID,
		ArgumentsInJson: argumentsInJSON,
	}
	opts := []pluginEntity.ExecuteToolOpt{
		plugin.WithToolVersion(p.toolInfo.GetVersion()),
		plugin.WithProjectInfo(p.projectInfo),
	}

	resp, err := crossplugin.DefaultSVC().ExecuteTool(ctx, req, opts...)
	if err != nil {
		return "", err
	}

	return resp.TrimmedResp, nil
}
