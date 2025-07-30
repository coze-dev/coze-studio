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
	"fmt"
	"runtime/debug"

	"gorm.io/gorm"

	pluginConf "github.com/coze-dev/coze-studio/backend/domain/plugin/conf"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
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
	apis := slices.Transform(tools, func(tool *entity.ToolInfo) entity.UniqueToolAPI {
		return entity.UniqueToolAPI{
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
		existTool, exist := existTools[entity.UniqueToolAPI{
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

func (t *toolRepoImpl) ListPluginDraftTools(ctx context.Context, pluginID int64, pageInfo entity.PageInfo) (tools []*entity.ToolInfo, total int64, err error) {
	return t.toolDraftDAO.List(ctx, pluginID, pageInfo)
}

func (t *toolRepoImpl) GetDraftToolWithAPI(ctx context.Context, pluginID int64, api entity.UniqueToolAPI) (tool *entity.ToolInfo, exist bool, err error) {
	return t.toolDraftDAO.GetWithAPI(ctx, pluginID, api)
}

func (t *toolRepoImpl) MGetDraftToolWithAPI(ctx context.Context, pluginID int64, apis []entity.UniqueToolAPI, opts ...ToolSelectedOptions) (tools map[entity.UniqueToolAPI]*entity.ToolInfo, err error) {
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

func (t *toolRepoImpl) GetVersionTool(ctx context.Context, vTool entity.VersionTool) (tool *entity.ToolInfo, exist bool, err error) {
	ti, exist := pluginConf.GetToolProduct(vTool.ToolID)
	if exist {
		return ti.Info, true, nil
	}

	return t.toolVersionDAO.Get(ctx, vTool)
}

func (t *toolRepoImpl) MGetVersionTools(ctx context.Context, versionTools []entity.VersionTool) (tools []*entity.ToolInfo, err error) {
	tools, err = t.toolVersionDAO.MGet(ctx, versionTools)
	if err != nil {
		return nil, err
	}

	return tools, nil
}

func (t *toolRepoImpl) BindDraftAgentTools(ctx context.Context, agentID int64, toolIDs []int64) (err error) {
	opt := &dal.ToolSelectedOption{
		ToolID: true,
	}
	draftAgentTools, err := t.agentToolDraftDAO.GetAll(ctx, agentID, opt)
	if err != nil {
		return err
	}

	draftAgentToolIDMap := slices.ToMap(draftAgentTools, func(tool *entity.ToolInfo) (int64, bool) {
		return tool.ID, true
	})

	bindToolIDMap := slices.ToMap(toolIDs, func(toolID int64) (int64, bool) {
		return toolID, true
	})

	newBindToolIDs := make([]int64, 0, len(toolIDs))
	for _, toolID := range toolIDs {
		_, ok := draftAgentToolIDMap[toolID]
		if ok {
			continue
		}
		newBindToolIDs = append(newBindToolIDs, toolID)
	}

	removeToolIDs := make([]int64, 0, len(draftAgentTools))
	for toolID := range draftAgentToolIDMap {
		_, ok := bindToolIDMap[toolID]
		if ok {
			continue
		}
		removeToolIDs = append(removeToolIDs, toolID)
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

	onlineTools, err := t.MGetOnlineTools(ctx, newBindToolIDs)
	if err != nil {
		return err
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

func (t *toolRepoImpl) GetVersionAgentTool(ctx context.Context, agentID int64, vAgentTool entity.VersionAgentTool) (tool *entity.ToolInfo, exist bool, err error) {
	return t.agentToolVersionDAO.Get(ctx, agentID, vAgentTool)
}

func (t *toolRepoImpl) GetVersionAgentToolWithToolName(ctx context.Context, req *GetVersionAgentToolWithToolNameRequest) (tool *entity.ToolInfo, exist bool, err error) {
	return t.agentToolVersionDAO.GetWithToolName(ctx, req.AgentID, req.ToolName, req.AgentVersion)
}

func (t *toolRepoImpl) MGetVersionAgentTool(ctx context.Context, agentID int64, vAgentTools []entity.VersionAgentTool) (tools []*entity.ToolInfo, err error) {
	return t.agentToolVersionDAO.MGet(ctx, agentID, vAgentTools)
}

func (t *toolRepoImpl) BatchCreateVersionAgentTools(ctx context.Context, agentID int64, agentVersion string, tools []*entity.ToolInfo) (err error) {
	return t.agentToolVersionDAO.BatchCreate(ctx, agentID, agentVersion, tools)
}
