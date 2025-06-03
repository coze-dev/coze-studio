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

func (p PluginInfo) GetName() string {
	if p.Manifest == nil {
		return ""
	}
	return p.Manifest.NameForHuman
}

func (p PluginInfo) GetDesc() string {
	if p.Manifest == nil {
		return ""
	}
	return p.Manifest.DescriptionForHuman
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

func (p PluginInfo) GetAuthInfo() *AuthV2 {
	if p.Manifest == nil {
		return nil
	}
	return NewAuthV2(p.Manifest.Auth)
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

type paramMetaInfo struct {
	name     string
	desc     string
	required bool
	location string
}

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

type ExecuteToolOpts = plugin.ExecuteToolOpts

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

type AuthV2 struct {
	*plugin.AuthV2
}

func NewAuthV2(v *plugin.AuthV2) *AuthV2 {
	return &AuthV2{
		AuthV2: v,
	}
}

type Auth struct {
	Type                     string `json:"type" validate:"required"`
	AuthorizationType        string `json:"authorization_type,omitempty"`
	ClientURL                string `json:"client_url,omitempty"`
	Scope                    string `json:"scope,omitempty"`
	AuthorizationURL         string `json:"authorization_url,omitempty"`
	AuthorizationContentType string `json:"authorization_content_type,omitempty"`
	Platform                 string `json:"platform,omitempty"`
	ClientID                 string `json:"client_id,omitempty"`
	ClientSecret             string `json:"client_secret,omitempty"`
	Location                 string `json:"location,omitempty"`
	Key                      string `json:"key,omitempty"`
	ServiceToken             string `json:"service_token"`
	SubType                  string `json:"sub_type"`
	Payload                  string `json:"payload"`
}

func (au *AuthV2) UnmarshalJSON(data []byte) error {
	auth := &Auth{} // 兼容老数据
	err := sonic.Unmarshal(data, auth)
	if err != nil {
		return err
	}

	au.Type = plugin.AuthType(auth.Type)
	au.SubType = plugin.AuthSubType(auth.SubType)

	if au.Type == plugin.AuthTypeOfNone {
		return nil
	}

	if au.Type == plugin.AuthTypeOfOAuth {
		if len(auth.ClientSecret) > 0 {
			au.AuthOfOAuth = &plugin.AuthOfOAuth{
				ClientID:                 auth.ClientID,
				ClientSecret:             auth.ClientSecret,
				ClientURL:                auth.ClientURL,
				Scope:                    auth.Scope,
				AuthorizationURL:         auth.AuthorizationURL,
				AuthorizationContentType: auth.AuthorizationContentType,
			}
		} else {
			oauth := &plugin.AuthOfOAuth{}
			err = sonic.UnmarshalString(auth.Payload, oauth)
			if err != nil {
				return err
			}
			au.AuthOfOAuth = oauth
		}

		payload, err := sonic.MarshalString(au.AuthOfOAuth)
		if err != nil {
			return err
		}

		au.Payload = &payload
	}

	if au.Type == plugin.AuthTypeOfService {
		if au.SubType == "" && (au.Payload == nil || *au.Payload == "") { // 兼容老数据
			au.SubType = plugin.AuthSubTypeOfToken
		}
		switch au.SubType {
		case plugin.AuthSubTypeOfOIDC:
			oidc := &plugin.AuthOfOIDC{}
			err = sonic.UnmarshalString(auth.Payload, oidc)
			if err != nil {
				return err
			}

			au.Payload = &auth.Payload

		case plugin.AuthSubTypeOfToken:
			if len(auth.ServiceToken) > 0 {
				au.AuthOfToken = &plugin.AuthOfToken{
					Location:     plugin.HTTPParamLocation(auth.Location),
					Key:          auth.Key,
					ServiceToken: auth.ServiceToken,
				}
			} else {
				token := &plugin.AuthOfToken{}
				err = sonic.UnmarshalString(auth.Payload, token)
				if err != nil {
					return err
				}
				au.AuthOfToken = token
			}

			payload, err := sonic.MarshalString(au.AuthOfToken)
			if err != nil {
				return err
			}

			au.Payload = &payload
		}
	}

	return nil
}

type UniqueToolAPI struct {
	SubURL string
	Method string
}
