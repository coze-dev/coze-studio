package service

import (
	"context"
	"fmt"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/tool_executor"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func (p *pluginServiceImpl) ExecuteTool(ctx context.Context, req *ExecuteToolRequest, opts ...entity.ExecuteToolOpt) (resp *ExecuteToolResponse, err error) {
	execOpt := &model.ExecuteToolOption{}
	for _, opt := range opts {
		opt(execOpt)
	}

	config, err := p.buildExecConfig(ctx, req, execOpt)
	if err != nil {
		return nil, err
	}

	executor, err := tool_executor.NewExecutor(ctx, config)
	if err != nil {
		return nil, err
	}

	result, err := executor.Execute(ctx, req.ArgumentsInJson)
	if err != nil {
		return nil, err
	}

	if req.ExecScene == model.ExecSceneOfToolDebug {
		err = p.toolRepo.UpdateDraftTool(ctx, &entity.ToolInfo{
			ID:          req.ToolID,
			DebugStatus: ptr.Of(common.APIDebugStatus_DebugPassed),
		})
		if err != nil {
			return nil, err
		}
	}

	resp = &ExecuteToolResponse{
		Tool:        config.Tool,
		RawResp:     result.RawResp,
		TrimmedResp: result.TrimmedResp,
	}

	return resp, nil
}

func (p *pluginServiceImpl) buildExecConfig(ctx context.Context, req *ExecuteToolRequest, execOpt *model.ExecuteToolOption) (config *tool_executor.ExecutorConfig, err error) {
	var (
		pl *entity.PluginInfo
		tl *entity.ToolInfo
	)
	switch req.ExecScene {
	case model.ExecSceneOfOnlineAgent:
		pl, tl, err = p.getOnlineAgentPluginInfo(ctx, req, execOpt)
	case model.ExecSceneOfDraftAgent:
		pl, tl, err = p.getDraftAgentPluginInfo(ctx, req, execOpt)
	case model.ExecSceneOfToolDebug:
		pl, tl, err = p.getToolDebugPluginInfo(ctx, req, execOpt)
	case model.ExecSceneOfWorkflow:
		pl, tl, err = p.getWorkflowPluginInfo(ctx, req, execOpt)
	default:
		return nil, fmt.Errorf("invalid exec scene")
	}
	if err != nil {
		return nil, err
	}

	config = &tool_executor.ExecutorConfig{
		UserID:                     req.UserID,
		Plugin:                     pl,
		Tool:                       tl,
		ProjectInfo:                execOpt.ProjectInfo,
		InvalidRespProcessStrategy: execOpt.InvalidRespProcessStrategy,
	}

	if execOpt.Operation != nil {
		err = execOpt.Operation.Validate()
		if err != nil {
			return nil, fmt.Errorf("tool operation validates failed, err=%v", err)
		}
		config.Tool.Operation = execOpt.Operation
	}

	return config, nil
}

func (p *pluginServiceImpl) getDraftAgentPluginInfo(ctx context.Context, req *ExecuteToolRequest, execOpt *model.ExecuteToolOption) (onlinePlugin *entity.PluginInfo, onlineTool *entity.ToolInfo, err error) {
	if req.ExecDraftTool {
		return nil, nil, fmt.Errorf("draft tool is not supported in online agent")
	}

	onlineTool, exist, err := p.toolRepo.GetOnlineTool(ctx, req.ToolID)
	if err != nil {
		return nil, nil, err
	}
	if !exist {
		return nil, nil, fmt.Errorf("online tool '%d' not found", req.ToolID)
	}

	agentTool, exist, err := p.toolRepo.GetDraftAgentTool(ctx, execOpt.ProjectInfo.ProjectID, req.ToolID)
	if err != nil {
		return nil, nil, err
	}
	if !exist {
		return nil, nil, fmt.Errorf("agent tool '%d' not found", req.ToolID)
	}

	if execOpt.ToolVersion == "" {
		onlinePlugin, exist, err = p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
		if err != nil {
			return nil, nil, err
		}
		if !exist {
			return nil, nil, fmt.Errorf("online plugin '%d' not found", req.PluginID)
		}
	} else {
		onlinePlugin, exist, err = p.pluginRepo.GetVersionPlugin(ctx, entity.VersionPlugin{
			PluginID: req.PluginID,
			Version:  execOpt.ToolVersion,
		})
		if err != nil {
			return nil, nil, err
		}
		if !exist {
			return nil, nil, fmt.Errorf("plugin '%d' with version '%s' not found", req.PluginID, execOpt.ToolVersion)
		}
	}

	onlineTool, err = mergeAgentToolInfo(ctx, onlineTool, agentTool)
	if err != nil {
		return nil, nil, err
	}

	return onlinePlugin, onlineTool, nil
}

