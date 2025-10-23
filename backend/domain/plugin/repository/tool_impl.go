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

package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"runtime/debug"
	"strconv"
	"strings"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	pluginCommon "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/convert/api"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	pluginConf "github.com/coze-dev/coze-studio/backend/domain/plugin/conf"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/dto"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/saasapi"
)

type toolRepoImpl struct {
	query *query.Query

	pluginDraftDAO *dal.PluginDraftDAO

	toolDraftDAO        *dal.ToolDraftDAO
	toolDAO             *dal.ToolDAO
	toolVersionDAO      *dal.ToolVersionDAO
	agentToolDraftDAO   *dal.AgentToolDraftDAO
	agentToolVersionDAO *dal.AgentToolVersionDAO
}

type ToolRepoComponents struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewToolRepo(components *ToolRepoComponents) ToolRepository {
	return &toolRepoImpl{
		query:               query.Use(components.DB),
		pluginDraftDAO:      dal.NewPluginDraftDAO(components.DB, components.IDGen),
		toolDraftDAO:        dal.NewToolDraftDAO(components.DB, components.IDGen),
		toolDAO:             dal.NewToolDAO(components.DB, components.IDGen),
		toolVersionDAO:      dal.NewToolVersionDAO(components.DB, components.IDGen),
		agentToolDraftDAO:   dal.NewAgentToolDraftDAO(components.DB, components.IDGen),
		agentToolVersionDAO: dal.NewAgentToolVersionDAO(components.DB, components.IDGen),
	}
}

func (t *toolRepoImpl) CreateDraftTool(ctx context.Context, tool *entity.ToolInfo) (toolID int64, err error) {
	return t.toolDraftDAO.Create(ctx, tool)
}

