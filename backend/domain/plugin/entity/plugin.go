package entity

import (
	"context"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type PluginInfo struct {
	*plugin.PluginInfo
}

func NewPluginInfo(info *plugin.PluginInfo) *PluginInfo {
	return &PluginInfo{
		PluginInfo: info,
	}
}

func NewPluginInfos(infos []*plugin.PluginInfo) []*PluginInfo {
	res := make([]*PluginInfo, 0, len(infos))
	for _, info := range infos {
		res = append(res, NewPluginInfo(info))
	}

	return res
}

func (p PluginInfo) GetIconURI() string {
	return ptr.FromOrDefault(p.IconURI, "")
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

type ToolInfo = plugin.ToolInfo

type AgentToolIdentity struct {
	ToolID    int64
	ToolName  *string
	AgentID   int64
	VersionMs *int64
}

type VersionTool struct {
	ToolID  int64
	Version *string
}

type VersionPlugin = plugin.VersionPlugin

type VersionAgentTool = plugin.VersionAgentTool

type ExecuteToolOpt = plugin.ExecuteToolOpt

type ProjectInfo = plugin.ProjectInfo

type PluginManifest = plugin.PluginManifest

func NewDefaultPluginManifest() *PluginManifest {
	return &plugin.PluginManifest{
		SchemaVersion: "v1",
		API: plugin.APIDesc{
			Type: plugin.PluginTypeOfCloud,
		},
		Auth: &plugin.AuthV2{
			Type: plugin.AuthTypeOfNone,
		},
		CommonParams: map[plugin.HTTPParamLocation][]*plugin_develop_common.CommonParamSchema{
			plugin.ParamInBody: {},
			plugin.ParamInHeader: {
				{
					Name:  "User-Agent",
					Value: "Coze/1.0",
				},
			},
			plugin.ParamInPath:  {},
			plugin.ParamInQuery: {},
		},
	}
}

func NewDefaultOpenapiDoc() *plugin.Openapi3T {
	return &plugin.Openapi3T{
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
