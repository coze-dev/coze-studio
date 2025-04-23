package plugin

import (
	"context"
	"errors"
	"fmt"
	"runtime/debug"

	"github.com/go-playground/validator"
	"golang.org/x/mod/semver"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/plugin/plugin_common"
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

func (p *pluginServiceImpl) UpdatePluginDraft(ctx context.Context, req *UpdatePluginDraftRequest) (err error) {
	newPlugin := req.Plugin

	if newPlugin.OpenapiDoc != nil {
		return p.updateDraftPluginWithCode(ctx, req.Plugin)
	}

	if newPlugin.GetServerURL() == "" {
		return p.PluginDraftDAO.Update(ctx, newPlugin)
	}

	oldPlugin, err := p.PluginDraftDAO.Get(ctx, newPlugin.ID)
	if err != nil {
		return err
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
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))

			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
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

func (p *pluginServiceImpl) updateDraftPluginWithCode(ctx context.Context, newPlugin *entity.PluginInfo) (err error) {
	oldPlugin, err := p.PluginDraftDAO.Get(ctx, newPlugin.ID)
	if err != nil {
		return err
	}

	// TODO(maronghong): 需要限制工具数量？

	err = checkPluginCodeDesc(ctx, newPlugin)
	if err != nil {
		return err
	}

	resetAllDebugStatus := false
	if oldPlugin.GetServerURL() != newPlugin.GetServerURL() {
		resetAllDebugStatus = true
		// 以 OpenAPI 为准，直接覆盖
		newPlugin.ServerURL = &newPlugin.OpenapiDoc.Servers[0].URL
	}

	oldTools, err := p.ToolDraftDAO.GetAll(ctx, newPlugin.ID)
	if err != nil {
		return err
	}

	newTools, updatedTools, err := plugin.NewPluginSyncer(ctx, newPlugin).ApplyPluginOpenapi3DocToTools(ctx, oldTools)
	if err != nil {
		return err
	}

	tx := query.Use(p.db).Begin()
	if tx.Error != nil {
		return tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))

			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}
		}
	}()

	_, err = p.ToolDraftDAO.BatchCreateWithTX(ctx, tx, newTools)
	if err != nil {
		return err
	}

	for _, ut := range updatedTools {
		err = p.ToolDraftDAO.UpdateWithTX(ctx, tx, ut)
		if err != nil {
			return err
		}
	}

	err = p.PluginDraftDAO.UpdateWithTX(ctx, tx, newPlugin)
	if err != nil {
		return err
	}

	if resetAllDebugStatus {
		err = p.ToolDraftDAO.ResetAllDebugStatusWithTX(ctx, tx, newPlugin.ID)
		if err != nil {
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func checkPluginCodeDesc(_ context.Context, newPlugin *entity.PluginInfo) (err error) {
	if newPlugin.OpenapiDoc == nil {
		return fmt.Errorf("openapi doc is nil")
	}

	if len(newPlugin.OpenapiDoc.Servers) != 1 {
		return fmt.Errorf("server is required and only one server is allowed, input=%v", newPlugin.OpenapiDoc.Servers)
	}

	if newPlugin.PluginManifest == nil {
		return fmt.Errorf("plugin manifest is nil")
	}

	validate := validator.New()

	err = validate.Struct(newPlugin.PluginManifest)
	if err != nil {
		return fmt.Errorf("plugin manifest validates failed, err=%v", err)
	}

	err = validate.Struct(newPlugin.OpenapiDoc)
	if err != nil {
		return fmt.Errorf("plugin openapi doc validates failed, err=%v", err)
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
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))

			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
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
	pl, err := p.PluginDAO.Get(ctx, req.PluginID)
	if err != nil {
		return nil, err
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
			*tool.DebugStatus == plugin_common.APIDebugStatus_DebugWaiting {
			return fmt.Errorf("tool '%d' does not pass debugging", tool.ID)
		}
	}

	if len(tools) == 0 {
		return fmt.Errorf("at least one tool is required")
	}

	pluginDraft, err := p.PluginDraftDAO.Get(ctx, req.PluginID)
	if err != nil {
		return err
	}

	pluginOnline, err := p.PluginDAO.Get(ctx, req.PluginID)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	} else if pluginOnline.Version != nil {
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
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))

			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
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
	pl, err := p.PluginDraftDAO.Get(ctx, req.Tool.PluginID)
	if err != nil {
		return err
	}

	tool, err := p.ToolDraftDAO.Get(ctx, req.Tool.ID)
	if err != nil {
		return err
	}

	pl, err = plugin.NewPluginSyncer(ctx, pl).SyncToolToPluginOpenapiDoc(ctx, tool, req.Tool)
	if err != nil {
		return err
	}

	tx := query.Use(p.db).Begin()
	if tx.Error != nil {
		return tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))

			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}
		}
	}()

	err = p.ToolDraftDAO.UpdateWithTX(ctx, tx, req.Tool)
	if err != nil {
		return err
	}

	updatedPlugin := &entity.PluginInfo{
		PluginManifest: pl.PluginManifest,
		OpenapiDoc:     pl.OpenapiDoc,
	}
	err = p.PluginDraftDAO.UpdateWithTX(ctx, tx, updatedPlugin)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
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
		agentTool, err := p.AgentToolVersionDAO.Get(ctx, req.AgentID, vAgentTool)
		if err != nil {
			return nil, err
		}

		return &GetAgentToolResponse{
			Tool: agentTool,
		}, nil
	}

	agentTool, err := p.AgentToolDraftDAO.Get(ctx, req.AgentToolIdentity)
	if err != nil {
		return nil, err
	}

	agentTool.ReqParameters = syncAgentToolParams(ctx, tool.ReqParameters, agentTool.ReqParameters)
	agentTool.RespParameters = syncAgentToolParams(ctx, tool.RespParameters, agentTool.RespParameters)

	return &GetAgentToolResponse{
		Tool: agentTool,
	}, nil
}

