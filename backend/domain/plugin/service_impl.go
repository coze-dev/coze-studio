package plugin

import (
	"context"
	"errors"
	"fmt"
	"runtime/debug"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/go-playground/validator"
	"golang.org/x/mod/semver"
	"gorm.io/gorm"

	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/dao"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/plugin"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type Components struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewPluginService(components *Components) PluginService {
	return &pluginServiceImpl{
		db:                  components.DB,
		PluginDAO:           dao.NewPluginDAO(components.DB, components.IDGen),
		PluginDraftDAO:      dao.NewPluginDraftDAO(components.DB, components.IDGen),
		PluginVersionDAO:    dao.NewPluginVersionDAO(components.DB, components.IDGen),
		ToolDAO:             dao.NewToolDAO(components.DB, components.IDGen),
		ToolDraftDAO:        dao.NewToolDraftDAO(components.DB, components.IDGen),
		ToolVersionDAO:      dao.NewToolVersionDAO(components.DB, components.IDGen),
		AgentToolVersionDAO: dao.NewAgentToolVersionDAO(components.DB, components.IDGen),
		AgentToolDraftDAO:   dao.NewAgentToolDraftDAO(components.DB, components.IDGen),
	}
}

type pluginServiceImpl struct {
	db *gorm.DB
	dao.PluginDAO
	dao.PluginDraftDAO
	dao.PluginVersionDAO
	dao.ToolDAO
	dao.ToolDraftDAO
	dao.ToolVersionDAO
	dao.AgentToolVersionDAO
	dao.AgentToolDraftDAO
}

func (p *pluginServiceImpl) CreatePluginDraft(ctx context.Context, req *CreatePluginDraftRequest) (resp *CreatePluginDraftResponse, err error) {
	pluginID, err := p.PluginDraftDAO.Create(ctx, req.Plugin)
	if err != nil {
		return nil, err
	}

	return &CreatePluginDraftResponse{
		PluginID: pluginID,
	}, nil
}

func (p *pluginServiceImpl) MGetDraftPlugins(ctx context.Context, req *MGetDraftPluginsRequest) (resp *MGetDraftPluginsResponse, err error) {
	plugins, err := p.PluginDraftDAO.MGet(ctx, req.PluginIDs)
	if err != nil {
		return nil, err
	}

	return &MGetDraftPluginsResponse{
		Plugins: plugins,
	}, nil
}

func (p *pluginServiceImpl) ListDraftPlugins(ctx context.Context, req *ListDraftPluginsRequest) (resp *ListDraftPluginsResponse, err error) {
	plugins, total, err := p.PluginDraftDAO.List(ctx, req.SpaceID, req.PageInfo)
	if err != nil {
		return nil, err
	}

	return &ListDraftPluginsResponse{
		Plugins: plugins,
		Total:   total,
	}, nil
}

func (p *pluginServiceImpl) UpdatePluginDraftWithDoc(ctx context.Context, req *UpdatePluginDraftWithCodeRequest) (err error) {
	doc := req.OpenapiDoc
	manifest := req.Manifest

	err = checkPluginCodeDesc(ctx, doc, manifest)
	if err != nil {
		return err
	}

	apiSchemas := make(map[entity.UniqueToolAPI]*openapi3.Operation, len(doc.Paths))
	apis := make([]entity.UniqueToolAPI, 0, len(doc.Paths))

	for subURL, pathItem := range doc.Paths {
		for method, operation := range pathItem.Operations() {
			api := entity.UniqueToolAPI{
				SubURL: subURL,
				Method: method,
			}

			apiSchemas[api] = operation
			apis = append(apis, api)
		}
	}

	oldTools, err := p.ToolDraftDAO.MGetWithAPIs(ctx, req.PluginID, apis)
	if err != nil {
		return err
	}

	pl, exist, err := p.PluginDraftDAO.Get(ctx, req.PluginID)
	if err != nil {
		return err
	}
	if !exist {
		return fmt.Errorf("plugin draft '%d' not found", req.PluginID)
	}

	if pl.GetServerURL() != doc.Servers[0].URL {
		for _, oldTool := range oldTools {
			oldTool.DebugStatus = ptr.Of(common.APIDebugStatus_DebugWaiting)
		}
	}

	// 1. 删除 tool -> 关闭启用
	for api, oldTool := range oldTools {
		_, ok := apiSchemas[api]
		if !ok {
			oldTool.DebugStatus = ptr.Of(common.APIDebugStatus_DebugWaiting)
			oldTool.ActivatedStatus = ptr.Of(consts.DeactivateTool)
		}
	}

	newTools := make([]*entity.ToolInfo, 0, len(apis))
	for api, newOp := range apiSchemas {
		oldTool, ok := oldTools[api]
		if ok { // 2. 更新 tool -> 覆盖
			oldTool.Name = ptr.Of(newOp.OperationID)
			oldTool.Desc = ptr.Of(newOp.Description)
			oldTool.ActivatedStatus = ptr.Of(consts.ActivateTool)
			oldTool.Operation = newOp
			if needResetDebugStatusTool(ctx, newOp, oldTool.Operation) {
				oldTool.DebugStatus = ptr.Of(common.APIDebugStatus_DebugWaiting)
			}
			continue
		}

		// 3. 新增 tool
		newTools = append(newTools, &entity.ToolInfo{
			PluginID:        req.PluginID,
			Name:            ptr.Of(newOp.OperationID),
			Desc:            ptr.Of(newOp.Description),
			ActivatedStatus: ptr.Of(consts.ActivateTool),
			DebugStatus:     ptr.Of(common.APIDebugStatus_DebugWaiting),
			SubURL:          ptr.Of(api.SubURL),
			Method:          ptr.Of(api.Method),
			Operation:       newOp,
		})
	}

	// TODO(@maronghong): 细化更新判断，减少更新的 tool，提升性能
	updatedTools := make([]*entity.ToolInfo, 0, len(oldTools))
	for _, tool := range oldTools {
		updatedTools = append(updatedTools, tool)
	}

	tx := query.Use(p.db).Begin()
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

	// plugin 表只存储 root 信息，更新后需要还原
	paths := doc.Paths
	doc.Paths = nil

	updatedPlugin := &entity.PluginInfo{
		ID:         req.PluginID,
		Name:       pl.Name,
		Desc:       pl.Desc,
		ServerURL:  ptr.Of(doc.Servers[0].URL),
		Manifest:   manifest,
		OpenapiDoc: doc,
	}
	err = p.PluginDraftDAO.UpdateWithTX(ctx, tx, updatedPlugin)
	if err != nil {
		return err
	}

	for _, tool := range updatedTools {
		err = p.ToolDraftDAO.UpdateWithTX(ctx, tx, tool)
		if err != nil {
			return err
		}
	}

	_, err = p.ToolDraftDAO.BatchCreateWithTX(ctx, tx, newTools)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	// plugin 表只存储 root 信息，需要还原
	doc.Paths = paths

	return nil
}

func checkPluginCodeDesc(_ context.Context, doc *openapi3.T, manifest *entity.PluginManifest) (err error) {
	// TODO(@maronghong): 暂时先限制，和 UI 上只能展示一个 server url 的逻辑保持一致
	if len(doc.Servers) != 1 {
		return fmt.Errorf("server is required and only one server is allowed, input=%v", doc.Servers)
	}

	validate := validator.New()

	err = validate.Struct(manifest)
	if err != nil {
		return fmt.Errorf("plugin manifest validates failed, err=%v", err)
	}

	err = validate.Struct(doc)
	if err != nil {
		return fmt.Errorf("plugin openapi doc validates failed, err=%v", err)
	}

	// TODO(@maronghong): 加强检查，比如 request body 只能是 object 类型

	return nil
}

func needResetDebugStatusTool(_ context.Context, nt, ot *openapi3.Operation) bool {
	if len(ot.Parameters) != len(ot.Parameters) {
		return true
	}

	otParams := make(map[string]*openapi3.Parameter, len(ot.Parameters))
	cnt := make(map[string]int, len(nt.Parameters))

	for _, p := range nt.Parameters {
		cnt[p.Value.Name]++
	}
	for _, p := range ot.Parameters {
		cnt[p.Value.Name]--
		otParams[p.Value.Name] = p.Value
	}
	for _, v := range cnt {
		if v != 0 {
			return true
		}
	}

	for _, p := range nt.Parameters {
		np, op := p.Value, otParams[p.Value.Name]
		if np.In != op.In {
			return true
		}
		if np.Required != op.Required {
			return true
		}

		if !isJsonSchemaEqual(op.Schema.Value, np.Schema.Value) {
			return true
		}
	}

	nReqBody, oReqBody := nt.RequestBody.Value, ot.RequestBody.Value
	if len(nReqBody.Content) != len(oReqBody.Content) {
		return true
	}
	cnt = make(map[string]int, len(nReqBody.Content))
	for ct := range nReqBody.Content {
		cnt[ct]++
	}
	for ct := range oReqBody.Content {
		cnt[ct]--
	}
	for _, v := range cnt {
		if v != 0 {
			return true
		}
	}

	for ct, nct := range nReqBody.Content {
		oct := oReqBody.Content[ct]
		if !isJsonSchemaEqual(nct.Schema.Value, oct.Schema.Value) {
			return true
		}
	}

	return false
}

func isJsonSchemaEqual(nsc, osc *openapi3.Schema) bool {
	if nsc.Type != osc.Type {
		return false
	}
	if nsc.Format != osc.Format {
		return false
	}
	if nsc.Default != osc.Default {
		return false
	}
	if nsc.Extensions[consts.APISchemaExtendAssistType] != osc.Extensions[consts.APISchemaExtendAssistType] {
		return false
	}
	if nsc.Extensions[consts.APISchemaExtendGlobalDisable] != osc.Extensions[consts.APISchemaExtendGlobalDisable] {
		return false
	}

	switch nsc.Type {
	case openapi3.TypeObject:
		if len(nsc.Required) != len(osc.Required) {
			return false
		}
		if len(nsc.Required) > 0 {
			cnt := make(map[string]int, len(nsc.Required))
			for _, x := range nsc.Required {
				cnt[x]++
			}
			for _, x := range osc.Required {
				cnt[x]--
			}
			for _, v := range cnt {
				if v != 0 {
					return true
				}
			}
		}

		if len(nsc.Properties) != len(osc.Properties) {
			return false
		}
		if len(nsc.Properties) > 0 {
			for paramName, np := range nsc.Properties {
				op, ok := osc.Properties[paramName]
				if !ok {
					return false
				}
				if !isJsonSchemaEqual(np.Value, op.Value) {
					return false
				}
			}
		}
	case openapi3.TypeArray:
		if !isJsonSchemaEqual(nsc.Items.Value, osc.Items.Value) {
			return false
		}
	}

	return true
}

func (p *pluginServiceImpl) UpdatePluginDraft(ctx context.Context, req *UpdatePluginDraftRequest) (err error) {
	newPlugin := req.Plugin

	if newPlugin.GetServerURL() == "" {
		return p.PluginDraftDAO.Update(ctx, newPlugin)
	}

	oldPlugin, exist, err := p.PluginDraftDAO.Get(ctx, newPlugin.ID)
	if err != nil {
		return err
	}
	if !exist {
		return fmt.Errorf("plugin draft '%d' not found", newPlugin.ID)
	}

	if oldPlugin.GetServerURL() == newPlugin.GetServerURL() {
		return p.PluginDraftDAO.Update(ctx, newPlugin)
	}

	tx := query.Use(p.db).Begin()
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

	err = p.PluginDraftDAO.UpdateWithTX(ctx, tx, newPlugin)
	if err != nil {
		return err
	}

	err = p.ToolDraftDAO.ResetAllDebugStatusWithTX(ctx, tx, newPlugin.ID)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func (p *pluginServiceImpl) DeletePluginDraft(ctx context.Context, req *DeletePluginDraftRequest) (err error) {
	tx := query.Use(p.db).Begin()
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

	err = p.PluginDraftDAO.DeleteWithTX(ctx, tx, req.PluginID)
	if err != nil {
		return err
	}

	err = p.PluginDAO.DeleteWithTX(ctx, tx, req.PluginID)
	if err != nil {
		return err
	}

	err = p.ToolDraftDAO.DeleteAllWithTX(ctx, tx, req.PluginID)
	if err != nil {
		return err
	}

	err = p.ToolDAO.DeleteAllWithTX(ctx, tx, req.PluginID)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func (p *pluginServiceImpl) GetPlugin(ctx context.Context, req *GetPluginRequest) (resp *GetPluginResponse, err error) {
	pl, exist, err := p.PluginDAO.Get(ctx, req.PluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("plugin '%d' not found", req.PluginID)
	}

	return &GetPluginResponse{
		Plugin: pl,
	}, nil
}

func (p *pluginServiceImpl) MGetPlugins(ctx context.Context, req *MGetPluginsRequest) (resp *MGetPluginsResponse, err error) {
	plugins, err := p.PluginDAO.MGet(ctx, req.PluginIDs)
	if err != nil {
		return nil, err
	}

	return &MGetPluginsResponse{
		Plugins: plugins,
	}, nil
}

func (p *pluginServiceImpl) ListPlugins(ctx context.Context, req *ListPluginsRequest) (resp *ListPluginsResponse, err error) {
	plugins, total, err := p.PluginDAO.List(ctx, req.SpaceID, req.PageInfo)
	if err != nil {
		return nil, err
	}

	return &ListPluginsResponse{
		Plugins: plugins,
		Total:   total,
	}, nil
}

func (p *pluginServiceImpl) PublishPlugin(ctx context.Context, req *PublishPluginRequest) (err error) {
	tools, err := p.ToolDraftDAO.GetAll(ctx, req.PluginID)
	if err != nil {
		return err
	}

	for _, tool := range tools {
		if tool.DebugStatus == nil ||
			*tool.DebugStatus == common.APIDebugStatus_DebugWaiting {
			return fmt.Errorf("tool '%d' does not pass debugging", tool.ID)
		}
	}

	if len(tools) == 0 {
		return fmt.Errorf("at least one tool is required")
	}

	pluginDraft, exist, err := p.PluginDraftDAO.Get(ctx, req.PluginID)
	if err != nil {
		return err
	}
	if !exist {
		return fmt.Errorf("plugin draft '%d' not found", req.PluginID)
	}

	pluginOnline, exist, err := p.PluginDAO.Get(ctx, req.PluginID)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	} else if exist && pluginOnline.Version != nil {
		if semver.Compare(*pluginDraft.Version, *pluginOnline.Version) != 1 {
			return fmt.Errorf("invalid version")
		}
	}

	tx := query.Use(p.db).Begin()
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

	err = p.PluginDAO.UpsertWithTX(ctx, tx, pluginDraft)
	if err != nil {
		return err
	}

	err = p.PluginVersionDAO.CreateWithTX(ctx, tx, pluginDraft)
	if err != nil {
		return err
	}

	err = p.ToolDAO.DeleteAllWithTX(ctx, tx, req.PluginID)
	if err != nil {
		return err
	}

	err = p.ToolDAO.BatchCreateWithTX(ctx, tx, tools)
	if err != nil {
		return err
	}

	err = p.ToolVersionDAO.BatchCreateWithTX(ctx, tx, tools)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func (p *pluginServiceImpl) CreateToolDraft(ctx context.Context, req *CreateToolDraftRequest) (resp *CreateToolDraftResponse, err error) {
	toolID, err := p.ToolDraftDAO.Create(ctx, req.Tool)
	if err != nil {
		return nil, err
	}

	return &CreateToolDraftResponse{
		ToolID: toolID,
	}, nil
}

func (p *pluginServiceImpl) UpdateToolDraft(ctx context.Context, req *UpdateToolDraftRequest) (err error) {
	tl := req.Tool
	api := entity.UniqueToolAPI{
		SubURL: tl.GetSubURL(),
		Method: tl.GetMethod(),
	}
	tool, exist, err := p.ToolDraftDAO.GetWithAPI(ctx, tl.PluginID, api)
	if err != nil {
		return err
	}

	if exist && tool.ID != tl.ID {
		return fmt.Errorf("api '[%s]:%s' already exists", api.SubURL, api.Method)
	}

	tl.DebugStatus = ptr.Of(common.APIDebugStatus_DebugWaiting)

	return p.ToolDraftDAO.Update(ctx, tl)
}

func (p *pluginServiceImpl) ListDraftTools(ctx context.Context, req *ListDraftToolsRequest) (resp *ListDraftToolsResponse, err error) {
	pageInfo := entity.PageInfo{
		Page:       req.PageInfo.Page,
		Size:       req.PageInfo.Size,
		SortBy:     entity.SortByUpdatedAt,
		OrderByACS: false,
	}
	tools, total, err := p.ToolDraftDAO.List(ctx, req.PluginID, pageInfo)
	if err != nil {
		return nil, err
	}

	return &ListDraftToolsResponse{
		Tools: tools,
		Total: total,
	}, nil
}

func (p *pluginServiceImpl) MGetTools(ctx context.Context, req *MGetToolsRequest) (resp *MGetToolsResponse, err error) {
	tools, err := p.ToolDAO.MGet(ctx, req.VersionTools)
	if err != nil {
		return nil, err
	}

	return &MGetToolsResponse{
		Tools: tools,
	}, nil
}

func (p *pluginServiceImpl) GetAllTools(ctx context.Context, req *GetAllToolsRequest) (resp *GetAllToolsResponse, err error) {
	var tools []*entity.ToolInfo
	if req.Draft {
		tools, err = p.ToolDraftDAO.GetAll(ctx, req.PluginID)
		if err != nil {
			return nil, err
		}
	} else {
		tools, err = p.ToolDAO.GetAll(ctx, req.PluginID)
		if err != nil {
			return nil, err
		}
	}

	return &GetAllToolsResponse{
		Tools: tools,
	}, nil
}

func (p *pluginServiceImpl) ListTools(ctx context.Context, req *ListToolsRequest) (resp *ListToolsResponse, err error) {
	tools, total, err := p.ToolDAO.List(ctx, req.PluginID, req.PageInfo)
	if err != nil {
		return nil, err
	}

	return &ListToolsResponse{
		Tools: tools,
		Total: total,
	}, nil
}

func (p *pluginServiceImpl) BindAgentTool(ctx context.Context, req *BindAgentToolRequest) (err error) {
	versionTool := entity.VersionTool{
		ToolID: req.ToolID,
	}
	tool, err := p.ToolDAO.Get(ctx, versionTool)
	if err != nil {
		return err
	}

	err = p.AgentToolDraftDAO.Create(ctx, req.AgentToolIdentity, tool)
	if err != nil {
		return err
	}

	return nil
}

func (p *pluginServiceImpl) GetAgentTool(ctx context.Context, req *GetAgentToolRequest) (resp *GetAgentToolResponse, err error) {
	versionTool := entity.VersionTool{
		ToolID: req.ToolID,
	}
	tool, err := p.ToolDAO.Get(ctx, versionTool)
	if err != nil {
		return nil, err
	}

	if !req.IsDraft {
		vAgentTool := entity.VersionAgentTool{
			ToolID:    req.ToolID,
			VersionMs: req.VersionMs,
		}
		agentTool, exist, err := p.AgentToolVersionDAO.Get(ctx, req.AgentID, vAgentTool)
		if err != nil {
			return nil, err
		}
		if !exist {
			return nil, fmt.Errorf("agent tool '%d' not found", req.ToolID)
		}

		return &GetAgentToolResponse{
			Tool: agentTool,
		}, nil
	}

	agentTool, exist, err := p.AgentToolDraftDAO.Get(ctx, req.AgentToolIdentity)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("agent tool '%d' not found", req.ToolID)
	}

	op, err := syncToAgentTool(ctx, tool.Operation, agentTool.Operation)
	if err != nil {
		return nil, err
	}

	agentTool.Operation = op

	return &GetAgentToolResponse{
		Tool: agentTool,
	}, nil
}

func syncToAgentTool(ctx context.Context, dest, src *openapi3.Operation) (*openapi3.Operation, error) {
	newParameters, err := syncParameters(ctx, dest.Parameters, src.Parameters)
	if err != nil {
		return nil, err
	}

	dest.Parameters = newParameters

	newReqBody, err := syncRequestBody(ctx, dest.RequestBody.Value, src.RequestBody.Value)
	if err != nil {
		return nil, err
	}

	dest.RequestBody.Value = newReqBody

	newRespBody, err := syncResponseBody(ctx, dest.Responses, src.Responses)
	if err != nil {
		return nil, err
	}

	dest.Responses = newRespBody

	return dest, nil
}

func syncParameters(ctx context.Context, dest, src openapi3.Parameters) (openapi3.Parameters, error) {
	srcMap := make(map[string]*openapi3.ParameterRef, len(src))
	for _, p := range src {
		srcMap[p.Value.Name] = p
	}

	for _, dp := range dest {
		sp, ok := srcMap[dp.Value.Name]
		if !ok {
			continue
		}

		dv := dp.Value.Schema.Value
		sv := sp.Value.Schema.Value

		if dv.Extensions == nil {
			dv.Extensions = make(map[string]any)
		}

		if v, ok := sv.Extensions[consts.APISchemaExtendLocalDisable]; ok {
			dv.Extensions[consts.APISchemaExtendLocalDisable] = v
		}

		if v, ok := sv.Extensions[consts.APISchemaExtendVariableRef]; ok {
			dv.Extensions[consts.APISchemaExtendVariableRef] = v
		}

		dv.Default = sv.Default
	}

	return dest, nil
}

func syncRequestBody(ctx context.Context, dest, src *openapi3.RequestBody) (*openapi3.RequestBody, error) {
	for ct, dm := range dest.Content {
		sm, ok := src.Content[ct]
		if !ok {
			continue
		}

		nv, err := syncMediaSchema(ctx, dm.Schema.Value, sm.Schema.Value)
		if err != nil {
			return nil, err
		}

		dm.Schema.Value = nv
	}

	return dest, nil
}

func syncMediaSchema(ctx context.Context, dest, src *openapi3.Schema) (*openapi3.Schema, error) {
	if dest.Extensions == nil {
		dest.Extensions = map[string]any{}
	}
	if v, ok := src.Extensions[consts.APISchemaExtendLocalDisable]; ok {
		dest.Extensions[consts.APISchemaExtendLocalDisable] = v
	}
	if v, ok := src.Extensions[consts.APISchemaExtendVariableRef]; ok {
		dest.Extensions[consts.APISchemaExtendVariableRef] = v
	}

	dest.Default = src.Default

	switch dest.Type {
	case openapi3.TypeObject:
		for k, dv := range dest.Properties {
			sv, ok := src.Properties[k]
			if !ok {
				continue
			}

			nv, err := syncMediaSchema(ctx, dv.Value, sv.Value)
			if err != nil {
				return nil, err
			}

			dv.Value = nv
		}

		return dest, nil
	case openapi3.TypeArray:
		nv, err := syncMediaSchema(ctx, dest.Items.Value, src.Items.Value)
		if err != nil {
			return nil, err
		}

		dest.Items.Value = nv

		return dest, nil
	default:
		return dest, nil
	}
}

func syncResponseBody(ctx context.Context, dest, src openapi3.Responses) (openapi3.Responses, error) {
	for code, dr := range dest {
		sr, ok := src[code]
		if !ok {
			continue
		}

		for ct, dm := range dr.Value.Content {
			sm, ok := sr.Value.Content[ct]
			if !ok {
				continue
			}

			nv, err := syncMediaSchema(ctx, dm.Schema.Value, sm.Schema.Value)
			if err != nil {
				return nil, err
			}

			dm.Schema.Value = nv
		}
	}

	return dest, nil
}

func (p *pluginServiceImpl) MGetAgentTools(ctx context.Context, req *MGetAgentToolsRequest) (resp *MGetAgentToolsResponse, err error) {
	if req.IsDraft {
		toolIDs := make([]int64, 0, len(req.VersionAgentTools))
		for _, v := range req.VersionAgentTools {
			toolIDs = append(toolIDs, v.ToolID)
		}
		tools, err := p.AgentToolDraftDAO.MGet(ctx, req.AgentID, req.UserID, toolIDs)
		if err != nil {
			return nil, err
		}

		return &MGetAgentToolsResponse{
			Tools: tools,
		}, nil
	}

	tools, err := p.AgentToolVersionDAO.MGet(ctx, req.AgentID, req.VersionAgentTools)
	if err != nil {
		return nil, err
	}

	return &MGetAgentToolsResponse{
		Tools: tools,
	}, nil
}

func (p *pluginServiceImpl) PublishAgentTools(ctx context.Context, req *PublishAgentToolsRequest) (resp *PublishAgentToolsResponse, err error) {
	tools, err := p.AgentToolDraftDAO.GetAll(ctx, req.AgentID, req.UserID)
	if err != nil {
		return nil, err
	}

	tx := query.Use(p.db).Begin()
	if tx.Error != nil {
		return nil, tx.Error
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

	toolVersions, err := p.AgentToolVersionDAO.BatchCreateWithTX(ctx, tx, req.AgentID, tools)
	if err != nil {
		return nil, err
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	return &PublishAgentToolsResponse{
		ToolVersions: toolVersions,
	}, nil
}

func (p *pluginServiceImpl) UpdateAgentToolDraft(ctx context.Context, req *UpdateAgentToolDraftRequest) (err error) {
	return p.AgentToolDraftDAO.Update(ctx, req.AgentToolIdentity, req.Tool)
}

func (p *pluginServiceImpl) UnbindAgentTool(ctx context.Context, req *UnbindAgentToolRequest) (err error) {
	return p.AgentToolDraftDAO.Delete(ctx, req.AgentToolIdentity)
}

func (p *pluginServiceImpl) ExecuteTool(ctx context.Context, req *ExecuteToolRequest, opts ...entity.ExecuteToolOpts) (resp *ExecuteToolResponse, err error) {
	execOpts := &entity.ExecuteOptions{}
	for _, opt := range opts {
		opt(execOpts)
	}

	var (
		tl    *entity.ToolInfo
		pl    *entity.PluginInfo
		exist bool
	)
	switch req.ExecScene {
	case consts.ExecSceneOfToolDebug:
		tl, exist, err = p.ToolDraftDAO.Get(ctx, req.ToolID)
		if err != nil {
			return nil, err
		}
		if !exist {
			return nil, fmt.Errorf("tool '%d' not found", req.ToolID)
		}

		pl, exist, err = p.PluginDraftDAO.Get(ctx, req.PluginID)
		if err != nil {
			return nil, err
		}
		if !exist {
			return nil, fmt.Errorf("plugin '%d' not found", req.PluginID)
		}

	case consts.ExecSceneOfAgentOnline:
		if execOpts.Version == "" {
			return nil, fmt.Errorf("invalid version")
		}

		pl, exist, err = p.PluginVersionDAO.Get(ctx, req.PluginID, execOpts.Version)
		if err != nil {
			return nil, err
		}
		if !exist {
			return nil, fmt.Errorf("plugin '%d' with version '%s' not found", req.PluginID, execOpts.Version)
		}

		if execOpts.AgentID == 0 {
			return nil, fmt.Errorf("invalid agentID")
		}
		if execOpts.AgentToolVersion == 0 {
			return nil, fmt.Errorf("invalid agentToolVersion")
		}

		tl, exist, err = p.AgentToolVersionDAO.Get(ctx, execOpts.AgentID, entity.VersionAgentTool{
			ToolID:    req.ToolID,
			VersionMs: ptr.Of(execOpts.AgentToolVersion),
		})
		if err != nil {
			return nil, err
		}
		if !exist {
			return nil, fmt.Errorf("agent tool '%d' not found", req.ToolID)
		}

	case consts.ExecSceneOfAgentDraft:
		if execOpts.Version == "" {
			return nil, fmt.Errorf("invalid tool version")
		}

		pl, exist, err = p.PluginVersionDAO.Get(ctx, req.PluginID, execOpts.Version)
		if err != nil {
			return nil, err
		}
		if !exist {
			return nil, fmt.Errorf("plugin '%d' with version '%s' not found", req.PluginID, execOpts.Version)
		}

		if execOpts.AgentID == 0 {
			return nil, fmt.Errorf("invalid agentID")
		}
		if execOpts.UserID == 0 {
			return nil, fmt.Errorf("invalid userID")
		}

		tl, exist, err = p.AgentToolDraftDAO.Get(ctx, entity.AgentToolIdentity{
			AgentID: execOpts.AgentID,
			SpaceID: execOpts.UserID,
			ToolID:  req.ToolID,
		})
		if err != nil {
			return nil, err
		}
		if !exist {
			return nil, fmt.Errorf("agent tool '%d' not found", req.ToolID)
		}

	case consts.ExecSceneOfWorkflow:
		if execOpts.Version == "" {
			return nil, fmt.Errorf("invalid version")
		}

		pl, exist, err = p.PluginVersionDAO.Get(ctx, req.PluginID, execOpts.Version)
		if err != nil {
			return nil, err
		}
		if !exist {
			return nil, fmt.Errorf("plugin '%d' with version '%s' not found", req.PluginID, execOpts.Version)
		}

		tl, err = p.ToolVersionDAO.Get(ctx, entity.VersionTool{
			ToolID:  req.ToolID,
			Version: ptr.Of(execOpts.Version),
		})
		if err != nil {
			return nil, err
		}

	default:
		return nil, fmt.Errorf("invalid exec scene")
	}

	config := &plugin.ExecutorConfig{
		Plugin: pl,
		Tool:   tl,
	}
	executor := plugin.NewExecutor(ctx, config)

	result, err := executor.Execute(ctx, req.ArgumentsInJson)
	if err != nil {
		return nil, err
	}

	return &ExecuteToolResponse{
		Result: result.Result,
	}, nil
}
