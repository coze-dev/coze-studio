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
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/tidwall/sjson"

	einoCompose "github.com/cloudwego/eino/compose"

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/variables"
	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/project_memory"
	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	crossvariables "github.com/coze-dev/coze-studio/backend/crossdomain/contract/variables"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/encoder"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/i18n"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (p *pluginServiceImpl) ExecuteTool(ctx context.Context, req *ExecuteToolRequest, opts ...entity.ExecuteToolOpt) (resp *ExecuteToolResponse, err error) {
	execOpt := &model.ExecuteToolOption{}
	for _, opt := range opts {
		opt(execOpt)
	}

	executor, err := p.buildToolExecutor(ctx, req, execOpt)
	if err != nil {
		return nil, errorx.Wrapf(err, "buildToolExecutor failed")
	}

	result, err := executor.execute(ctx, req.ArgumentsInJson)
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
	if execOpt.AutoGenRespSchema {
		respSchema, err = p.genToolResponseSchema(ctx, result.RawResp)
		if err != nil {
			return nil, errorx.Wrapf(err, "genToolResponseSchema failed")
		}
	}

	resp = &ExecuteToolResponse{
		Tool:        executor.tool,
		Request:     result.Request,
		RawResp:     result.RawResp,
		TrimmedResp: result.TrimmedResp,
		RespSchema:  respSchema,
	}

	return resp, nil
}

func (p *pluginServiceImpl) buildToolExecutor(ctx context.Context, req *ExecuteToolRequest,
	execOpt *model.ExecuteToolOption) (impl *toolExecutor, err error) {

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
		return nil, fmt.Errorf("invalid execute scene '%s'", req.ExecScene)
	}
	if err != nil {
		return nil, err
	}

	impl = &toolExecutor{
		execScene:                  req.ExecScene,
		userID:                     req.UserID,
		plugin:                     pl,
		tool:                       tl,
		projectInfo:                execOpt.ProjectInfo,
		invalidRespProcessStrategy: execOpt.InvalidRespProcessStrategy,
		svc:                        p,
	}

	if execOpt.Operation != nil {
		impl.tool.Operation = execOpt.Operation
	}

	return impl, nil
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
	execScene model.ExecuteScene
	userID    string
	plugin    *entity.PluginInfo
	tool      *entity.ToolInfo

	projectInfo                *entity.ProjectInfo
	invalidRespProcessStrategy model.InvalidResponseProcessStrategy

	svc *pluginServiceImpl
}