func (t *toolRepoImpl) UpsertDraftTools(ctx context.Context, pluginID int64, tools []*entity.ToolInfo) (err error) {
	apis := slices.Transform(tools, func(tool *entity.ToolInfo) dto.UniqueToolAPI {
		return dto.UniqueToolAPI{
			SubURL: tool.GetSubURL(),
			Method: tool.GetMethod(),
		}
	})

	existTools, err := t.toolDraftDAO.MGetWithAPIs(ctx, pluginID, apis, nil)
	if err != nil {
		return err
	}

	tx := t.query.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			if e := tx.Rollback(); e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}
			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))
			return
		}
		if err != nil {
			if e := tx.Rollback(); e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}
		}
	}()

	createdTools := make([]*entity.ToolInfo, 0, len(tools))
	updatedTools := make([]*entity.ToolInfo, 0, len(existTools))

	for _, tool := range tools {
		existTool, exist := existTools[dto.UniqueToolAPI{
			SubURL: tool.GetSubURL(),
			Method: tool.GetMethod(),
		}]
		if !exist {
			createdTools = append(createdTools, tool)
			continue
		}

		tool.ID = existTool.ID

		updatedTools = append(updatedTools, tool)
	}

	if len(createdTools) > 0 {
		_, err = t.toolDraftDAO.BatchCreateWithTX(ctx, tx, createdTools)
		if err != nil {
			return err
		}
	}

	if len(updatedTools) > 0 {
		err = t.toolDraftDAO.BatchUpdateWithTX(ctx, tx, updatedTools)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (t *toolRepoImpl) UpdateDraftTool(ctx context.Context, tool *entity.ToolInfo) (err error) {
	return t.toolDraftDAO.Update(ctx, tool)
}

func (t *toolRepoImpl) GetDraftTool(ctx context.Context, toolID int64) (tool *entity.ToolInfo, exist bool, err error) {
	return t.toolDraftDAO.Get(ctx, toolID)
}

func (t *toolRepoImpl) MGetDraftTools(ctx context.Context, toolIDs []int64, opts ...ToolSelectedOptions) (tools []*entity.ToolInfo, err error) {
	var opt *dal.ToolSelectedOption
	if len(opts) > 0 {
		opt = &dal.ToolSelectedOption{}
		for _, o := range opts {
			o(opt)
		}
	}
	return t.toolDraftDAO.MGet(ctx, toolIDs, opt)
}

func (t *toolRepoImpl) GetPluginAllDraftTools(ctx context.Context, pluginID int64, opts ...ToolSelectedOptions) (tools []*entity.ToolInfo, err error) {
	var opt *dal.ToolSelectedOption
	if len(opts) > 0 {
		opt = &dal.ToolSelectedOption{}
		for _, o := range opts {
			o(opt)
		}
	}
	return t.toolDraftDAO.GetAll(ctx, pluginID, opt)
}

func (t *toolRepoImpl) GetPluginAllOnlineTools(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error) {
	pi, exist := pluginConf.GetPluginProduct(pluginID)
	if exist {
		tis := pi.GetPluginAllTools()
		tools = slices.Transform(tis, func(ti *pluginConf.ToolInfo) *entity.ToolInfo {
			return ti.Info
		})

		return tools, nil
	}

	tools, err = t.toolDAO.GetAll(ctx, pluginID)
	if err != nil {
		return nil, err
	}

	return tools, nil
}

func (t *toolRepoImpl) ListPluginDraftTools(ctx context.Context, pluginID int64, pageInfo dto.PageInfo) (tools []*entity.ToolInfo, total int64, err error) {
	return t.toolDraftDAO.List(ctx, pluginID, pageInfo)
}

func (t *toolRepoImpl) GetDraftToolWithAPI(ctx context.Context, pluginID int64, api dto.UniqueToolAPI) (tool *entity.ToolInfo, exist bool, err error) {
	return t.toolDraftDAO.GetWithAPI(ctx, pluginID, api)
}

func (t *toolRepoImpl) MGetDraftToolWithAPI(ctx context.Context, pluginID int64, apis []dto.UniqueToolAPI, opts ...ToolSelectedOptions) (tools map[dto.UniqueToolAPI]*entity.ToolInfo, err error) {
	var opt *dal.ToolSelectedOption
	if len(opts) > 0 {
		opt = &dal.ToolSelectedOption{}
		for _, o := range opts {
			o(opt)
		}
	}
	return t.toolDraftDAO.MGetWithAPIs(ctx, pluginID, apis, opt)
}

func (t *toolRepoImpl) DeleteDraftTool(ctx context.Context, toolID int64) (err error) {
	return t.toolDraftDAO.Delete(ctx, toolID)
}

func (t *toolRepoImpl) GetOnlineTool(ctx context.Context, toolID int64) (tool *entity.ToolInfo, exist bool, err error) {
	ti, exist := pluginConf.GetToolProduct(toolID)
	if exist {
		return ti.Info, true, nil
	}

	return t.toolDAO.Get(ctx, toolID)
}

func (t *toolRepoImpl) MGetOnlineTools(ctx context.Context, toolIDs []int64, opts ...ToolSelectedOptions) (tools []*entity.ToolInfo, err error) {
	toolProducts := pluginConf.MGetToolProducts(toolIDs)

	tools = slices.Transform(toolProducts, func(tool *pluginConf.ToolInfo) *entity.ToolInfo {
		return tool.Info
	})
	productToolIDs := slices.ToMap(toolProducts, func(tool *pluginConf.ToolInfo) (int64, bool) {
		return tool.Info.ID, true
	})

	customToolIDs := make([]int64, 0, len(toolIDs))
	for _, id := range toolIDs {
		_, ok := productToolIDs[id]
		if ok {
			continue
		}
		customToolIDs = append(customToolIDs, id)
	}

	var opt *dal.ToolSelectedOption
	if len(opts) > 0 {
		opt = &dal.ToolSelectedOption{}
		for _, o := range opts {
			o(opt)
		}
	}

	customTools, err := t.toolDAO.MGet(ctx, customToolIDs, opt)
	if err != nil {
		return nil, err
	}

	tools = append(tools, customTools...)

	return tools, nil
}

func (t *toolRepoImpl) GetVersionTool(ctx context.Context, vTool model.VersionTool) (tool *entity.ToolInfo, exist bool, err error) {
	ti, exist := pluginConf.GetToolProduct(vTool.ToolID)
	if exist {
		return ti.Info, true, nil
	}

	return t.toolVersionDAO.Get(ctx, vTool)
}

func (t *toolRepoImpl) MGetVersionTools(ctx context.Context, versionTools []model.VersionTool) (tools []*entity.ToolInfo, err error) {
	tools, err = t.toolVersionDAO.MGet(ctx, versionTools)
	if err != nil {
		return nil, err
	}

	return tools, nil
}

func (t *toolRepoImpl) BindDraftAgentTools(ctx context.Context, agentID int64, bindTools []*model.BindToolInfo) (err error) {
	opt := &dal.ToolSelectedOption{
		ToolID: true,
	}
	draftAgentTools, err := t.agentToolDraftDAO.GetAll(ctx, agentID, opt)
	if err != nil {
		return err
	}

	var allToolIDs []int64
	var localToolIDs []int64
	var saasToolIDs []int64
	var saasToolPluginIDs []int64
	allToolIDs = slices.Transform(bindTools, func(tool *model.BindToolInfo) int64 {
		return tool.ToolID
	})

	for _, tool := range bindTools {
		if ptr.From(tool.Source) == bot_common.PluginFrom_FromSaas {
			saasToolIDs = append(saasToolIDs, tool.ToolID)
			saasToolPluginIDs = append(saasToolPluginIDs, tool.PluginID)
		} else {
			localToolIDs = append(localToolIDs, tool.ToolID)

		}
	}

	draftAgentToolIDMap := slices.ToMap(draftAgentTools, func(tool *entity.ToolInfo) (int64, bool) {
		return tool.ID, true
	})

	bindToolIDMap := slices.ToMap(allToolIDs, func(toolID int64) (int64, bool) {
		return toolID, true
	})

	newLocalBindToolIDs := make([]int64, 0, len(allToolIDs))
	newSaasBindToolIDs := make([]int64, 0, len(allToolIDs))
	for _, toolID := range allToolIDs {
		_, ok := draftAgentToolIDMap[toolID]
		if ok {
			continue
		}
		if slices.Contains(saasToolIDs, toolID) {
			newSaasBindToolIDs = append(newSaasBindToolIDs, toolID)
		} else {
			newLocalBindToolIDs = append(newLocalBindToolIDs, toolID)
		}
	}

	removeToolIDs := make([]int64, 0, len(draftAgentTools))
	for toolID := range draftAgentToolIDMap {
		_, ok := bindToolIDMap[toolID]
		if ok {
			continue
		}
		removeToolIDs = append(removeToolIDs, toolID)
	}

	var onlineTools []*entity.ToolInfo
	if len(newSaasBindToolIDs) > 0 {
		saasPluginTools, _, err := t.BatchGetSaasPluginToolsInfo(ctx, saasToolPluginIDs)
		if err != nil {
			return err
		}
		for _, toolIDs := range saasPluginTools {
			for _, toolInfo := range toolIDs {
				if slices.Contains(saasToolIDs, toolInfo.ID) {
					onlineTools = append(onlineTools, toolInfo)
				}
			}
		}
	}

	tx := t.query.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			if e := tx.Rollback(); e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}
			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))
			return
		}
		if err != nil {
			if e := tx.Rollback(); e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}
		}
	}()

	if len(newLocalBindToolIDs) > 0 {
		localTools, err := t.MGetOnlineTools(ctx, newLocalBindToolIDs)
		if err != nil {
			return err
		}
		onlineTools = append(onlineTools, localTools...)
	}

	if len(onlineTools) > 0 {
		err = t.agentToolDraftDAO.BatchCreateIgnoreConflictWithTX(ctx, tx, agentID, onlineTools)
		if err != nil {
			return err
		}
	}

	err = t.agentToolDraftDAO.DeleteWithTX(ctx, tx, agentID, removeToolIDs)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func (t *toolRepoImpl) GetAgentPluginIDs(ctx context.Context, agentID int64) (pluginIDs []int64, err error) {
	return t.agentToolDraftDAO.GetAllPluginIDs(ctx, agentID)
}

