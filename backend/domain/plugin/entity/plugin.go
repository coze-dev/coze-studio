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

package entity

import (
	"context"
	"net/http"
	"strconv"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	"github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type PluginInfo struct {
	*model.PluginInfo
}

func NewPluginInfo(info *model.PluginInfo) *PluginInfo {
	return &PluginInfo{
		PluginInfo: info,
	}
}

func NewPluginInfos(infos []*model.PluginInfo) []*PluginInfo {
	res := make([]*PluginInfo, 0, len(infos))
	for _, info := range infos {
		res = append(res, NewPluginInfo(info))
	}

	return res
}

func (p PluginInfo) GetServerURL() string {
	return ptr.FromOrDefault(p.ServerURL, "")
}

func (p PluginInfo) GetRefProductID() int64 {
	return ptr.FromOrDefault(p.RefProductID, 0)
}

func (p PluginInfo) GetVersion() string {
	return ptr.FromOrDefault(p.Version, "")
}

func (p PluginInfo) GetVersionDesc() string {
	return ptr.FromOrDefault(p.VersionDesc, "")
}

func (p PluginInfo) GetAPPID() int64 {
	return ptr.FromOrDefault(p.APPID, 0)
}

type ToolExample struct {
	RequestExample  string
	ResponseExample string
}

func (p PluginInfo) GetToolExample(ctx context.Context, toolName string) *ToolExample {
	if p.OpenapiDoc == nil ||
		p.OpenapiDoc.Components == nil ||
		len(p.OpenapiDoc.Components.Examples) == 0 {
		return nil
	}
	example, ok := p.OpenapiDoc.Components.Examples[toolName]
	if !ok {
		return nil
	}
	if example.Value == nil || example.Value.Value == nil {
		return nil
	}

	val, ok := example.Value.Value.(map[string]any)
	if !ok {
		return nil
	}

	reqExample, ok := val["ReqExample"]
	if !ok {
		return nil
	}
	reqExampleStr, err := sonic.MarshalString(reqExample)
	if err != nil {
		logs.CtxErrorf(ctx, "marshal request example failed, err=%v", err)
		return nil
	}

	respExample, ok := val["RespExample"]
	if !ok {
		return nil
	}
	respExampleStr, err := sonic.MarshalString(respExample)
	if err != nil {
		logs.CtxErrorf(ctx, "marshal response example failed, err=%v", err)
		return nil
	}

	return &ToolExample{
		RequestExample:  reqExampleStr,
		ResponseExample: respExampleStr,
	}
}

type ToolInfo = model.ToolInfo

type AgentToolIdentity struct {
	ToolID    int64
	ToolName  *string
	AgentID   int64
	VersionMs *int64
}

type VersionTool = model.VersionTool

type VersionPlugin = model.VersionPlugin

type VersionAgentTool = model.VersionAgentTool

type ExecuteToolOpt = model.ExecuteToolOpt

type ProjectInfo = model.ProjectInfo

type PluginManifest = model.PluginManifest

// TODO API.DESC 来给不同 default 值
func NewDefaultPluginManifest() *PluginManifest {
	return &model.PluginManifest{
		SchemaVersion: "v1",
		API: model.APIDesc{
			Type: model.PluginTypeOfCloud,
		},
		Auth: &model.AuthV2{
			Type: model.AuthzTypeOfNone,
		},
		CommonParams: map[model.HTTPParamLocation][]*common.CommonParamSchema{
			model.ParamInBody: {},
			model.ParamInHeader: {
				{
					Name:  "User-Agent",
					Value: "Coze/1.0",
				},
			},
			model.ParamInQuery: {},
		},
	}
}

func NewDefaultOpenapiDoc() *model.Openapi3T {
	return &model.Openapi3T{
		OpenAPI: "3.0.1",
		Info: &openapi3.Info{
			Version: "v1",
		},
		Paths:   openapi3.Paths{},
		Servers: openapi3.Servers{},
	}
}

type UniqueToolAPI struct {
	SubURL string
	Method string
}

func DefaultOpenapi3Responses() openapi3.Responses {
	return openapi3.Responses{
		strconv.Itoa(http.StatusOK): {
			Value: &openapi3.Response{
				Description: ptr.Of("description is required"),
				Content: openapi3.Content{
					model.MediaTypeJson: &openapi3.MediaType{
						Schema: &openapi3.SchemaRef{
							Value: &openapi3.Schema{
								Type:       openapi3.TypeObject,
								Properties: map[string]*openapi3.SchemaRef{},
							},
						},
					},
				},
			},
		},
	}
}

func DefaultOpenapi3RequestBody() *openapi3.RequestBodyRef {
	return &openapi3.RequestBodyRef{
		Value: &openapi3.RequestBody{
			Content: map[string]*openapi3.MediaType{
				model.MediaTypeJson: {
					Schema: &openapi3.SchemaRef{
						Value: &openapi3.Schema{
							Type:       openapi3.TypeObject,
							Properties: map[string]*openapi3.SchemaRef{},
						},
					},
				},
			},
		},
	}
}
