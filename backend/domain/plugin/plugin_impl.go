package plugin

import (
	"context"
	"errors"
	"fmt"
	"runtime/debug"

	"golang.org/x/mod/semver"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/plugin_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/dao"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
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
	pl := req.Plugin

	if pl.ServerURL == nil || *pl.ServerURL == "" {
		return p.PluginDraftDAO.Update(ctx, pl)
	}

	tx := query.Use(p.db).Begin()
	if tx.Error != nil {
		return tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			e := tx.Rollback()
			if e != nil {
				logs.Errorf("rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))

			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
				logs.Errorf("rollback failed, err=%v", e)
			}
		}
	}()

	err = p.PluginDraftDAO.UpdateWithTX(ctx, tx, pl)
	if err != nil {
		return err
	}

	err = p.ToolDraftDAO.ResetAllDebugStatusWithTX(ctx, tx, pl.ID)
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
			e := tx.Rollback()
			if e != nil {
				logs.Errorf("rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))

			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
				logs.Errorf("rollback failed, err=%v", e)
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
	plugin, err := p.PluginDAO.Get(ctx, req.PluginID)
	if err != nil {
		return nil, err
	}

	return &GetPluginResponse{
		Plugin: plugin,
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
				logs.Errorf("rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))

			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
				logs.Errorf("rollback failed, err=%v", e)
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
	return p.ToolDraftDAO.Update(ctx, req.Tool)
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
				logs.Errorf("rollback failed, err=%v", e)
			}

			err = fmt.Errorf("catch panic: %v\nstack=%s", r, string(debug.Stack()))

			return
		}

		if err != nil {
			e := tx.Rollback()
			if e != nil {
				logs.Errorf("rollback failed, err=%v", e)
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
	//TODO implement me
	panic("implement me")
}
