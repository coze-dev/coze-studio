package repository

import (
	"context"
	"fmt"
	"runtime/debug"

	"gorm.io/gorm"

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

	toolProductRef *dal.ToolProductRefDAO
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
		toolProductRef:      dal.NewToolProductRefDAO(components.DB, components.IDGen),
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
	tool, exist, err = t.toolProductRef.Get(ctx, toolID)
	if err != nil {
		return nil, false, err
	}
	if exist {
		return tool, true, nil
	}
	return t.toolDAO.Get(ctx, toolID)
}

func (t *toolRepoImpl) MGetOnlineTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
	tools = make([]*entity.ToolInfo, 0, len(toolIDs))

	toolProducts, err := t.toolProductRef.MGet(ctx, toolIDs)
	if err != nil {
		return nil, err
	}
	productToolIDs := slices.ToMap(toolProducts, func(tool *entity.ToolInfo) (int64, bool) {
		return tool.ID, true
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

	tools = append(toolProducts, customTools...)

	return tools, nil
}

func (t *toolRepoImpl) CheckOnlineToolExist(ctx context.Context, toolID int64) (exist bool, err error) {
	exist, err = t.toolProductRef.CheckToolExist(ctx, toolID)
	if err != nil {
		return false, err
	}
	if exist {
		return true, nil
	}
	return t.toolDAO.CheckToolExist(ctx, toolID)
}

func (t *toolRepoImpl) CheckOnlineToolsExist(ctx context.Context, toolIDs []int64) (exists map[int64]bool, err error) {
	exists = make(map[int64]bool, len(toolIDs))

	productExists, err := t.toolProductRef.CheckToolsExist(ctx, toolIDs)
	if err != nil {
		return nil, err
	}

	customToolIDs := make([]int64, 0, len(toolIDs))
	for _, toolID := range toolIDs {
		_, ok := productExists[toolID]
		if ok {
			exists[toolID] = true
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
	tool, exist, err = t.toolProductRef.Get(ctx, vTool.ToolID)
	if err != nil {
		return nil, false, err
	}
	if exist {
		return tool, true, nil
	}
	return t.toolVersionDAO.Get(ctx, vTool)
}

func (t *toolRepoImpl) BindDraftAgentTools(ctx context.Context, spaceID, agentID int64, toolIDs []int64) (err error) {
	onlineTools, err := t.MGetOnlineTools(ctx, toolIDs)
	if err != nil {
		return err
	}

	if len(onlineTools) == 0 {
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

	err = t.agentToolDraftDAO.DeleteAllWithTX(ctx, tx, spaceID, agentID)
	if err != nil {
		return err
	}

	err = t.agentToolDraftDAO.BatchCreateWithTX(ctx, tx, spaceID, agentID, onlineTools)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (t *toolRepoImpl) GetDraftAgentTool(ctx context.Context, identity entity.AgentToolIdentity) (tool *entity.ToolInfo, exist bool, err error) {
	return t.agentToolDraftDAO.Get(ctx, identity)
}

func (t *toolRepoImpl) MGetDraftAgentTools(ctx context.Context, spaceID, agentID int64, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
	return t.agentToolDraftDAO.MGet(ctx, agentID, spaceID, toolIDs)
}

func (t *toolRepoImpl) UpdateDraftAgentTool(ctx context.Context, identity entity.AgentToolIdentity, tool *entity.ToolInfo) (err error) {
	return t.agentToolDraftDAO.Update(ctx, identity, tool)
}

func (t *toolRepoImpl) GetSpaceAllDraftAgentTools(ctx context.Context, spaceID, agentID int64) (tools []*entity.ToolInfo, err error) {
	return t.agentToolDraftDAO.GetAll(ctx, agentID, spaceID)
}

func (t *toolRepoImpl) GetVersionAgentTool(ctx context.Context, agentID int64, vAgentTool entity.VersionAgentTool) (tool *entity.ToolInfo, exist bool, err error) {
	return t.agentToolVersionDAO.Get(ctx, agentID, vAgentTool)
}

func (t *toolRepoImpl) MGetVersionAgentTools(ctx context.Context, agentID int64, vAgentTools []entity.VersionAgentTool) (tools []*entity.ToolInfo, err error) {
	return t.agentToolVersionDAO.MGet(ctx, agentID, vAgentTools)
}

func (t *toolRepoImpl) BatchCreateVersionAgentTools(ctx context.Context, agentID int64, tools []*entity.ToolInfo) (toolVersions map[int64]int64, err error) {
	return t.agentToolVersionDAO.BatchCreate(ctx, agentID, tools)
}

func (t *toolRepoImpl) UpdateDraftToolAndDebugExample(ctx context.Context, pluginID int64, doc *entity.Openapi3T, updatedTool *entity.ToolInfo) (err error) {
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

	updatedPlugin := &entity.PluginInfo{
		ID:         pluginID,
		OpenapiDoc: doc,
	}
	err = t.pluginDraftDAO.UpdateWithTX(ctx, tx, updatedPlugin)
	if err != nil {
		return err
	}

	return tx.Commit()
}