func (t *toolExecutor) execute(ctx context.Context, argumentsInJson string) (resp *ExecuteResponse, err error) {
	const defaultResp = "{}"

	if argumentsInJson == "" {
		return nil, errorx.New(errno.ErrPluginExecuteToolFailed, errorx.KV(errno.PluginMsgKey, "argumentsInJson is required"))
	}

	args, err := t.preprocessArgumentsInJson(ctx, argumentsInJson)
	if err != nil {
		return nil, err
	}

	httpReq, err := t.buildHTTPRequest(ctx, args)
	if err != nil {
		return nil, err
	}

	errMsg, err := t.injectAuthInfo(ctx, httpReq)
	if err != nil {
		return nil, err
	}
	if errMsg != "" {
		event := &model.ToolInterruptEvent{
			Event: model.InterruptEventTypeOfToolNeedOAuth,
			ToolNeedOAuth: &model.ToolNeedOAuthInterruptEvent{
				Message: errMsg,
			},
		}
		return nil, einoCompose.NewInterruptAndRerunErr(event)
	}

	var reqBodyBytes []byte
	if httpReq.GetBody != nil {
		reqBody, err := httpReq.GetBody()
		if err != nil {
			return nil, err
		}
		defer reqBody.Close()

		reqBodyBytes, err = io.ReadAll(reqBody)
		if err != nil {
			return nil, err
		}
	}

	requestStr, err := genRequestString(httpReq, reqBodyBytes)
	if err != nil {
		return nil, err
	}

	restyReq := t.svc.httpCli.NewRequest()
	restyReq.Header = httpReq.Header
	restyReq.Method = httpReq.Method
	restyReq.URL = httpReq.URL.String()
	if reqBodyBytes != nil {
		restyReq.SetBody(reqBodyBytes)
	}
	restyReq.SetContext(ctx)

	logs.CtxDebugf(ctx, "[execute] url=%s, header=%s, method=%s, body=%s",
		restyReq.URL, restyReq.Header, restyReq.Method, restyReq.Body)

	httpResp, err := restyReq.Send()
	if err != nil {
		return nil, errorx.New(errno.ErrPluginExecuteToolFailed, errorx.KVf(errno.PluginMsgKey, "http request failed, err=%s", err))
	}

	logs.CtxDebugf(ctx, "[execute] status=%s, response=%s", httpResp.Status(), httpResp.String())

	if httpResp.StatusCode() != http.StatusOK {
		return nil, errorx.New(errno.ErrPluginExecuteToolFailed,
			errorx.KVf(errno.PluginMsgKey, "http request failed, status=%s\nresp=%s", httpResp.Status(), httpResp.String()))
	}

	rawResp := string(httpResp.Body())
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

func genRequestString(req *http.Request, body []byte) (string, error) {
	type Request struct {
		Path   string            `json:"path"`
		Header map[string]string `json:"header"`
		Query  map[string]string `json:"query"`
		Body   *[]byte           `json:"body"`
	}

	req_ := &Request{
		Path:   req.URL.Path,
		Header: map[string]string{},
		Query:  map[string]string{},
	}

	if len(req.Header) > 0 {
		for k, v := range req.Header {
			req_.Header[k] = v[0]
		}
	}
	if len(req.URL.Query()) > 0 {
		for k, v := range req.URL.Query() {
			req_.Query[k] = v[0]
		}
	}

	requestStr, err := sonic.MarshalString(req_)
	if err != nil {
		return "", fmt.Errorf("[genRequestString] marshal failed, err=%s", err)
	}

	if len(body) > 0 {
		requestStr, err = sjson.SetRaw(requestStr, "body", string(body))
		if err != nil {
			return "", fmt.Errorf("[genRequestString] set body failed, err=%s", err)
		}
	}

	return requestStr, nil
}

func (t *toolExecutor) preprocessArgumentsInJson(ctx context.Context, argumentsInJson string) (args map[string]any, err error) {
	args, err = t.prepareArguments(ctx, argumentsInJson)
	if err != nil {
		return nil, err
	}

	paramRefs := t.tool.Operation.Parameters
	for _, paramRef := range paramRefs {
		paramVal := paramRef.Value
		if paramVal.In == openapi3.ParameterInCookie {
			continue
		}

		scVal := paramVal.Schema.Value
		typ := scVal.Type

		if typ == openapi3.TypeObject {
			return nil, fmt.Errorf("the type of parameter '%s' in '%s' cannot be 'object'", paramVal.In, paramVal.Name)
		}

		argValue, ok := args[paramVal.Name]
		if !ok {
			continue
		}

		if arr, ok := argValue.([]any); ok {
			for i, e := range arr {
				e, err = t.convertURItoURL(ctx, e, scVal)
				if err != nil {
					return nil, err
				}
				arr[i] = e
			}
		} else {
			argValue, err = t.convertURItoURL(ctx, argValue, scVal)
			if err != nil {
				return nil, err
			}
		}

		args[paramVal.Name] = argValue
	}

	_, bodySchema := t.getReqBodySchema(t.tool.Operation)
	if bodySchema == nil || bodySchema.Value == nil {
		return args, nil
	}

	// Body restricted to object type
	if bodySchema.Value.Type != openapi3.TypeObject {
		return nil, fmt.Errorf("[preprocessArgumentsInJson] requset body is not object, type=%s",
			bodySchema.Value.Type)
	}

	if len(bodySchema.Value.Properties) == 0 {
		return args, nil
	}

	for paramName, prop := range bodySchema.Value.Properties {
		argValue, ok := args[paramName]
		if !ok {
			continue
		}

		if arr, ok := argValue.([]any); ok {
			for i, e := range arr {
				e, err = t.convertURItoURL(ctx, e, prop.Value)
				if err != nil {
					return nil, err
				}
				arr[i] = e
			}
		} else {
			argValue, err = t.convertURItoURL(ctx, argValue, prop.Value)
			if err != nil {
				return nil, err
			}
		}

		args[paramName] = argValue
	}

	return args, nil
}

func (t *toolExecutor) buildHTTPRequest(ctx context.Context, argMaps map[string]any) (httpReq *http.Request, err error) {
	tool := t.tool
	rawURL := t.plugin.GetServerURL() + tool.GetSubURL()

	locArgs, err := t.getLocationArguments(ctx, argMaps, tool.Operation.Parameters)
	if err != nil {
		return nil, err
	}

	commonParams := t.plugin.Manifest.CommonParams

	reqURL, err := locArgs.buildHTTPRequestURL(ctx, rawURL, commonParams)
	if err != nil {
		return nil, err
	}

	bodyArgs := map[string]any{}
	for k, v := range argMaps {
		if _, ok := locArgs.header[k]; ok {
			continue
		}
		if _, ok := locArgs.path[k]; ok {
			continue
		}
		if _, ok := locArgs.query[k]; ok {
			continue
		}
		bodyArgs[k] = v
	}

	commonBody := commonParams[model.ParamInBody]
	bodyBytes, contentType, err := t.buildRequestBody(ctx, tool.Operation, bodyArgs, commonBody)
	if err != nil {
		return nil, err
	}

	httpReq, err = http.NewRequestWithContext(ctx, tool.GetMethod(), reqURL.String(), bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}

	commonHeader := commonParams[model.ParamInHeader]
	header, err := locArgs.buildHTTPRequestHeader(ctx, commonHeader)
	if err != nil {
		return nil, err
	}

	httpReq.Header = header

	if len(bodyBytes) > 0 {
		httpReq.Header.Set("Content-Type", contentType)
	}

	return httpReq, nil
}

func (t *toolExecutor) prepareArguments(_ context.Context, argumentsInJson string) (map[string]any, error) {
	args := map[string]any{}

	decoder := sonic.ConfigDefault.NewDecoder(bytes.NewBufferString(argumentsInJson))
	decoder.UseNumber()

	// Suppose the output of the large model is of type object
	input := map[string]any{}
	err := decoder.Decode(&input)
	if err != nil {
		return nil, fmt.Errorf("[prepareArguments] unmarshal into map failed, input=%s, err=%v",
			argumentsInJson, err)
	}

	for k, v := range input {
		args[k] = v
	}

	return args, nil
}

func (t *toolExecutor) getLocationArguments(ctx context.Context, args map[string]any, paramRefs []*openapi3.ParameterRef) (*locationArguments, error) {
	headerArgs := map[string]valueWithSchema{}
	pathArgs := map[string]valueWithSchema{}
	queryArgs := map[string]valueWithSchema{}

	for _, paramRef := range paramRefs {
		paramVal := paramRef.Value
		if paramVal.In == openapi3.ParameterInCookie {
			continue
		}

		scVal := paramVal.Schema.Value
		typ := scVal.Type
		if typ == openapi3.TypeObject {
			return nil, fmt.Errorf("the type of '%s' parameter '%s' cannot be 'object'", paramVal.In, paramVal.Name)
		}

		argValue, ok := args[paramVal.Name]
		if !ok {
			var err error
			argValue, err = t.getDefaultValue(ctx, scVal)
			if err != nil {
				return nil, err
			}
			if argValue == nil {
				if !paramVal.Required {
					continue
				}
				return nil, fmt.Errorf("the '%s' parameter '%s' is required", paramVal.In, paramVal.Name)
			}
		}

		v := valueWithSchema{
			argValue:    argValue,
			paramSchema: paramVal,
		}

		switch paramVal.In {
		case openapi3.ParameterInQuery:
			queryArgs[paramVal.Name] = v
		case openapi3.ParameterInHeader:
			headerArgs[paramVal.Name] = v
		case openapi3.ParameterInPath:
			pathArgs[paramVal.Name] = v
		}
	}

	locArgs := &locationArguments{
		header: headerArgs,
		path:   pathArgs,
		query:  queryArgs,
	}

	return locArgs, nil
}

func (t *toolExecutor) convertURItoURL(ctx context.Context, arg any, scVal *openapi3.Schema) (newArg any, err error) {
	if t.execScene != model.ExecSceneOfToolDebug {
		return arg, nil
	}
	if scVal.Type != openapi3.TypeString {
		return arg, nil
	}

	at := scVal.Extensions[model.APISchemaExtendAssistType]
	if at == nil {
		return arg, nil
	}

	_at, ok := at.(string)
	if !ok {
		return arg, nil
	}
	if !model.IsValidAPIAssistType(model.APIFileAssistType(_at)) {
		return arg, nil
	}

	uri, ok := arg.(string)
	if !ok {
		return arg, nil
	}

	if strings.HasPrefix(uri, "http://") || strings.HasPrefix(uri, "https://") {
		return arg, nil
	}

	newArg, err = t.svc.oss.GetObjectUrl(ctx, uri)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetObjectUrl failed, uri=%s", uri)
	}

	return newArg, nil
}