func (t *toolRepoImpl) DuplicateDraftAgentTools(ctx context.Context, fromAgentID, toAgentID int64) (err error) {
	tools, err := t.agentToolDraftDAO.GetAll(ctx, fromAgentID, nil)
	if err != nil {
		return err
	}

	if len(tools) == 0 {
		return nil
	}

	tx := t.query.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			if e := tx.Rollback(); e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}
			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))
			return
		}
		if err != nil {
			if e := tx.Rollback(); e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}
		}
	}()

	err = t.agentToolDraftDAO.BatchCreateWithTX(ctx, tx, toAgentID, tools)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (t *toolRepoImpl) GetDraftAgentTool(ctx context.Context, agentID, toolID int64) (tool *entity.ToolInfo, exist bool, err error) {
	return t.agentToolDraftDAO.Get(ctx, agentID, toolID)
}

func (t *toolRepoImpl) GetDraftAgentToolWithToolName(ctx context.Context, agentID int64, toolName string) (tool *entity.ToolInfo, exist bool, err error) {
	return t.agentToolDraftDAO.GetWithToolName(ctx, agentID, toolName)
}

func (t *toolRepoImpl) MGetDraftAgentTools(ctx context.Context, agentID int64, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
	return t.agentToolDraftDAO.MGet(ctx, agentID, toolIDs)
}

