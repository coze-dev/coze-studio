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

package plugin

import (
	"context"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	workflow3 "github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
)

//go:generate  mockgen -destination pluginmock/plugin_mock.go --package pluginmock -source plugin.go
type Service interface {
	GetPluginToolsInfo(ctx context.Context, req *ToolsInfoRequest) (*ToolsInfoResponse, error)
	UnwrapArrayItemFieldsInVariable(v *vo.Variable) error
	GetPluginInvokableTools(ctx context.Context, req *ToolsInvokableRequest) (map[int64]InvokableTool, error)
	ExecutePlugin(ctx context.Context, input map[string]any, pe *Entity,
		toolID int64, cfg ExecConfig) (map[string]any, error)
}

func GetPluginService() Service {
	return pluginSrvImpl
}

func SetPluginService(ts Service) {
	pluginSrvImpl = ts
}

var pluginSrvImpl Service

type Entity = vo.PluginEntity

type WorkflowAPIParameters = []*workflow3.APIParameter
type ToolsInfoRequest struct {
	PluginEntity Entity
	ToolIDs      []int64
	IsDraft      bool
}
type ToolsInvokableInfo struct {
	ToolID                      int64
	RequestAPIParametersConfig  WorkflowAPIParameters
	ResponseAPIParametersConfig WorkflowAPIParameters
}

type ToolsInvokableRequest struct {
	PluginEntity       Entity
	ToolsInvokableInfo map[int64]*ToolsInvokableInfo
	IsDraft            bool
}

type DebugExample struct {
	ReqExample  string
	RespExample string
}

type ToolInfo struct {
	ToolName     string
	ToolID       int64
	Description  string
	DebugExample *DebugExample

	Inputs  []*workflow3.APIParameter
	Outputs []*workflow3.APIParameter
}

type ToolsInfoResponse struct {
	PluginID      int64
	SpaceID       int64
	Version       string
	PluginName    string
	Description   string
	IconURL       string
	PluginType    int64
	ToolInfoList  map[int64]ToolInfo
	LatestVersion *string
	IsOfficial    bool
	AppID         int64
}

type ExecConfig = vo.ExecuteConfig

type InvokableTool interface {
	Info(ctx context.Context) (*schema.ToolInfo, error)
	PluginInvoke(ctx context.Context, argumentsInJSON string, cfg ExecConfig) (string, error)
}

type pluginInvokableTool struct {
	pluginInvokableTool InvokableTool
}

func NewInvokableTool(pl InvokableTool) tool.InvokableTool {
	return &pluginInvokableTool{
		pluginInvokableTool: pl,
	}
}

func (p pluginInvokableTool) Info(ctx context.Context) (*schema.ToolInfo, error) {
	return p.pluginInvokableTool.Info(ctx)
}

func (p pluginInvokableTool) InvokableRun(ctx context.Context, argumentsInJSON string, opts ...tool.Option) (string, error) {
	execCfg := execute.GetExecuteConfig(opts...)
	return p.pluginInvokableTool.PluginInvoke(ctx, argumentsInJSON, execCfg)
}
