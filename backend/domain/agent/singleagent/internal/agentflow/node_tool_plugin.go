package agentflow

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	pluginEntity "code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type toolConfig struct {
	spaceID int64
	agentID int64
	isDraft bool

	toolConf []*bot_common.PluginInfo

	svr crossdomain.PluginService
}

func newPluginTools(ctx context.Context, conf *toolConfig) ([]tool.InvokableTool, error) {
	req := &service.MGetAgentToolsRequest{
		SpaceID: conf.spaceID,
		AgentID: conf.agentID,
		IsDraft: conf.isDraft,
		VersionAgentTools: slices.Transform(conf.toolConf, func(a *bot_common.PluginInfo) pluginEntity.VersionAgentTool {
			return pluginEntity.VersionAgentTool{
				ToolID:    a.GetApiId(),
				VersionMS: a.ApiVersionMs,
			}
		}),
	}
	resp, err := conf.svr.MGetAgentTools(ctx, req)
	if err != nil {
		return nil, err
	}

	toolConf := slices.ToMap(conf.toolConf, func(a *bot_common.PluginInfo) (int64, *bot_common.PluginInfo) {
		return a.GetApiId(), a
	})

	tools := make([]tool.InvokableTool, 0, len(resp.Tools))
	for _, ti := range resp.Tools {
		tc, ok := toolConf[ti.ID]
		if !ok {
			return nil, fmt.Errorf("tool '%d' not found", ti.ID)
		}
		tools = append(tools, &pluginInvokableTool{
			isDraft:          conf.isDraft,
			agentID:          conf.agentID,
			spaceID:          conf.spaceID,
			agentToolVersion: tc.ApiVersionMs,
			toolInfo:         ti,
			svr:              conf.svr,
		})
	}

	return tools, nil
}

type pluginInvokableTool struct {
	isDraft          bool
	agentID          int64
	spaceID          int64
	agentToolVersion *int64
	toolInfo         *pluginEntity.ToolInfo
	svr              crossdomain.PluginService
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
		ExecScene: func() consts.ExecuteScene {
			if p.isDraft {
				return consts.ExecSceneOfAgentDraft
			}
			return consts.ExecSceneOfAgentOnline
		}(),
		PluginID:        p.toolInfo.PluginID,
		ToolID:          p.toolInfo.ID,
		ArgumentsInJson: argumentsInJSON,
	}

	opts := []pluginEntity.ExecuteToolOpts{
		pluginEntity.WithAgentID(p.agentID),
		pluginEntity.WithSpaceID(p.spaceID),
		pluginEntity.WithVersion(p.toolInfo.GetVersion()),
	}
	if !p.isDraft && p.agentToolVersion != nil {
		opts = append(opts, pluginEntity.WithAgentToolVersion(*p.agentToolVersion))
	}

	resp, err := p.svr.ExecuteTool(ctx, req, opts...)
	if err != nil {
		return "", err
	}

	return resp.TrimmedResp, nil
}
