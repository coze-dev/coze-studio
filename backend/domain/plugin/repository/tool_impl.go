package repository

import (
	"context"
	"fmt"
	"runtime/debug"

	"github.com/getkin/kin-openapi/openapi3"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
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

func (t toolRepoImpl) CreateDraftTool(ctx context.Context, tool *entity.ToolInfo) (toolID int64, err error) {
	return t.toolDraftDAO.Create(ctx, tool)
}

func (t toolRepoImpl) UpdateDraftTool(ctx context.Context, tool *entity.ToolInfo) (err error) {
	return t.toolDraftDAO.Update(ctx, tool)
}

func (t toolRepoImpl) GetDraftTool(ctx context.Context, toolID int64) (tool *entity.ToolInfo, exist bool, err error) {
	return t.toolDraftDAO.Get(ctx, toolID)
}

func (t toolRepoImpl) MGetDraftTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
	return t.toolDraftDAO.MGet(ctx, toolIDs)
}

func (t toolRepoImpl) GetDraftToolWithAPI(ctx context.Context, pluginID int64, api entity.UniqueToolAPI) (tool *entity.ToolInfo, exist bool, err error) {
	return t.toolDraftDAO.GetWithAPI(ctx, pluginID, api)
}

func (t toolRepoImpl) MGetDraftToolWithAPI(ctx context.Context, pluginID int64, apis []entity.UniqueToolAPI) (tools map[entity.UniqueToolAPI]*entity.ToolInfo, err error) {
	return t.toolDraftDAO.MGetWithAPIs(ctx, pluginID, apis)
}

func (t toolRepoImpl) DeleteDraftTool(ctx context.Context, toolID int64) (err error) {
	return t.toolDraftDAO.Delete(ctx, toolID)
}

func (t toolRepoImpl) GetOnlineTool(ctx context.Context, toolID int64) (tool *entity.ToolInfo, exist bool, err error) {
	return t.toolDAO.Get(ctx, toolID)
}

func (t toolRepoImpl) MGetOnlineTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
	return t.toolDAO.MGet(ctx, toolIDs)
}

func (t toolRepoImpl) CheckOnlineToolExist(ctx context.Context, toolID int64) (exist bool, err error) {
	return t.toolDAO.CheckToolExist(ctx, toolID)
}

func (t toolRepoImpl) CheckOnlineToolsExist(ctx context.Context, toolIDs []int64) (exist map[int64]bool, err error) {
	return t.toolDAO.CheckToolsExist(ctx, toolIDs)
}

func (t toolRepoImpl) GetVersionTool(ctx context.Context, vTool entity.VersionTool) (tool *entity.ToolInfo, err error) {
	return t.toolVersionDAO.Get(ctx, vTool)
}

func (t toolRepoImpl) MGetVersionTools(ctx context.Context, vTools []entity.VersionTool) (tools []*entity.ToolInfo, err error) {
	return t.toolVersionDAO.MGet(ctx, vTools)
}

func (t toolRepoImpl) CreateDraftAgentTool(ctx context.Context, identity entity.AgentToolIdentity, tool *entity.ToolInfo) (err error) {
	return t.agentToolDraftDAO.Create(ctx, identity, tool)
}

func (t toolRepoImpl) GetDraftAgentTool(ctx context.Context, identity entity.AgentToolIdentity) (tool *entity.ToolInfo, exist bool, err error) {
	return t.agentToolDraftDAO.Get(ctx, identity)
}

func (t toolRepoImpl) MGetDraftAgentTools(ctx context.Context, agentID, spaceID int64, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
	return t.agentToolDraftDAO.MGet(ctx, agentID, spaceID, toolIDs)
}

func (t toolRepoImpl) DeleteDraftAgentTool(ctx context.Context, identity entity.AgentToolIdentity) (err error) {
	return t.agentToolDraftDAO.Delete(ctx, identity)
}

func (t toolRepoImpl) UpdateDraftAgentTool(ctx context.Context, identity entity.AgentToolIdentity, tool *entity.ToolInfo) (err error) {
	return t.agentToolDraftDAO.Update(ctx, identity, tool)
}

func (t toolRepoImpl) GetSpaceAllDraftAgentTools(ctx context.Context, agentID, spaceID int64) (tools []*entity.ToolInfo, err error) {
	return t.agentToolDraftDAO.GetAll(ctx, agentID, spaceID)
}

func (t toolRepoImpl) GetVersionAgentTool(ctx context.Context, agentID int64, vAgentTool entity.VersionAgentTool) (tool *entity.ToolInfo, exist bool, err error) {
	return t.agentToolVersionDAO.Get(ctx, agentID, vAgentTool)
}

func (t toolRepoImpl) MGetVersionAgentTools(ctx context.Context, agentID int64, vAgentTools []entity.VersionAgentTool) (tools []*entity.ToolInfo, err error) {
	return t.agentToolVersionDAO.MGet(ctx, agentID, vAgentTools)
}

func (t toolRepoImpl) BatchCreateVersionAgentTools(ctx context.Context, agentID int64, tools []*entity.ToolInfo) (toolVersions map[int64]int64, err error) {
	return t.agentToolVersionDAO.BatchCreate(ctx, agentID, tools)
}

func (t toolRepoImpl) UpdateDraftToolAndDebugExample(ctx context.Context, pluginID int64, openapiDoc *openapi3.T, updatedTool *entity.ToolInfo) (err error) {
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
		OpenapiDoc: openapiDoc,
	}
	err = t.pluginDraftDAO.UpdateWithTX(ctx, tx, updatedPlugin)
	if err != nil {
		return err
	}

	return tx.Commit()
}