func (t *toolExecutor) getDefaultValue(ctx context.Context, scVal *openapi3.Schema) (any, error) {
	vn, exist := scVal.Extensions[model.APISchemaExtendVariableRef]
	if !exist {
		return scVal.Default, nil
	}

	vnStr, ok := vn.(string)
	if !ok {
		logs.CtxErrorf(ctx, "invalid variable_ref type '%T'", vn)
		return nil, nil
	}

	variableVal, err := t.getVariableValue(ctx, vnStr)
	if err != nil {
		return nil, err
	}

	return variableVal, nil
}

func (t *toolExecutor) getVariableValue(ctx context.Context, keyword string) (any, error) {
	info := t.projectInfo
	if info == nil {
		return nil, fmt.Errorf("project info is nil")
	}

	meta := &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        strconv.FormatInt(info.ProjectID, 10),
		Version:      ptr.FromOrDefault(info.ProjectVersion, ""),
		ConnectorUID: t.userID,
		ConnectorID:  info.ConnectorID,
	}
	vals, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, meta, []string{keyword})
	if err != nil {
		return nil, err
	}

	if len(vals) == 0 {
		return nil, nil
	}

	return vals[0].Value, nil
}

func (t *toolExecutor) injectAuthInfo(_ context.Context, httpReq *http.Request) (errMsg string, error error) {
	authInfo := t.plugin.GetAuthInfo()
	if authInfo.Type == model.AuthzTypeOfNone {
		return "", nil
	}

	if authInfo.Type == model.AuthzTypeOfService {
		return t.injectServiceAPIToken(httpReq.Context(), httpReq, authInfo)
	}

	if authInfo.Type == model.AuthzTypeOfOAuth {
		return t.injectOAuthAccessToken(httpReq.Context(), httpReq, authInfo)
	}

	return "", nil
}

