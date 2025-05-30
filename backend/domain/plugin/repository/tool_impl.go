package repository

import (
	"context"
	"fmt"
	"runtime/debug"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	pluginConf "code.byted.org/flow/opencoze/backend/conf/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
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

func (t *toolRepoImpl) UpdateDraftTool(ctx context.Context, tool *entity.ToolInfo) (err error) {
	return t.toolDraftDAO.Update(ctx, tool)
}

func (t *toolRepoImpl) GetDraftTool(ctx context.Context, toolID int64) (tool *entity.ToolInfo, exist bool, err error) {
	return t.toolDraftDAO.Get(ctx, toolID)
}

func (t *toolRepoImpl) MGetDraftTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
	return t.toolDraftDAO.MGet(ctx, toolIDs)
}

func (t *toolRepoImpl) GetDraftToolWithAPI(ctx context.Context, pluginID int64, api entity.UniqueToolAPI) (tool *entity.ToolInfo, exist bool, err error) {
	return t.toolDraftDAO.GetWithAPI(ctx, pluginID, api)
}

func (t *toolRepoImpl) MGetDraftToolWithAPI(ctx context.Context, pluginID int64, apis []entity.UniqueToolAPI) (tools map[entity.UniqueToolAPI]*entity.ToolInfo, err error) {
	return t.toolDraftDAO.MGetWithAPIs(ctx, pluginID, apis)
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

func (t *toolRepoImpl) MGetOnlineTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
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

	customTools, err := t.toolDAO.MGet(ctx, customToolIDs)
	if err != nil {
		return nil, err
	}

	tools = append(tools, customTools...)

	return tools, nil
}

func (t *toolRepoImpl) CheckOnlineToolExist(ctx context.Context, toolID int64) (exist bool, err error) {
	_, exist = pluginConf.GetToolProduct(toolID)
	if exist {
		return true, nil
	}

	return t.toolDAO.CheckToolExist(ctx, toolID)
}

func (t *toolRepoImpl) CheckOnlineToolsExist(ctx context.Context, toolIDs []int64) (exists map[int64]bool, err error) {
	exists = make(map[int64]bool, len(toolIDs))

	toolProducts := pluginConf.MGetToolProducts(toolIDs)
	exists = slices.ToMap(toolProducts, func(tool *pluginConf.ToolInfo) (int64, bool) {
		return tool.Info.ID, true
	})

	customToolIDs := make([]int64, 0, len(toolIDs))
	for _, toolID := range toolIDs {
		_, ok := exists[toolID]
		if ok {
			continue
		}
		customToolIDs = append(customToolIDs, toolID)
	}

	customExists, err := t.toolDAO.CheckToolsExist(ctx, customToolIDs)
	if err != nil {
		return nil, err
	}

	for toolID := range customExists {
		exists[toolID] = true
	}

	return exists, nil
}

func (t *toolRepoImpl) GetVersionTool(ctx context.Context, vTool entity.VersionTool) (tool *entity.ToolInfo, exist bool, err error) {
	ti, exist := pluginConf.GetToolProduct(vTool.ToolID)
	if exist {
		return ti.Info, true, nil
	}

	return t.toolVersionDAO.Get(ctx, vTool)
}

func (t *toolRepoImpl) BindDraftAgentTools(ctx context.Context, agentID int64, toolIDs []int64) (err error) {
	onlineTools, err := t.MGetOnlineTools(ctx, toolIDs)
	if err != nil {
		return err
	}

	if len(onlineTools) == 0 {
		return t.agentToolDraftDAO.DeleteAll(ctx, agentID)
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

	err = t.agentToolDraftDAO.DeleteAllWithTX(ctx, tx, agentID)
	if err != nil {
		return err
	}

	err = t.agentToolDraftDAO.BatchCreateWithTX(ctx, tx, agentID, onlineTools)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (t *toolRepoImpl) GetDraftAgentTool(ctx context.Context, req *GetDraftAgentToolRequest) (tool *entity.ToolInfo, exist bool, err error) {
	return t.agentToolDraftDAO.Get(ctx, req.AgentID, req.ToolID)
}

func (t *toolRepoImpl) GetDraftAgentToolWithToolName(ctx context.Context, req *GetDraftAgentToolWithToolNameRequest) (tool *entity.ToolInfo, exist bool, err error) {
	return t.agentToolDraftDAO.GetWithToolName(ctx, req.AgentID, req.ToolName)
}

func (t *toolRepoImpl) MGetDraftAgentTools(ctx context.Context, req *MGetDraftAgentToolsRequest) (tools []*entity.ToolInfo, err error) {
	return t.agentToolDraftDAO.MGet(ctx, req.AgentID, req.ToolIDs)
}

func (t *toolRepoImpl) UpdateDraftAgentTool(ctx context.Context, req *UpdateDraftAgentToolRequest) (err error) {
	return t.agentToolDraftDAO.UpdateWithToolName(ctx, req.AgentID, req.ToolName, req.Tool)
}

func (t *toolRepoImpl) GetSpaceAllDraftAgentTools(ctx context.Context, agentID int64) (tools []*entity.ToolInfo, err error) {
	return t.agentToolDraftDAO.GetAll(ctx, agentID)
}

func (t *toolRepoImpl) GetVersionAgentTool(ctx context.Context, agentID int64, vAgentTool entity.VersionAgentTool) (tool *entity.ToolInfo, exist bool, err error) {
	return t.agentToolVersionDAO.Get(ctx, agentID, vAgentTool)
}

func (t *toolRepoImpl) GetVersionAgentToolWithToolName(ctx context.Context, req *GetVersionAgentToolWithToolNameRequest) (tool *entity.ToolInfo, exist bool, err error) {
	return t.agentToolVersionDAO.GetWithToolName(ctx, req.AgentID, req.ToolName, req.VersionMs)
}

func (t *toolRepoImpl) MGetVersionAgentTool(ctx context.Context, agentID int64, vAgentTools []entity.VersionAgentTool) (tools []*entity.ToolInfo, err error) {
	return t.agentToolVersionDAO.MGet(ctx, agentID, vAgentTools)
}

func (t *toolRepoImpl) BatchCreateVersionAgentTools(ctx context.Context, agentID int64, tools []*entity.ToolInfo) (toolVersions map[int64]int64, err error) {
	return t.agentToolVersionDAO.BatchCreate(ctx, agentID, tools)
}

func (t *toolRepoImpl) UpdateDraftToolAndDebugExample(ctx context.Context, pluginID int64, doc *plugin.Openapi3T, updatedTool *entity.ToolInfo) (err error) {
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

	err = t.toolDraftDAO.UpdateWithTX(ctx, tx, updatedTool)
	if err != nil {
		return err
	}

	updatedPlugin := entity.NewPluginInfo(&plugin.PluginInfo{
		ID:         pluginID,
		OpenapiDoc: doc,
	})
	err = t.pluginDraftDAO.UpdateWithTX(ctx, tx, updatedPlugin)
	if err != nil {
		return err
	}

	return tx.Commit()
}
