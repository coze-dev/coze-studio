package service

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/getkin/kin-openapi/openapi3"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/tool_executor"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/pkg/sonic"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

func (p *pluginServiceImpl) ExecuteTool(ctx context.Context, req *ExecuteToolRequest, opts ...entity.ExecuteToolOpt) (resp *ExecuteToolResponse, err error) {
	execOpt := &model.ExecuteToolOption{}
	for _, opt := range opts {
		opt(execOpt)
	}

	config, err := p.buildExecConfig(ctx, req, execOpt)
	if err != nil {
		return nil, errorx.Wrapf(err, "buildExecConfig failed")
	}

	result, err := tool_executor.NewExecutor(config).Execute(ctx, req.ArgumentsInJson)
	if err != nil {
		return nil, errorx.Wrapf(err, "Execute tool failed")
	}

	if req.ExecScene == model.ExecSceneOfToolDebug {
		err = p.toolRepo.UpdateDraftTool(ctx, &entity.ToolInfo{
			ID:          req.ToolID,
			DebugStatus: ptr.Of(common.APIDebugStatus_DebugPassed),
		})
		if err != nil {
			logs.CtxErrorf(ctx, "UpdateDraftTool failed, tooID=%d, err=%v", req.ToolID, err)
		}
	}

	var respSchema openapi3.Responses
	if execOpt.AutoGenRespSchema {
		respSchema, err = p.genToolResponseSchema(ctx, result.RawResp)
		if err != nil {
			return nil, errorx.Wrapf(err, "genToolResponseSchema failed")
		}
	}

	resp = &ExecuteToolResponse{
		Tool:        config.Tool,
		Request:     result.Request,
		RawResp:     result.RawResp,
		TrimmedResp: result.TrimmedResp,
		RespSchema:  respSchema,
	}

	return resp, nil
}

func (p *pluginServiceImpl) buildExecConfig(ctx context.Context, req *ExecuteToolRequest,
	execOpt *model.ExecuteToolOption) (config *tool_executor.ExecutorConfig, err error) {

	if req.UserID == "" {
		return nil, errorx.New(errno.ErrPluginExecuteToolFailed, errorx.KV(errno.PluginMsgKey, "userID is required"))
	}

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
		return nil, fmt.Errorf("invalid exec scene '%s'", req.ExecScene)
	}
	if err != nil {
		return nil, err
	}

	config = &tool_executor.ExecutorConfig{
		UserID:                     req.UserID,
		Plugin:                     pl,
		Tool:                       tl,
		ProjectInfo:                execOpt.ProjectInfo,
		ExecScene:                  req.ExecScene,
		InvalidRespProcessStrategy: execOpt.InvalidRespProcessStrategy,
		OSS:                        p.oss,
	}

	if execOpt.Operation != nil {
		config.Tool.Operation = execOpt.Operation
	}

	return config, nil
}