func syncAgentToolParams(ctx context.Context, dest, src []*plugin_common.APIParameter) []*plugin_common.APIParameter {
	srcMap := make(map[string]*plugin_common.APIParameter, len(dest))
	for _, p := range src {
		srcMap[p.Name] = p
	}

	for _, destParam := range dest {
		if destParam == nil {
			continue
		}

		srcParam, ok := srcMap[destParam.Name]
		if !ok || srcParam == nil {
			continue
		}

		if destParam.Location != srcParam.Location {
			continue
		}

		if destParam.Type != srcParam.Type {
			continue
		}

		if destParam.IsRequired != srcParam.IsRequired {
			continue
		}

		if destParam.Type == plugin_common.ParameterType_Object {
			syncAgentToolParams(ctx, destParam.SubParameters, srcParam.SubParameters)
			continue
		}

		if destParam.Type == plugin_common.ParameterType_Array {
			if len(destParam.SubParameters) != 1 || len(srcParam.SubParameters) != 1 {
				continue
			}

			syncAgentToolParams(ctx, destParam.SubParameters[:1], srcParam.SubParameters[:1])
		}

		destParam.LocalDefault, destParam.LocalDisable = srcParam.LocalDefault, srcParam.LocalDisable
	}

	return dest
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
			e := tx.Rollback()
			if e != nil {
				logs.CtxErrorf(ctx, "rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))

			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
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
		tl *entity.ToolInfo
		pl *entity.PluginInfo
	)
	switch req.ExecScene {
	case consts.ExecSceneOfToolDebug:
		tl, err = p.ToolDraftDAO.Get(ctx, req.ToolID)
		if err != nil {
			return nil, err
		}

		pl, err = p.PluginDraftDAO.Get(ctx, req.PluginID)
		if err != nil {
			return nil, err
		}

	case consts.ExecSceneOfAgentOnline:
		if execOpts.Version == "" {
			return nil, fmt.Errorf("invalid version")
		}

		pl, err = p.PluginVersionDAO.Get(ctx, req.PluginID, execOpts.Version)
		if err != nil {
			return nil, err
		}

		if execOpts.AgentID == 0 {
			return nil, fmt.Errorf("invalid agentID")
		}

		if execOpts.AgentToolVersion == 0 {
			return nil, fmt.Errorf("invalid agentToolVersion")
		}

		tl, err = p.AgentToolVersionDAO.Get(ctx, execOpts.AgentID, entity.VersionAgentTool{
			ToolID:    req.ToolID,
			VersionMs: ptr.Of(execOpts.AgentToolVersion),
		})
		if err != nil {
			return nil, err
		}

	case consts.ExecSceneOfAgentDraft:
		if execOpts.Version == "" {
			return nil, fmt.Errorf("invalid tool version")
		}

		pl, err = p.PluginVersionDAO.Get(ctx, req.PluginID, execOpts.Version)
		if err != nil {
			return nil, err
		}

		if execOpts.AgentID == 0 {
			return nil, fmt.Errorf("invalid agentID")
		}

		if execOpts.UserID == 0 {
			return nil, fmt.Errorf("invalid userID")
		}

		tl, err = p.AgentToolDraftDAO.Get(ctx, entity.AgentToolIdentity{
			AgentID: execOpts.AgentID,
			UserID:  execOpts.UserID,
			ToolID:  req.ToolID,
		})
		if err != nil {
			return nil, err
		}

	case consts.ExecSceneOfWorkflow:
		if execOpts.Version == "" {
			return nil, fmt.Errorf("invalid version")
		}

		pl, err = p.PluginVersionDAO.Get(ctx, req.PluginID, execOpts.Version)
		if err != nil {
			return nil, err
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