func (t *toolExecutor) injectServiceAPIToken(ctx context.Context, httpReq *http.Request, authInfo *model.AuthV2) (errMsg string, err error) {
	if authInfo.SubType == model.AuthzSubTypeOfServiceAPIToken {
		authOfAPIToken := authInfo.AuthOfAPIToken
		if authOfAPIToken == nil {
			return "", fmt.Errorf("auth of api token is nil")
		}

		loc := strings.ToLower(string(authOfAPIToken.Location))
		if loc == openapi3.ParameterInQuery {
			query := httpReq.URL.Query()
			if query.Get(authOfAPIToken.Key) == "" {
				query.Set(authOfAPIToken.Key, authOfAPIToken.ServiceToken)
				httpReq.URL.RawQuery = query.Encode()
			}
		}

		if loc == openapi3.ParameterInHeader {
			if httpReq.Header.Get(authOfAPIToken.Key) == "" {
				httpReq.Header.Set(authOfAPIToken.Key, authOfAPIToken.ServiceToken)
			}
		}
	}

	return "", nil
}

func (t *toolExecutor) injectOAuthAccessToken(ctx context.Context, httpReq *http.Request, authInfo *model.AuthV2) (errMsg string, err error) {
	authMode := model.ToolAuthModeOfRequired
	if tmp, ok := t.tool.Operation.Extensions[model.APISchemaExtendAuthMode].(string); ok {
		authMode = model.ToolAuthMode(tmp)
	}

	if authMode == model.ToolAuthModeOfDisabled {
		return "", nil
	}

	var accessToken string

	if authInfo.SubType == model.AuthzSubTypeOfOAuthAuthorizationCode {
		i := &entity.AuthorizationCodeInfo{
			Meta: &entity.AuthorizationCodeMeta{
				UserID:   t.userID,
				PluginID: t.plugin.ID,
				IsDraft:  t.execScene == model.ExecSceneOfToolDebug,
			},
			Config: authInfo.AuthOfOAuthAuthorizationCode,
		}

		accessToken, err = t.svc.GetAccessToken(ctx, &entity.OAuthInfo{
			OAuthMode:         authInfo.SubType,
			AuthorizationCode: i,
		})
		if err != nil {
			return "", err
		}

		if accessToken == "" && authMode != model.ToolAuthModeOfSupported {
			errMsg = authCodeInvalidTokenErrMsg[i18n.GetLocale(ctx)]
			if errMsg == "" {
				errMsg = authCodeInvalidTokenErrMsg[i18n.LocaleEN]
			}
			authURL, err := genAuthURL(i)
			if err != nil {
				return "", err
			}

			errMsg = fmt.Sprintf(errMsg, t.plugin.Manifest.NameForHuman, authURL)

			return errMsg, nil
		}
	}

	if accessToken != "" {
		httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	}

	return "", nil
}

