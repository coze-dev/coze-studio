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

package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"

	"net/http"
	"strconv"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"

	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	model "github.com/coze-dev/coze-studio/backend/crossdomain/contract/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/service/tool"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (p *pluginServiceImpl) ExecuteTool(ctx context.Context, req *model.ExecuteToolRequest, opts ...entity.ExecuteToolOpt) (resp *model.ExecuteToolResponse, err error) {
	opt := &model.ExecuteToolOption{}
	for _, fn := range opts {
		fn(opt)
	}

	executor, err := p.buildToolExecutor(ctx, req, opt)
	if err != nil {
		return nil, errorx.Wrapf(err, "buildToolExecutor failed")
	}

	authInfo := executor.plugin.GetAuthInfo()
	accessToken, authURL, err := p.acquireAccessTokenIfNeed(ctx, req, authInfo, executor.tool.Operation)
	if err != nil {
		return nil, errorx.Wrapf(err, "acquireAccessToken failed")
	}

	result, err := executor.execute(ctx, req.ArgumentsInJson, accessToken, authURL)
	if err != nil {
		return nil, errorx.Wrapf(err, "execute tool failed")
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
	if opt.AutoGenRespSchema {
		respSchema, err = p.genToolResponseSchema(ctx, result.RawResp)
		if err != nil {
			return nil, errorx.Wrapf(err, "genToolResponseSchema failed")
		}
	}

	resp = &model.ExecuteToolResponse{
		Tool:        executor.tool,
		Request:     result.Request,
		RawResp:     result.RawResp,
		TrimmedResp: result.TrimmedResp,
		RespSchema:  respSchema,
	}

	return resp, nil
}

func (p *pluginServiceImpl) acquireAccessTokenIfNeed(ctx context.Context, req *model.ExecuteToolRequest, authInfo *model.AuthV2,
	schema *model.Openapi3Operation) (accessToken string, authURL string, err error) {
	if authInfo.Type == model.AuthzTypeOfNone {
		return "", "", nil
	}

	authMode := model.ToolAuthModeOfRequired
	if tmp, ok := schema.Extensions[model.APISchemaExtendAuthMode].(string); ok {
		authMode = model.ToolAuthMode(tmp)
	}

	if authMode == model.ToolAuthModeOfDisabled {
		return "", "", nil
	}

	if authInfo.SubType == model.AuthzSubTypeOfOAuthAuthorizationCode {
		authorizationCode := &entity.AuthorizationCodeInfo{
			Meta: &entity.AuthorizationCodeMeta{
				UserID:   req.UserID,
				PluginID: req.PluginID,
				IsDraft:  req.ExecScene == model.ExecSceneOfToolDebug,
			},
			Config: authInfo.AuthOfOAuthAuthorizationCode,
		}

		accessToken, err = p.GetAccessToken(ctx, &entity.OAuthInfo{
			OAuthMode:         authInfo.SubType,
			AuthorizationCode: authorizationCode,
		})
		if err != nil {
			return "", "", err
		}

		authURL, err = genAuthURL(authorizationCode)
		if err != nil {
			return "", "", err
		}
	}

	return accessToken, authURL, nil
}

func (p *pluginServiceImpl) buildToolExecutor(ctx context.Context, req *model.ExecuteToolRequest, opt *model.ExecuteToolOption) (impl *toolExecutor, err error) {
	if req.UserID == "" {
		return nil, errorx.New(errno.ErrPluginExecuteToolFailed, errorx.KV(errno.PluginMsgKey, "userID is required"))
	}

	var (
		pl *entity.PluginInfo
		tl *entity.ToolInfo
	)
	switch req.ExecScene {
	case model.ExecSceneOfOnlineAgent:
		pl, tl, err = p.getOnlineAgentPluginInfo(ctx, req, opt)
	case model.ExecSceneOfDraftAgent:
		pl, tl, err = p.getDraftAgentPluginInfo(ctx, req, opt)
	case model.ExecSceneOfToolDebug:
		pl, tl, err = p.getToolDebugPluginInfo(ctx, req, opt)
	case model.ExecSceneOfWorkflow:
		pl, tl, err = p.getWorkflowPluginInfo(ctx, req, opt)
	default:
		return nil, fmt.Errorf("invalid execute scene '%s'", req.ExecScene)
	}
	if err != nil {
		return nil, err
	}

	impl = &toolExecutor{
		execScene:                  req.ExecScene,
		userID:                     req.UserID,
		conversationID:             opt.ConversationID,
		plugin:                     pl,
		tool:                       tl,
		projectInfo:                opt.ProjectInfo,
		invalidRespProcessStrategy: opt.InvalidRespProcessStrategy,
		oss:                        p.oss,
	}

	if opt.Operation != nil {
		impl.tool.Operation = opt.Operation
	}

	return impl, nil
}

func (p *pluginServiceImpl) getDraftAgentPluginInfo(ctx context.Context, req *model.ExecuteToolRequest,
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

func (p *pluginServiceImpl) getOnlineAgentPluginInfo(ctx context.Context, req *model.ExecuteToolRequest,
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

func (p *pluginServiceImpl) getWorkflowPluginInfo(ctx context.Context, req *model.ExecuteToolRequest,
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

func (p *pluginServiceImpl) getToolDebugPluginInfo(ctx context.Context, req *model.ExecuteToolRequest,
	_ *model.ExecuteToolOption) (pl *entity.PluginInfo, tl *entity.ToolInfo, err error) {

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

type ExecuteResponse struct {
	Request     string
	TrimmedResp string
	RawResp     string
}

type toolExecutor struct {
	execScene      model.ExecuteScene
	userID         string
	conversationID int64

	plugin *entity.PluginInfo
	tool   *entity.ToolInfo

	projectInfo                *entity.ProjectInfo
	invalidRespProcessStrategy model.InvalidResponseProcessStrategy

	oss storage.Storage
}

func newToolInvocation(t *toolExecutor) tool.Invocation {
	switch t.plugin.Manifest.API.Type {
	case model.PluginTypeOfCloud:
		return tool.NewHttpCallImpl(t.conversationID)
	case model.PluginTypeOfMCP:
		return tool.NewMcpCallImpl()
	case model.PluginTypeOfCustom:
		return tool.NewCustomCallImpl()
	default: // default to http call
		return tool.NewHttpCallImpl(t.conversationID)
	}
}

func (t *toolExecutor) execute(ctx context.Context, argumentsInJson, accessToken, authURL string) (resp *ExecuteResponse, err error) {
	if argumentsInJson == "" {
		return nil, errorx.New(errno.ErrPluginExecuteToolFailed,
			errorx.KV(errno.PluginMsgKey, "argumentsInJson is required"))
	}

	invocation, err := tool.NewInvocationArgs(ctx, &tool.InvocationArgsBuilder{
		ArgsInJson:     argumentsInJson,
		ProjectInfo:    t.projectInfo,
		UserID:         t.userID,
		AccessToken:    accessToken,
		AuthURL:        authURL,
		Plugin:         t.plugin,
		Tool:           t.tool,
		PluginManifest: t.plugin.Manifest,
		ServerURL:      t.plugin.GetServerURL(),
		AuthInfo: &tool.AuthInfo{
			OAuth: &tool.OAuthInfo{
				AccessToken: accessToken,
				AuthURL:     authURL,
			},
			MetaInfo: t.plugin.GetAuthInfo(),
		},
	})
	if err != nil {
		return nil, err
	}

	if t.execScene != model.ExecSceneOfToolDebug { // debug
		// only assemble file uri to url in debug scene
		err = invocation.AssembleFileURIToURL(ctx, t.oss)
		if err != nil {
			return nil, err
		}
	}

	toolInvocation := newToolInvocation(t)
	requestStr, rawResp, err := toolInvocation.Do(ctx, invocation)
	if err != nil {
		return nil, err
	}

	const defaultResp = "{}"

	if rawResp == "" {
		return &ExecuteResponse{
			Request:     requestStr,
			TrimmedResp: defaultResp,
			RawResp:     defaultResp,
		}, nil
	}

	trimmedResp, err := t.processResponse(ctx, rawResp)
	if err != nil {
		return nil, err
	}
	if trimmedResp == "" {
		trimmedResp = defaultResp
	}

	return &ExecuteResponse{
		Request:     requestStr,
		TrimmedResp: trimmedResp,
		RawResp:     rawResp,
	}, nil
}

func (t *toolExecutor) processResponse(ctx context.Context, rawResp string) (trimmedResp string, err error) {
	responses := t.tool.Operation.Responses
	if len(responses) == 0 {
		return "", nil
	}

	resp, ok := responses[strconv.Itoa(http.StatusOK)]
	if !ok {
		return "", fmt.Errorf("the '%d' status code is not defined in responses", http.StatusOK)
	}
	mType, ok := resp.Value.Content[model.MediaTypeJson] // only support application/json
	if !ok {
		return "", fmt.Errorf("the '%s' media type is not defined in response", model.MediaTypeJson)
	}

	decoder := sonic.ConfigDefault.NewDecoder(bytes.NewBufferString(rawResp))
	decoder.UseNumber()
	respMap := map[string]any{}
	err = decoder.Decode(&respMap)
	if err != nil {
		return "", errorx.New(errno.ErrPluginExecuteToolFailed,
			errorx.KVf(errno.PluginMsgKey, "response is not object, raw response=%s", rawResp))
	}

	schemaVal := mType.Schema.Value
	if len(schemaVal.Properties) == 0 {
		return "", nil
	}

	var trimmedRespMap map[string]any
	switch t.invalidRespProcessStrategy {
	case model.InvalidResponseProcessStrategyOfReturnRaw:
		trimmedRespMap, err = t.processWithInvalidRespProcessStrategyOfReturnRaw(ctx, respMap, schemaVal)
		if err != nil {
			return "", err
		}

	case model.InvalidResponseProcessStrategyOfReturnDefault:
		trimmedRespMap, err = t.processWithInvalidRespProcessStrategyOfReturnDefault(ctx, respMap, schemaVal)
		if err != nil {
			return "", err
		}

	case model.InvalidResponseProcessStrategyOfReturnErr:
		trimmedRespMap, err = t.processWithInvalidRespProcessStrategyOfReturnErr(ctx, respMap, schemaVal)
		if err != nil {
			return "", err
		}

	default:
		return rawResp, fmt.Errorf("invalid response process strategy '%d'", t.invalidRespProcessStrategy)
	}

	trimmedResp, err = sonic.MarshalString(trimmedRespMap)
	if err != nil {
		return "", errorx.Wrapf(err, "marshal trimmed response failed")
	}

	return trimmedResp, nil
}

func (t *toolExecutor) processWithInvalidRespProcessStrategyOfReturnRaw(ctx context.Context, paramVals map[string]any, paramSchema *openapi3.Schema) (map[string]any, error) {
	for paramName, _paramVal := range paramVals {
		_paramSchema, ok := paramSchema.Properties[paramName]
		if !ok || t.disabledParam(_paramSchema.Value) {
			delete(paramVals, paramName)
			continue
		}

		if _paramSchema.Value.Type != openapi3.TypeObject {
			continue
		}

		paramValMap, ok := _paramVal.(map[string]any)
		if !ok {
			continue
		}

		_, err := t.processWithInvalidRespProcessStrategyOfReturnRaw(ctx, paramValMap, _paramSchema.Value)
		if err != nil {
			return nil, err
		}
	}

	return paramVals, nil
}

func (t *toolExecutor) processWithInvalidRespProcessStrategyOfReturnErr(_ context.Context, paramVals map[string]any, paramSchema *openapi3.Schema) (map[string]any, error) {
	var processor func(paramName string, paramVal any, schemaVal *openapi3.Schema) (any, error)
	processor = func(paramName string, paramVal any, schemaVal *openapi3.Schema) (any, error) {
		switch schemaVal.Type {
		case openapi3.TypeObject:
			paramValMap, ok := paramVal.(map[string]any)
			if !ok {
				return nil, errorx.New(errno.ErrPluginExecuteToolFailed, errorx.KVf(errno.PluginMsgKey,
					"expected '%s' to be of type 'object', but got '%T'", paramName, paramVal))
			}

			newParamValMap := map[string]any{}
			for paramName_, paramVal_ := range paramValMap {
				paramSchema_, ok := schemaVal.Properties[paramName_]
				if !ok || t.disabledParam(paramSchema_.Value) { // Only the object field can be disabled, and the top level of request and response must be the object structure
					continue
				}
				newParamVal, err := processor(paramName_, paramVal_, paramSchema_.Value)
				if err != nil {
					return nil, err
				}
				newParamValMap[paramName_] = newParamVal
			}

			return newParamValMap, nil

		case openapi3.TypeArray:
			paramValSlice, ok := paramVal.([]any)
			if !ok {
				return nil, errorx.New(errno.ErrPluginExecuteToolFailed, errorx.KVf(errno.PluginMsgKey,
					"expected '%s' to be of type 'array', but got '%T'", paramName, paramVal))
			}

			newParamValSlice := []any{}
			for _, paramVal_ := range paramValSlice {
				newParamVal, err := processor(paramName, paramVal_, schemaVal.Items.Value)
				if err != nil {
					return nil, err
				}
				if newParamVal != nil {
					newParamValSlice = append(newParamValSlice, newParamVal)
				}
			}

			return newParamValSlice, nil

		case openapi3.TypeString:
			paramValStr, ok := paramVal.(string)
			if !ok {
				return nil, errorx.New(errno.ErrPluginExecuteToolFailed, errorx.KVf(errno.PluginMsgKey,
					"expected '%s' to be of type 'string', but got '%T'", paramName, paramVal))
			}

			return paramValStr, nil

		case openapi3.TypeBoolean:
			paramValBool, ok := paramVal.(bool)
			if !ok {
				return false, fmt.Errorf("expected '%s' to be of type 'boolean', but got '%T'", paramName, paramVal)
			}

			return paramValBool, nil

		case openapi3.TypeInteger:
			paramValNum, ok := paramVal.(json.Number)
			if !ok {
				return nil, errorx.New(errno.ErrPluginExecuteToolFailed, errorx.KVf(errno.PluginMsgKey,
					"expected '%s' to be of type 'integer', but got '%T'", paramName, paramVal))
			}
			paramValInt, err := paramValNum.Int64()
			if err != nil {
				return nil, errorx.New(errno.ErrPluginExecuteToolFailed, errorx.KVf(errno.PluginMsgKey,
					"expected '%s' to be of type 'integer', but got '%T'", paramName, paramVal))
			}

			return paramValInt, nil

		case openapi3.TypeNumber:
			paramValNum, ok := paramVal.(json.Number)
			if !ok {
				return nil, errorx.New(errno.ErrPluginExecuteToolFailed, errorx.KVf(errno.PluginMsgKey,
					"expected '%s' to be of type 'number', but got '%T'", paramName, paramVal))
			}

			return paramValNum, nil

		default:
			return nil, fmt.Errorf("unsupported type '%s'", schemaVal.Type)
		}
	}

	newParamVals := make(map[string]any, len(paramVals))
	for paramName, paramVal_ := range paramVals {
		paramSchema_, ok := paramSchema.Properties[paramName]
		if !ok || t.disabledParam(paramSchema_.Value) {
			continue
		}

		newParamVal, err := processor(paramName, paramVal_, paramSchema_.Value)
		if err != nil {
			return nil, err
		}

		newParamVals[paramName] = newParamVal
	}

	return newParamVals, nil
}

func (t *toolExecutor) processWithInvalidRespProcessStrategyOfReturnDefault(_ context.Context, paramVals map[string]any, paramSchema *openapi3.Schema) (map[string]any, error) {
	var processor func(paramVal any, schemaVal *openapi3.Schema) (any, error)
	processor = func(paramVal any, schemaVal *openapi3.Schema) (any, error) {
		switch schemaVal.Type {
		case openapi3.TypeObject:
			newParamValMap := map[string]any{}
			paramValMap, ok := paramVal.(map[string]any)
			if !ok {
				return nil, nil
			}

			for paramName, _paramVal := range paramValMap {
				_paramSchema, ok := schemaVal.Properties[paramName]
				if !ok || t.disabledParam(_paramSchema.Value) { // Only the object field can be disabled, and the top level of request and response must be the object structure
					continue
				}
				newParamVal, err := processor(_paramVal, _paramSchema.Value)
				if err != nil {
					return nil, err
				}
				newParamValMap[paramName] = newParamVal
			}

			return newParamValMap, nil

		case openapi3.TypeArray:
			newParamValSlice := []any{}
			paramValSlice, ok := paramVal.([]any)
			if !ok {
				return nil, nil
			}

			for _, _paramVal := range paramValSlice {
				newParamVal, err := processor(_paramVal, schemaVal.Items.Value)
				if err != nil {
					return nil, err
				}
				if newParamVal != nil {
					newParamValSlice = append(newParamValSlice, newParamVal)
				}
			}

			return newParamValSlice, nil

		case openapi3.TypeString:
			paramValStr, ok := paramVal.(string)
			if !ok {
				return "", nil
			}

			return paramValStr, nil

		case openapi3.TypeBoolean:
			paramValBool, ok := paramVal.(bool)
			if !ok {
				return false, nil
			}

			return paramValBool, nil

		case openapi3.TypeInteger:
			paramValNum, ok := paramVal.(json.Number)
			if !ok {
				return int64(0), nil
			}
			paramValInt, err := paramValNum.Int64()
			if err != nil {
				return int64(0), nil
			}

			return paramValInt, nil

		case openapi3.TypeNumber:
			paramValNum, ok := paramVal.(json.Number)
			if !ok {
				return json.Number("0"), nil
			}

			return paramValNum, nil

		default:
			return nil, fmt.Errorf("unsupported type '%s'", schemaVal.Type)
		}
	}

	newParamVals := make(map[string]any, len(paramVals))
	for paramName, _paramVal := range paramVals {
		_paramSchema, ok := paramSchema.Properties[paramName]
		if !ok || t.disabledParam(_paramSchema.Value) {
			continue
		}

		newParamVal, err := processor(_paramVal, _paramSchema.Value)
		if err != nil {
			return nil, err
		}

		newParamVals[paramName] = newParamVal
	}

	return newParamVals, nil
}

func (t *toolExecutor) disabledParam(schemaVal *openapi3.Schema) bool {
	if len(schemaVal.Extensions) == 0 {
		return false
	}
	globalDisable, localDisable := false, false
	if v, ok := schemaVal.Extensions[model.APISchemaExtendLocalDisable]; ok {
		localDisable = v.(bool)
	}
	if v, ok := schemaVal.Extensions[model.APISchemaExtendGlobalDisable]; ok {
		globalDisable = v.(bool)
	}
	return globalDisable || localDisable
}