func (p *pluginServiceImpl) getDraftAgentPluginInfo(ctx context.Context, req *ExecuteToolRequest,
	execOpt *model.ExecuteToolOption) (onlinePlugin *entity.PluginInfo, onlineTool *entity.ToolInfo, err error) {

	if req.ExecDraftTool {
		return nil, nil, fmt.Errorf("draft tool is not supported in online agent")
	}

	onlineTool, exist, err := p.toolRepo.GetOnlineTool(ctx, req.ToolID)
	if err != nil {
		return nil, nil, errorx.Wrapf(err, "GetOnlineTool failed, toolID=%d", req.ToolID)
	}
	if !exist {
		return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	agentTool, exist, err := p.toolRepo.GetDraftAgentTool(ctx, execOpt.ProjectInfo.ProjectID, req.ToolID)
	if err != nil {
		return nil, nil, errorx.Wrapf(err, "GetDraftAgentTool failed, agentID=%d, toolID=%d", execOpt.ProjectInfo.ProjectID, req.ToolID)
	}
	if !exist {
		return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	if execOpt.ToolVersion == "" {
		onlinePlugin, exist, err = p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
		if err != nil {
			return nil, nil, errorx.Wrapf(err, "GetOnlinePlugin failed, pluginID=%d", req.PluginID)
		}
		if !exist {
			return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
		}
	} else {
		onlinePlugin, exist, err = p.pluginRepo.GetVersionPlugin(ctx, entity.VersionPlugin{
			PluginID: req.PluginID,
			Version:  execOpt.ToolVersion,
		})
		if err != nil {
			return nil, nil, errorx.Wrapf(err, "GetVersionPlugin failed, pluginID=%d, version=%s", req.PluginID, execOpt.ToolVersion)
		}
		if !exist {
			return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
		}
	}

	onlineTool, err = mergeAgentToolInfo(ctx, onlineTool, agentTool)
	if err != nil {
		return nil, nil, errorx.Wrapf(err, "mergeAgentToolInfo failed")
	}

	return onlinePlugin, onlineTool, nil
}

func (p *pluginServiceImpl) getOnlineAgentPluginInfo(ctx context.Context, req *ExecuteToolRequest,
	execOpt *model.ExecuteToolOption) (onlinePlugin *entity.PluginInfo, onlineTool *entity.ToolInfo, err error) {

	if req.ExecDraftTool {
		return nil, nil, fmt.Errorf("draft tool is not supported in online agent")
	}

	onlineTool, exist, err := p.toolRepo.GetOnlineTool(ctx, req.ToolID)
	if err != nil {
		return nil, nil, errorx.Wrapf(err, "GetOnlineTool failed, toolID=%d", req.ToolID)
	}
	if !exist {
		return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	agentTool, exist, err := p.toolRepo.GetVersionAgentTool(ctx, execOpt.ProjectInfo.ProjectID, entity.VersionAgentTool{
		ToolID:       req.ToolID,
		AgentVersion: execOpt.ProjectInfo.ProjectVersion,
	})
	if err != nil {
		return nil, nil, errorx.Wrapf(err, "GetVersionAgentTool failed, agentID=%d, toolID=%d",
			execOpt.ProjectInfo.ProjectID, req.ToolID)
	}
	if !exist {
		return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	if execOpt.ToolVersion == "" {
		onlinePlugin, exist, err = p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
		if err != nil {
			return nil, nil, errorx.Wrapf(err, "GetOnlinePlugin failed, pluginID=%d", req.PluginID)
		}
		if !exist {
			return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
		}
	} else {
		onlinePlugin, exist, err = p.pluginRepo.GetVersionPlugin(ctx, entity.VersionPlugin{
			PluginID: req.PluginID,
			Version:  execOpt.ToolVersion,
		})
		if err != nil {
			return nil, nil, errorx.Wrapf(err, "GetVersionPlugin failed, pluginID=%d, version=%s", req.PluginID, execOpt.ToolVersion)
		}
		if !exist {
			return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
		}
	}

	onlineTool, err = mergeAgentToolInfo(ctx, onlineTool, agentTool)
	if err != nil {
		return nil, nil, errorx.Wrapf(err, "mergeAgentToolInfo failed")
	}

	return onlinePlugin, onlineTool, nil
}

func (p *pluginServiceImpl) getWorkflowPluginInfo(ctx context.Context, req *ExecuteToolRequest,
	execOpt *model.ExecuteToolOption) (pl *entity.PluginInfo, tl *entity.ToolInfo, err error) {

	if req.ExecDraftTool {
		var exist bool
		pl, exist, err = p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
		if err != nil {
			return nil, nil, errorx.Wrapf(err, "GetDraftPlugin failed, pluginID=%d", req.PluginID)
		}
		if !exist {
			return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
		}

		tl, exist, err = p.toolRepo.GetDraftTool(ctx, req.ToolID)
		if err != nil {
			return nil, nil, errorx.Wrapf(err, "GetDraftTool failed, toolID=%d", req.ToolID)
		}
		if !exist {
			return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
		}

	} else {
		var exist bool
		if execOpt.ToolVersion == "" {
			pl, exist, err = p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
			if err != nil {
				return nil, nil, errorx.Wrapf(err, "GetOnlinePlugin failed, pluginID=%d", req.PluginID)
			}
			if !exist {
				return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
			}

			tl, exist, err = p.toolRepo.GetOnlineTool(ctx, req.ToolID)
			if err != nil {
				return nil, nil, errorx.Wrapf(err, "GetOnlineTool failed, toolID=%d", req.ToolID)
			}
			if !exist {
				return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
			}

		} else {
			pl, exist, err = p.pluginRepo.GetVersionPlugin(ctx, entity.VersionPlugin{
				PluginID: req.PluginID,
				Version:  execOpt.ToolVersion,
			})
			if err != nil {
				return nil, nil, errorx.Wrapf(err, "GetVersionPlugin failed, pluginID=%d, version=%s", req.PluginID, execOpt.ToolVersion)
			}
			if !exist {
				return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
			}

			tl, exist, err = p.toolRepo.GetVersionTool(ctx, entity.VersionTool{
				ToolID:  req.ToolID,
				Version: execOpt.ToolVersion,
			})
			if err != nil {
				return nil, nil, errorx.Wrapf(err, "GetVersionTool failed, toolID=%d, version=%s", req.ToolID, execOpt.ToolVersion)
			}
			if !exist {
				return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
			}
		}
	}

	return pl, tl, nil
}

func (p *pluginServiceImpl) getToolDebugPluginInfo(ctx context.Context, req *ExecuteToolRequest,
	execOpt *model.ExecuteToolOption) (pl *entity.PluginInfo, tl *entity.ToolInfo, err error) {

	if req.ExecDraftTool {
		tl, exist, err := p.toolRepo.GetDraftTool(ctx, req.ToolID)
		if err != nil {
			return nil, nil, errorx.Wrapf(err, "GetDraftTool failed, toolID=%d", req.ToolID)
		}
		if !exist {
			return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
		}

		pl, exist, err = p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
		if err != nil {
			return nil, nil, errorx.Wrapf(err, "GetDraftPlugin failed, pluginID=%d", req.PluginID)
		}
		if !exist {
			return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
		}

		if tl.GetActivatedStatus() != model.ActivateTool {
			return nil, nil, errorx.New(errno.ErrPluginDeactivatedTool, errorx.KV(errno.PluginMsgKey, tl.GetName()))
		}

		return pl, tl, nil
	}

	tl, exist, err := p.toolRepo.GetOnlineTool(ctx, req.ToolID)
	if err != nil {
		return nil, nil, errorx.Wrapf(err, "GetOnlineTool failed, toolID=%d", req.ToolID)
	}
	if !exist {
		return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	pl, exist, err = p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
	if err != nil {
		return nil, nil, errorx.Wrapf(err, "GetOnlinePlugin failed, pluginID=%d", req.PluginID)
	}
	if !exist {
		return nil, nil, errorx.New(errno.ErrPluginRecordNotFound)
	}

	return pl, tl, nil
}

func (p *pluginServiceImpl) genToolResponseSchema(ctx context.Context, rawResp string) (openapi3.Responses, error) {
	valMap := map[string]any{}
	err := sonic.UnmarshalString(rawResp, &valMap)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPluginParseToolRespFailed, errorx.KV(errno.PluginMsgKey,
			"the type of response only supports json map"))
	}

	resp := entity.DefaultOpenapi3Responses()

	respSchema := parseResponseToBodySchemaRef(ctx, valMap)
	if respSchema == nil {
		return resp, nil
	}

	resp[strconv.Itoa(http.StatusOK)].Value.Content[model.MediaTypeJson].Schema = respSchema

	return resp, nil
}

func parseResponseToBodySchemaRef(ctx context.Context, value any) *openapi3.SchemaRef {
	switch val := value.(type) {
	case map[string]any:
		if len(val) == 0 {
			return nil
		}

		properties := make(map[string]*openapi3.SchemaRef, len(val))
		for k, subVal := range val {
			prop := parseResponseToBodySchemaRef(ctx, subVal)
			if prop == nil {
				continue
			}
			properties[k] = prop
		}

		if len(properties) == 0 {
			return nil
		}

		return &openapi3.SchemaRef{
			Value: &openapi3.Schema{
				Type:       openapi3.TypeObject,
				Properties: properties,
			},
		}

	case []any:
		if len(val) == 0 {
			return nil
		}

		item := parseResponseToBodySchemaRef(ctx, val[0])
		if item == nil {
			return nil
		}

		return &openapi3.SchemaRef{
			Value: &openapi3.Schema{
				Type:  openapi3.TypeArray,
				Items: item,
			},
		}

	case string:
		return &openapi3.SchemaRef{
			Value: &openapi3.Schema{
				Type: openapi3.TypeString,
			},
		}

	case float64: // in most cases, it's integer
		return &openapi3.SchemaRef{
			Value: &openapi3.Schema{
				Type: openapi3.TypeInteger,
			},
		}

	case bool:
		return &openapi3.SchemaRef{
			Value: &openapi3.Schema{
				Type: openapi3.TypeBoolean,
			},
		}

	default:
		logs.CtxWarnf(ctx, "unsupported type: %T", val)
		return nil
	}
}