func (t *toolRepoImpl) UpdateDraftAgentTool(ctx context.Context, req *UpdateDraftAgentToolRequest) (err error) {
	return t.agentToolDraftDAO.UpdateWithToolName(ctx, req.AgentID, req.ToolName, req.Tool)
}

func (t *toolRepoImpl) GetSpaceAllDraftAgentTools(ctx context.Context, agentID int64) (tools []*entity.ToolInfo, err error) {
	return t.agentToolDraftDAO.GetAll(ctx, agentID, nil)
}

func (t *toolRepoImpl) GetVersionAgentTool(ctx context.Context, agentID int64, vAgentTool model.VersionAgentTool) (tool *entity.ToolInfo, exist bool, err error) {
	return t.agentToolVersionDAO.Get(ctx, agentID, vAgentTool)
}

func (t *toolRepoImpl) GetVersionAgentToolWithToolName(ctx context.Context, req *GetVersionAgentToolWithToolNameRequest) (tool *entity.ToolInfo, exist bool, err error) {
	return t.agentToolVersionDAO.GetWithToolName(ctx, req.AgentID, req.ToolName, req.AgentVersion)
}

func (t *toolRepoImpl) MGetVersionAgentTool(ctx context.Context, agentID int64, vAgentTools []model.VersionAgentTool) (tools []*entity.ToolInfo, err error) {
	return t.agentToolVersionDAO.MGet(ctx, agentID, vAgentTools)
}

func (t *toolRepoImpl) BatchCreateVersionAgentTools(ctx context.Context, agentID int64, agentVersion string, tools []*entity.ToolInfo) (err error) {
	return t.agentToolVersionDAO.BatchCreate(ctx, agentID, agentVersion, tools)
}