var authCodeInvalidTokenErrMsg = map[i18n.Locale]string{
	i18n.LocaleZH: "%s 插件需要授权使用。授权后即代表你同意与扣子中你所选择的 AI 模型分享数据。请[点击这里](%s)进行授权。",
	i18n.LocaleEN: "The '%s' plugin requires authorization. By authorizing, you agree to share data with the AI model you selected in Coze. Please [click here](%s) to authorize.",
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
			newParamValMap := map[string]any{}
			paramValMap, ok := paramVal.(map[string]any)
			if !ok {
				return nil, errorx.New(errno.ErrPluginExecuteToolFailed, errorx.KVf(errno.PluginMsgKey,
					"expected '%s' to be of type 'object', but got '%T'", paramName, paramVal))
			}

			for paramName_, paramVal_ := range paramValMap {
				paramSchema_, ok := schemaVal.Properties[paramName]
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
			newParamValSlice := []any{}
			paramValSlice, ok := paramVal.([]any)
			if !ok {
				return nil, errorx.New(errno.ErrPluginExecuteToolFailed, errorx.KVf(errno.PluginMsgKey,
					"expected '%s' to be of type 'array', but got '%T'", paramName, paramVal))
			}

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

type locationArguments struct {
	header map[string]valueWithSchema
	path   map[string]valueWithSchema
	query  map[string]valueWithSchema
}

type valueWithSchema struct {
	argValue    any
	paramSchema *openapi3.Parameter
}

func (l *locationArguments) buildHTTPRequestURL(_ context.Context, rawURL string,
	commonParams map[model.HTTPParamLocation][]*common.CommonParamSchema) (reqURL *url.URL, err error) {

	if len(l.path) > 0 {
		for k, v := range l.path {
			vStr, err := encoder.EncodeParameter(v.paramSchema, v.argValue)
			if err != nil {
				return nil, err
			}
			rawURL = strings.ReplaceAll(rawURL, "{"+k+"}", vStr)
		}
	}

	query := url.Values{}
	if len(l.query) > 0 {
		for k, val := range l.query {
			switch v := val.argValue.(type) {
			case []any:
				for _, _v := range v {
					query.Add(k, encoder.MustString(_v))
				}
			default:
				query.Add(k, encoder.MustString(v))
			}
		}
	}

	commonQuery := commonParams[model.ParamInQuery]
	for _, v := range commonQuery {
		if _, ok := l.query[v.Name]; ok {
			continue
		}
		query.Add(v.Name, v.Value)
	}

	encodeQuery := query.Encode()

	reqURL, err = url.Parse(rawURL)
	if err != nil {
		return nil, err
	}

	if len(reqURL.RawQuery) > 0 && len(encodeQuery) > 0 {
		reqURL.RawQuery += "&" + encodeQuery
	} else if len(encodeQuery) > 0 {
		reqURL.RawQuery = encodeQuery
	}

	return reqURL, nil
}

func (l *locationArguments) buildHTTPRequestHeader(_ context.Context, commonHeaders []*common.CommonParamSchema) (http.Header, error) {
	header := http.Header{}
	if len(l.header) > 0 {
		for k, v := range l.header {
			switch vv := v.argValue.(type) {
			case []any:
				for _, _v := range vv {
					header.Add(k, encoder.MustString(_v))
				}
			default:
				header.Add(k, encoder.MustString(vv))
			}
		}
	}

	for _, h := range commonHeaders {
		if header.Get(h.Name) != "" {
			continue
		}
		header.Add(h.Name, h.Value)
	}

	return header, nil
}

func (t *toolExecutor) buildRequestBody(ctx context.Context, op *model.Openapi3Operation, bodyArgs map[string]any,
	commonBody []*common.CommonParamSchema) (body []byte, contentType string, err error) {

	var bodyMap map[string]any

	contentType, bodySchema := t.getReqBodySchema(op)
	if bodySchema != nil && len(bodySchema.Value.Properties) > 0 {
		bodyMap, err = t.injectRequestBodyDefaultValue(ctx, bodySchema.Value, bodyArgs)
		if err != nil {
			return nil, "", err
		}

		for paramName, prop := range bodySchema.Value.Properties {
			value, ok := bodyMap[paramName]
			if !ok {
				continue
			}

			_value, err := encoder.TryFixValueType(paramName, prop, value)
			if err != nil {
				return nil, "", err
			}

			bodyMap[paramName] = _value
		}

		body, err = encoder.EncodeBodyWithContentType(contentType, bodyMap)
		if err != nil {
			return nil, "", fmt.Errorf("[buildRequestBody] EncodeBodyWithContentType failed, err=%v", err)
		}
	}

	commonBody_ := make([]*common.CommonParamSchema, 0, len(commonBody))
	for _, v := range commonBody {
		if _, ok := bodyMap[v.Name]; ok {
			continue
		}
		commonBody_ = append(commonBody_, v)
	}

	for _, v := range commonBody_ {
		body, err = sjson.SetRawBytes(body, v.Name, []byte(v.Value))
		if err != nil {
			return nil, "", fmt.Errorf("[buildRequestBody] SetRawBytes failed, err=%v", err)
		}
	}

	return body, contentType, nil
}

func (t *toolExecutor) injectRequestBodyDefaultValue(ctx context.Context, sc *openapi3.Schema, vals map[string]any) (newVals map[string]any, err error) {
	required := slices.ToMap(sc.Required, func(e string) (string, bool) {
		return e, true
	})

	newVals = make(map[string]any, len(sc.Properties))

	for paramName, prop := range sc.Properties {
		paramSchema := prop.Value
		if paramSchema.Type == openapi3.TypeObject {
			val := vals[paramName]
			if val == nil {
				val = map[string]any{}
			}

			mapVal, ok := val.(map[string]any)
			if !ok {
				return nil, fmt.Errorf("[injectRequestBodyDefaultValue] parameter '%s' is not object", paramName)
			}

			newMapVal, err := t.injectRequestBodyDefaultValue(ctx, paramSchema, mapVal)
			if err != nil {
				return nil, err
			}

			if len(newMapVal) > 0 {
				newVals[paramName] = newMapVal
			}

			continue
		}

		if val := vals[paramName]; val != nil {
			newVals[paramName] = val
			continue
		}

		defaultVal, err := t.getDefaultValue(ctx, paramSchema)
		if err != nil {
			return nil, err
		}
		if defaultVal == nil {
			if !required[paramName] {
				continue
			}
			return nil, fmt.Errorf("[injectRequestBodyDefaultValue] parameter '%s' is required", paramName)
		}

		newVals[paramName] = defaultVal
	}

	return newVals, nil
}

func (t *toolExecutor) getReqBodySchema(op *model.Openapi3Operation) (string, *openapi3.SchemaRef) {
	if op.RequestBody == nil || len(op.RequestBody.Value.Content) == 0 {
		return "", nil
	}

	var contentTypeArray = []string{
		model.MediaTypeJson,
		model.MediaTypeProblemJson,
		model.MediaTypeFormURLEncoded,
		model.MediaTypeXYaml,
		model.MediaTypeYaml,
	}

	for _, ct := range contentTypeArray {
		mType := op.RequestBody.Value.Content[ct]
		if mType == nil {
			continue
		}

		return ct, mType.Schema
	}

	return "", nil
}