func (p *pluginServiceImpl) getOnlineAgentPluginInfo(ctx context.Context, req *ExecuteToolRequest, execOpt *model.ExecuteToolOption) (onlinePlugin *entity.PluginInfo, onlineTool *entity.ToolInfo, err error) {
	if req.ExecDraftTool {
		return nil, nil, fmt.Errorf("draft tool is not supported in online agent")
	}

	onlineTool, exist, err := p.toolRepo.GetOnlineTool(ctx, req.ToolID)
	if err != nil {
		return nil, nil, err
	}
	if !exist {
		return nil, nil, fmt.Errorf("online tool '%d' not found", req.ToolID)
	}

	agentTool, exist, err := p.toolRepo.GetVersionAgentTool(ctx, execOpt.ProjectInfo.ProjectID, entity.VersionAgentTool{
		ToolID:       req.ToolID,
		AgentVersion: execOpt.ProjectInfo.ProjectVersion,
	})
	if err != nil {
		return nil, nil, err
	}
	if !exist {
		return nil, nil, fmt.Errorf("agent tool '%d' not found", req.ToolID)
	}

	if execOpt.ToolVersion == "" {
		onlinePlugin, exist, err = p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
		if err != nil {
			return nil, nil, err
		}
		if !exist {
			return nil, nil, fmt.Errorf("online plugin '%d' not found", req.PluginID)
		}
	} else {
		onlinePlugin, exist, err = p.pluginRepo.GetVersionPlugin(ctx, entity.VersionPlugin{
			PluginID: req.PluginID,
			Version:  execOpt.ToolVersion,
		})
		if err != nil {
			return nil, nil, err
		}
		if !exist {
			return nil, nil, fmt.Errorf("plugin '%d' with version '%s' not found", req.PluginID, execOpt.ToolVersion)
		}
	}

	onlineTool, err = mergeAgentToolInfo(ctx, onlineTool, agentTool)
	if err != nil {
		return nil, nil, err
	}

	return onlinePlugin, onlineTool, nil
}

func (p *pluginServiceImpl) getWorkflowPluginInfo(ctx context.Context, req *ExecuteToolRequest, execOpt *model.ExecuteToolOption) (pl *entity.PluginInfo, tl *entity.ToolInfo, err error) {
	if req.ExecDraftTool {
		var exist bool
		pl, exist, err = p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
		if err != nil {
			return nil, nil, err
		}
		if !exist {
			return nil, nil, fmt.Errorf("draft plugin '%d' not found", req.PluginID)
		}

		tl, exist, err = p.toolRepo.GetDraftTool(ctx, req.ToolID)
		if err != nil {
			return nil, nil, err
		}
		if !exist {
			return nil, nil, fmt.Errorf("draft tool '%d' not found", req.ToolID)
		}

	} else {
		var exist bool
		if execOpt.ToolVersion == "" {
			pl, exist, err = p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
			if err != nil {
				return nil, nil, err
			}
			if !exist {
				return nil, nil, fmt.Errorf("online plugin '%d' not found", req.PluginID)
			}

			tl, exist, err = p.toolRepo.GetOnlineTool(ctx, req.ToolID)
			if err != nil {
				return nil, nil, err
			}
			if !exist {
				return nil, nil, fmt.Errorf("online tool '%d' not found", req.ToolID)
			}

		} else {
			pl, exist, err = p.pluginRepo.GetVersionPlugin(ctx, entity.VersionPlugin{
				PluginID: req.PluginID,
				Version:  execOpt.ToolVersion,
			})
			if err != nil {
				return nil, nil, err
			}
			if !exist {
				return nil, nil, fmt.Errorf("plugin '%d' with version '%s' not found", req.PluginID, execOpt.ToolVersion)
			}

			tl, exist, err = p.toolRepo.GetVersionTool(ctx, entity.VersionTool{
				ToolID:  req.ToolID,
				Version: execOpt.ToolVersion,
			})
			if err != nil {
				return nil, nil, err
			}
			if !exist {
				return nil, nil, fmt.Errorf("tool '%d' with version '%s' not found", req.ToolID, execOpt.ToolVersion)
			}
		}
	}

	return pl, tl, nil
}

func (p *pluginServiceImpl) getToolDebugPluginInfo(ctx context.Context, req *ExecuteToolRequest, execOpt *model.ExecuteToolOption) (pl *entity.PluginInfo, tl *entity.ToolInfo, err error) {
	if req.ExecDraftTool {
		tl, exist, err := p.toolRepo.GetDraftTool(ctx, req.ToolID)
		if err != nil {
			return nil, nil, err
		}
		if !exist {
			return nil, nil, fmt.Errorf("draft tool '%d' not found", req.ToolID)
		}

		pl, exist, err = p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
		if err != nil {
			return nil, nil, err
		}
		if !exist {
			return nil, nil, fmt.Errorf("draft plugin '%d' not found", req.PluginID)
		}

		if tl.GetActivatedStatus() != model.ActivateTool {
			return nil, nil, fmt.Errorf("tool '%s' is not activated", tl.GetName())
		}

		return pl, tl, nil
	}

	tl, exist, err := p.toolRepo.GetOnlineTool(ctx, req.ToolID)
	if err != nil {
		return nil, nil, err
	}
	if !exist {
		return nil, nil, fmt.Errorf("online tool '%d' not found", req.ToolID)
	}

	pl, exist, err = p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
	if err != nil {
		return nil, nil, err
	}
	if !exist {
		return nil, nil, fmt.Errorf("online plugin '%d' not found", req.PluginID)
	}

	return pl, tl, nil
}