// BatchGetSaasPluginToolsInfo retrieves tools information for SaaS plugins
func (t *toolRepoImpl) BatchGetSaasPluginToolsInfo(ctx context.Context, pluginIDs []int64) (tools map[int64][]*entity.ToolInfo, plugins map[int64]*entity.PluginInfo, err error) {
	if len(pluginIDs) == 0 {
		return make(map[int64][]*entity.ToolInfo), make(map[int64]*entity.PluginInfo), nil
	}

	client := saasapi.NewCozeAPIClient()

	var idStrings []string
	for _, id := range pluginIDs {
		idStrings = append(idStrings, strconv.FormatInt(id, 10))
	}
	idsStr := strings.Join(idStrings, ",")

	queryParams := map[string]interface{}{
		"ids": idsStr,
	}

	resp, err := client.GetWithQuery(ctx, "/v1/plugins/mget", queryParams)
	if err != nil {
		return nil, nil, errorx.Wrapf(err, "failed to call coze.cn /v1/plugins/mget API")
	}

	var apiResp dto.SaasPluginToolsListResponse

	if err := json.Unmarshal(resp.Data, &apiResp); err != nil {
		return nil, nil, errorx.Wrapf(err, "failed to parse coze.cn API response")
	}

	result := make(map[int64][]*entity.ToolInfo)
	plugins = make(map[int64]*entity.PluginInfo)

	for _, plugin := range apiResp.Items {

		pluginID, err := strconv.ParseInt(plugin.PluginID, 10, 64)
		if err != nil {
			return nil, nil, errorx.Wrapf(err, "failed to parse plugin ID %s", plugin.PluginID)
		}

		pluginInfo := convertCozePluginToEntity(&plugin)
		plugins[pluginID] = pluginInfo

		toolInfos := make([]*entity.ToolInfo, 0, len(plugin.Tools))

		for _, tool := range plugin.Tools {

			openapi3Operation, err := api.APIParamsToOpenapiOperation(convertFromJsonSchema(tool.InputSchema), convertFromJsonSchema(tool.OutputSchema))
			if err != nil {
				return nil, nil, errorx.Wrapf(err, "failed to convert input schema to openapi operation parameters")
			}
			openapi3Operation.OperationID = tool.Name
			openapi3Operation.Summary = tool.Description
			operation := &model.Openapi3Operation{
				Operation: openapi3Operation,
			}
			id, err := strconv.ParseInt(tool.ToolID, 10, 64)
			if err != nil {
				return nil, nil, errorx.Wrapf(err, "failed to parse tool ID %s", tool.ToolID)
			}
			toolInfo := &entity.ToolInfo{
				ID:        id,
				PluginID:  pluginID,
				Operation: operation,
				Source:    ptr.Of(bot_common.PluginFrom_FromSaas),
				Version:   ptr.Of("0"),
				Method:    ptr.Of("POST"),
				SubURL:    ptr.Of(convertSaasToolSubUrl(pluginID)),
			}

			toolInfos = append(toolInfos, toolInfo)
		}

		result[pluginID] = toolInfos
	}

	return result, plugins, nil
}

func convertCozePluginToEntity(cozePlugin *dto.SaasPluginToolsList) *entity.PluginInfo {
	var pluginID int64
	if id, err := strconv.ParseInt(cozePlugin.PluginID, 10, 64); err == nil {
		pluginID = id
	}

	manifest := &model.PluginManifest{
		SchemaVersion:       "v1",
		NameForModel:        cozePlugin.Name,
		NameForHuman:        cozePlugin.Name,
		DescriptionForModel: cozePlugin.Description,
		DescriptionForHuman: cozePlugin.Description,
		LogoURL:             cozePlugin.IconURL,
		Auth: &model.AuthV2{
			Type: func() consts.AuthzType {
				if !cozePlugin.IsCallAvailable {
					return consts.AuthTypeOfSaasInstalled
				}
				return consts.AuthzTypeOfNone
			}(),
		},
		API: model.APIDesc{
			Type: "openapi",
		},
	}

	pluginInfo := &model.PluginInfo{
		ID:          pluginID,
		PluginType:  pluginCommon.PluginType_PLUGIN,
		SpaceID:     0,
		DeveloperID: 0,
		APPID:       nil,
		IconURL:     &cozePlugin.IconURL,
		ServerURL:   ptr.Of("https://api.coze.cn"),
		CreatedAt:   cozePlugin.CreatedAt,
		UpdatedAt:   cozePlugin.UpdatedAt,
		Manifest:    manifest,
		Source:      ptr.Of(bot_common.PluginFrom_FromSaas),
	}

	return entity.NewPluginInfo(pluginInfo)
}

func convertSaasToolSubUrl(pluginID int64) string {
	return fmt.Sprintf("/v1/plugins/%d/tools/call", pluginID)
}

// convertFromJsonSchema converts JSON schema to API parameters
func convertFromJsonSchema(schema *dto.JsonSchema) []*pluginCommon.APIParameter {
	if schema == nil {
		return []*pluginCommon.APIParameter{}
	}

	return convertJsonSchemaToParameters(schema, pluginCommon.ParameterLocation_Body)
}

// ConvertFromJsonSchemaForTest is an exported version for testing purposes
func ConvertFromJsonSchemaForTest(schema *dto.JsonSchema) []*pluginCommon.APIParameter {
	return convertFromJsonSchema(schema)
}

