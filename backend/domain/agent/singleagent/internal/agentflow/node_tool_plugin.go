package agentflow

import (
	"context"
	"fmt"

	"github.com/getkin/kin-openapi/openapi3"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/plugin/service"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	pluginEntity "code.byted.org/flow/opencoze/backend/domain/plugin/entity"
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
				VersionMs: a.ApiVersionMs,
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
	paramInfos, err := convertParameterInfo(ctx, p.toolInfo.Operation)
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

func convertParameterInfo(_ context.Context, op *openapi3.Operation) (map[string]*schema.ParameterInfo, error) {
	convertType := func(openapiType string) schema.DataType {
		switch openapiType {
		case openapi3.TypeString:
			return schema.String
		case openapi3.TypeInteger:
			return schema.Integer
		case openapi3.TypeObject:
			return schema.Object
		case openapi3.TypeArray:
			return schema.Array
		case openapi3.TypeBoolean:
			return schema.Boolean
		case openapi3.TypeNumber:
			return schema.Number
		default:
			return schema.Null
		}
	}

	disabledParam := func(schemaVal *openapi3.Schema) bool {
		globalDisable, localDisable := false, false
		if v, ok := schemaVal.Extensions[consts.APISchemaExtendLocalDisable]; ok {
			localDisable = v.(bool)
		}
		if v, ok := schemaVal.Extensions[consts.APISchemaExtendGlobalDisable]; ok {
			globalDisable = v.(bool)
		}
		return globalDisable || localDisable
	}

	var convertReqBody func(sc *openapi3.Schema, isRequired bool) (*schema.ParameterInfo, error)
	convertReqBody = func(sc *openapi3.Schema, isRequired bool) (*schema.ParameterInfo, error) {
		if disabledParam(sc) {
			return nil, nil
		}

		paramInfo := &schema.ParameterInfo{
			Type:     convertType(sc.Type),
			Desc:     sc.Description,
			Required: isRequired,
		}

		switch sc.Type {
		case openapi3.TypeObject:
			required := slices.ToMap(sc.Required, func(e string) (string, bool) {
				return e, true
			})

			subParams := make(map[string]*schema.ParameterInfo, len(sc.Properties))
			for paramName, prop := range sc.Properties {
				subParam, err := convertReqBody(prop.Value, required[paramName])
				if err != nil {
					return nil, err
				}

				subParams[paramName] = subParam
			}

			paramInfo.SubParams = subParams
		case openapi3.TypeArray:
			ele, err := convertReqBody(sc.Items.Value, isRequired)
			if err != nil {
				return nil, err
			}

			paramInfo.ElemInfo = ele
		case openapi3.TypeString, openapi3.TypeInteger, openapi3.TypeBoolean, openapi3.TypeNumber:
			return paramInfo, nil
		default:
			return nil, fmt.Errorf("unsupported json type '%s'", sc.Type)
		}

		return paramInfo, nil
	}

	result := make(map[string]*schema.ParameterInfo)

	for _, prop := range op.Parameters {
		paramVal := prop.Value
		schemaVal := paramVal.Schema.Value
		if schemaVal.Type == openapi3.TypeObject || schemaVal.Type == openapi3.TypeArray {
			continue
		}

		if disabledParam(prop.Value.Schema.Value) {
			continue
		}

		paramInfo := &schema.ParameterInfo{
			Type:     convertType(schemaVal.Type),
			Desc:     paramVal.Description,
			Required: paramVal.Required,
		}

		if _, ok := result[paramVal.Name]; ok {
			return nil, fmt.Errorf("duplicate param name '%s'", paramVal.Name)
		}

		result[paramVal.Name] = paramInfo
	}

	for _, mType := range op.RequestBody.Value.Content {
		schemaVal := mType.Schema.Value
		if len(schemaVal.Properties) == 0 {
			continue
		}

		required := slices.ToMap(schemaVal.Required, func(e string) (string, bool) {
			return e, true
		})

		for paramName, prop := range schemaVal.Properties {
			paramInfo, err := convertReqBody(prop.Value, required[paramName])
			if err != nil {
				return nil, err
			}

			if _, ok := result[paramName]; ok {
				return nil, fmt.Errorf("duplicate param name '%s'", paramName)
			}

			result[paramName] = paramInfo
		}

		break // 只取一种 MIME
	}

	return result, nil
}