// convertJsonSchemaToParameters recursively converts JSON schema to API parameters
func convertJsonSchemaToParameters(schema *dto.JsonSchema, location pluginCommon.ParameterLocation) []*pluginCommon.APIParameter {
	if schema == nil {
		return []*pluginCommon.APIParameter{}
	}

	var parameters []*pluginCommon.APIParameter

	// Handle object type with properties
	if schema.Type == dto.JsonSchemaType_OBJECT && len(schema.Properties) > 0 {
		// Create a set of required fields for quick lookup
		requiredFields := make(map[string]bool)
		for _, field := range schema.Required {
			requiredFields[field] = true
		}

		// Convert each property to a parameter
		for name, propSchema := range schema.Properties {
			if propSchema == nil {
				continue
			}

			param := &pluginCommon.APIParameter{
				Name:       name,
				Desc:       propSchema.Description,
				IsRequired: requiredFields[name],
				Type:       mapJsonSchemaTypeToParameterType(propSchema.Type),
				Location:   location,
			}

			// Handle nested object properties
			if propSchema.Type == dto.JsonSchemaType_OBJECT && len(propSchema.Properties) > 0 {
				param.SubParameters = convertJsonSchemaToParameters(propSchema, location)
			}

			// Handle array properties
			if propSchema.Type == dto.JsonSchemaType_ARRAY && propSchema.Items != nil {
				// Create a parameter for the array item
				arrayItemParam := &pluginCommon.APIParameter{
					Name:       "[Array Item]",
					Desc:       propSchema.Items.Description,
					IsRequired: true, // Array items are typically required
					Type:       mapJsonSchemaTypeToParameterType(propSchema.Items.Type),
					Location:   location,
				}

				// If array item is an object, recursively convert its properties
				if propSchema.Items.Type == dto.JsonSchemaType_OBJECT && len(propSchema.Items.Properties) > 0 {
					arrayItemParam.SubParameters = convertJsonSchemaToParameters(propSchema.Items, location)
				}

				// If array item is also an array, handle nested arrays
				if propSchema.Items.Type == dto.JsonSchemaType_ARRAY && propSchema.Items.Items != nil {
					// For nested arrays, create sub-parameters recursively
					nestedArraySchema := &dto.JsonSchema{
						Type:       propSchema.Items.Type,
						Items:      propSchema.Items.Items,
						Properties: propSchema.Items.Properties,
						Required:   propSchema.Items.Required,
					}
					arrayItemParam.SubParameters = convertJsonSchemaToParameters(nestedArraySchema, location)
				}

				param.SubParameters = []*pluginCommon.APIParameter{arrayItemParam}
			}

			parameters = append(parameters, param)
		}
	} else if schema.Type == dto.JsonSchemaType_ARRAY && schema.Items != nil {
		// Handle top-level array (though this is less common for API parameters)
		arrayItemParam := &pluginCommon.APIParameter{
			Name:       "[Array Item]",
			Desc:       schema.Items.Description,
			IsRequired: true,
			Type:       mapJsonSchemaTypeToParameterType(schema.Items.Type),
			Location:   location,
		}

		if schema.Items.Type == dto.JsonSchemaType_OBJECT && len(schema.Items.Properties) > 0 {
			arrayItemParam.SubParameters = convertJsonSchemaToParameters(schema.Items, location)
		}

		parameters = append(parameters, arrayItemParam)
	}

	return parameters
}

// mapJsonSchemaTypeToParameterType maps JSON schema types to parameter types
func mapJsonSchemaTypeToParameterType(schemaType dto.JsonSchemaType) pluginCommon.ParameterType {
	switch schemaType {
	case dto.JsonSchemaType_STRING:
		return pluginCommon.ParameterType_String
	case dto.JsonSchemaType_NUMBER:
		return pluginCommon.ParameterType_Number
	case dto.JsonSchemaType_INTEGER:
		return pluginCommon.ParameterType_Integer
	case dto.JsonSchemaType_BOOLEAN:
		return pluginCommon.ParameterType_Bool
	case dto.JsonSchemaType_OBJECT:
		return pluginCommon.ParameterType_Object
	case dto.JsonSchemaType_ARRAY:
		return pluginCommon.ParameterType_Array
	default:
		return pluginCommon.ParameterType_String
	}
}
