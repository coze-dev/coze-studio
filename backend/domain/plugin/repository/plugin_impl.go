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

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/jinzhu/copier"
	"gorm.io/gorm"

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	common "github.com/coze-dev/coze-studio/backend/api/model/plugin_develop_common"
	pluginConf "github.com/coze-dev/coze-studio/backend/domain/plugin/conf"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type pluginRepoImpl struct {
	query *query.Query

	pluginDraftDAO   *dal.PluginDraftDAO
	pluginDAO        *dal.PluginDAO
	pluginVersionDAO *dal.PluginVersionDAO

	toolDraftDAO   *dal.ToolDraftDAO
	toolDAO        *dal.ToolDAO
	toolVersionDAO *dal.ToolVersionDAO
}

type PluginRepoComponents struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewPluginRepo(components *PluginRepoComponents) PluginRepository {
	return &pluginRepoImpl{
		query:            query.Use(components.DB),
		pluginDraftDAO:   dal.NewPluginDraftDAO(components.DB, components.IDGen),
		pluginDAO:        dal.NewPluginDAO(components.DB, components.IDGen),
		pluginVersionDAO: dal.NewPluginVersionDAO(components.DB, components.IDGen),
		toolDraftDAO:     dal.NewToolDraftDAO(components.DB, components.IDGen),
		toolDAO:          dal.NewToolDAO(components.DB, components.IDGen),
		toolVersionDAO:   dal.NewToolVersionDAO(components.DB, components.IDGen),
	}
}

func (p *pluginRepoImpl) CreateDraftPlugin(ctx context.Context, plugin *entity.PluginInfo) (pluginID int64, err error) {
	pluginID, err = p.pluginDraftDAO.Create(ctx, plugin)
	if err != nil {
		return 0, err
	}

	return pluginID, nil
}

func (p *pluginRepoImpl) GetDraftPlugin(ctx context.Context, pluginID int64, opts ...PluginSelectedOptions) (plugin *entity.PluginInfo, exist bool, err error) {
	var opt *dal.PluginSelectedOption
	if len(opts) > 0 {
		opt = &dal.PluginSelectedOption{}
		for _, o := range opts {
			o(opt)
		}
	}

	return p.pluginDraftDAO.Get(ctx, pluginID, opt)
}

func (p *pluginRepoImpl) MGetDraftPlugins(ctx context.Context, pluginIDs []int64, opts ...PluginSelectedOptions) (plugins []*entity.PluginInfo, err error) {
	var opt *dal.PluginSelectedOption
	if len(opts) > 0 {
		opt = &dal.PluginSelectedOption{}
		for _, o := range opts {
			o(opt)
		}
	}

	return p.pluginDraftDAO.MGet(ctx, pluginIDs, opt)
}

func (p *pluginRepoImpl) GetAPPAllDraftPlugins(ctx context.Context, appID int64, opts ...PluginSelectedOptions) (plugins []*entity.PluginInfo, err error) {
	var opt *dal.PluginSelectedOption
	if len(opts) > 0 {
		opt = &dal.PluginSelectedOption{}
		for _, o := range opts {
			o(opt)
		}
	}

	return p.pluginDraftDAO.GetAPPAllPlugins(ctx, appID, opt)
}

func (p *pluginRepoImpl) ListDraftPlugins(ctx context.Context, req *ListDraftPluginsRequest) (resp *ListDraftPluginsResponse, err error) {
	plugins, total, err := p.pluginDraftDAO.List(ctx, req.SpaceID, req.APPID, req.PageInfo)
	if err != nil {
		return nil, err
	}

	resp = &ListDraftPluginsResponse{
		Plugins: plugins,
		Total:   total,
	}

	return resp, nil
}

func (p *pluginRepoImpl) UpdateDraftPlugin(ctx context.Context, plugin *entity.PluginInfo) (err error) {
	tx := p.query.Begin()
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

	err = p.pluginDraftDAO.UpdateWithTX(ctx, tx, plugin)
	if err != nil {
		return err
	}

	err = p.toolDraftDAO.ResetAllDebugStatusWithTX(ctx, tx, plugin.ID)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func (p *pluginRepoImpl) UpdateDraftPluginWithoutURLChanged(ctx context.Context, plugin *entity.PluginInfo) (err error) {
	return p.pluginDraftDAO.Update(ctx, plugin)
}

func (p *pluginRepoImpl) GetOnlinePlugin(ctx context.Context, pluginID int64, opts ...PluginSelectedOptions) (plugin *entity.PluginInfo, exist bool, err error) {
	pi, exist := pluginConf.GetPluginProduct(pluginID)
	if exist {
		return entity.NewPluginInfo(pi.Info), true, nil
	}

	var opt *dal.PluginSelectedOption
	if len(opts) > 0 {
		opt = &dal.PluginSelectedOption{}
		for _, o := range opts {
			o(opt)
		}
	}

	return p.pluginDAO.Get(ctx, pluginID, opt)
}

func (p *pluginRepoImpl) MGetOnlinePlugins(ctx context.Context, pluginIDs []int64, opts ...PluginSelectedOptions) (plugins []*entity.PluginInfo, err error) {
	pluginProducts := pluginConf.MGetPluginProducts(pluginIDs)
	plugins = slices.Transform(pluginProducts, func(pl *pluginConf.PluginInfo) *entity.PluginInfo {
		return entity.NewPluginInfo(pl.Info)
	})
	productPluginIDs := slices.ToMap(pluginProducts, func(plugin *pluginConf.PluginInfo) (int64, bool) {
		return plugin.Info.ID, true
	})

	customPluginIDs := make([]int64, 0, len(pluginIDs))
	for _, id := range pluginIDs {
		_, ok := productPluginIDs[id]
		if ok {
			continue
		}
		customPluginIDs = append(customPluginIDs, id)
	}

	var opt *dal.PluginSelectedOption
	if len(opts) > 0 {
		opt = &dal.PluginSelectedOption{}
		for _, o := range opts {
			o(opt)
		}
	}

	customPlugins, err := p.pluginDAO.MGet(ctx, customPluginIDs, opt)
	if err != nil {
		return nil, err
	}

	plugins = append(plugins, customPlugins...)

	return plugins, nil
}

func (p *pluginRepoImpl) ListCustomOnlinePlugins(ctx context.Context, spaceID int64, pageInfo entity.PageInfo) (plugins []*entity.PluginInfo, total int64, err error) {
	return p.pluginDAO.List(ctx, spaceID, pageInfo)
}

func (p *pluginRepoImpl) GetVersionPlugin(ctx context.Context, vPlugin entity.VersionPlugin) (plugin *entity.PluginInfo, exist bool, err error) {
	pi, exist := pluginConf.GetPluginProduct(vPlugin.PluginID)
	if exist {
		return entity.NewPluginInfo(pi.Info), true, nil
	}

	return p.pluginVersionDAO.Get(ctx, vPlugin.PluginID, vPlugin.Version)
}

func (p *pluginRepoImpl) MGetVersionPlugins(ctx context.Context, vPlugins []entity.VersionPlugin, opts ...PluginSelectedOptions) (plugins []*entity.PluginInfo, err error) {
	pluginIDs := make([]int64, 0, len(vPlugins))
	for _, vPlugin := range vPlugins {
		pluginIDs = append(pluginIDs, vPlugin.PluginID)
	}

	pluginProducts := pluginConf.MGetPluginProducts(pluginIDs)
	plugins = slices.Transform(pluginProducts, func(pl *pluginConf.PluginInfo) *entity.PluginInfo {
		return entity.NewPluginInfo(pl.Info)
	})
	productPluginIDs := slices.ToMap(pluginProducts, func(plugin *pluginConf.PluginInfo) (int64, bool) {
		return plugin.Info.ID, true
	})

	vCustomPlugins := make([]entity.VersionPlugin, 0, len(pluginIDs))
	for _, v := range vPlugins {
		_, ok := productPluginIDs[v.PluginID]
		if ok {
			continue
		}
		vCustomPlugins = append(vCustomPlugins, v)
	}

	var opt *dal.PluginSelectedOption
	if len(opts) > 0 {
		opt = &dal.PluginSelectedOption{}
		for _, o := range opts {
			o(opt)
		}
	}

	customPlugins, err := p.pluginVersionDAO.MGet(ctx, vCustomPlugins, opt)
	if err != nil {
		return nil, err
	}

	plugins = append(plugins, customPlugins...)

	return plugins, nil
}

func (p *pluginRepoImpl) PublishPlugin(ctx context.Context, draftPlugin *entity.PluginInfo) (err error) {
	draftTools, err := p.toolDraftDAO.GetAll(ctx, draftPlugin.ID, nil)
	if err != nil {
		return err
	}

	activatedTools := make([]*entity.ToolInfo, 0, len(draftTools))
	for _, tool := range draftTools {
		if tool.GetActivatedStatus() == model.DeactivateTool {
			continue
		}

		tool.Version = draftPlugin.Version

		activatedTools = append(activatedTools, tool)
	}

	if len(activatedTools) == 0 {
		return errorx.New(errno.ErrPluginToolsCheckFailed, errorx.KVf(errno.PluginMsgKey,
			"at least one activated tool is required in plugin '%s'", draftPlugin.GetName()))
	}

	tx := p.query.Begin()
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

	err = p.pluginDAO.UpsertWithTX(ctx, tx, draftPlugin)
	if err != nil {
		return err
	}

	err = p.pluginVersionDAO.CreateWithTX(ctx, tx, draftPlugin)
	if err != nil {
		return err
	}

	err = p.toolDAO.DeleteAllWithTX(ctx, tx, draftPlugin.ID)
	if err != nil {
		return err
	}

	err = p.toolDAO.BatchCreateWithTX(ctx, tx, activatedTools)
	if err != nil {
		return err
	}

	err = p.toolVersionDAO.BatchCreateWithTX(ctx, tx, activatedTools)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (p *pluginRepoImpl) PublishPlugins(ctx context.Context, draftPlugins []*entity.PluginInfo) (err error) {
	draftPluginMap := slices.ToMap(draftPlugins, func(plugin *entity.PluginInfo) (int64, *entity.PluginInfo) {
		return plugin.ID, plugin
	})

	pluginTools := make(map[int64][]*entity.ToolInfo, len(draftPlugins))
	for _, draftPlugin := range draftPlugins {
		draftTools, err := p.toolDraftDAO.GetAll(ctx, draftPlugin.ID, nil)
		if err != nil {
			return err
		}

		activatedTools := make([]*entity.ToolInfo, 0, len(draftTools))
		for _, tool := range draftTools {
			if tool.GetActivatedStatus() == model.DeactivateTool {
				continue
			}

			if tool.DebugStatus == nil ||
				*tool.DebugStatus == common.APIDebugStatus_DebugWaiting {
				return errorx.New(errno.ErrPluginToolsCheckFailed, errorx.KVf(errno.PluginMsgKey,
					"tool '%s' in plugin '%s' has not debugged yet", tool.GetName(), draftPlugin.GetName()))
			}

			tool.Version = draftPlugin.Version

			activatedTools = append(activatedTools, tool)
		}

		if len(activatedTools) == 0 {
			return errorx.New(errno.ErrPluginToolsCheckFailed, errorx.KVf(errno.PluginMsgKey,
				"at least one activated tool is required in plugin '%s'", draftPlugin.GetName()))
		}

		pluginTools[draftPlugin.ID] = activatedTools
	}

	tx := p.query.Begin()
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

	for pluginID, tools := range pluginTools {
		draftPlugin := draftPluginMap[pluginID]

		err = p.pluginDAO.UpsertWithTX(ctx, tx, draftPlugin)
		if err != nil {
			return err
		}

		err = p.pluginVersionDAO.CreateWithTX(ctx, tx, draftPlugin)
		if err != nil {
			return err
		}

		err = p.toolDAO.DeleteAllWithTX(ctx, tx, draftPlugin.ID)
		if err != nil {
			return err
		}

		err = p.toolDAO.BatchCreateWithTX(ctx, tx, tools)
		if err != nil {
			return err
		}

		err = p.toolVersionDAO.BatchCreateWithTX(ctx, tx, tools)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (p *pluginRepoImpl) DeleteDraftPlugin(ctx context.Context, pluginID int64) (err error) {
	tx := p.query.Begin()
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

	err = p.pluginDraftDAO.DeleteWithTX(ctx, tx, pluginID)
	if err != nil {
		return err
	}
	err = p.pluginDAO.DeleteWithTX(ctx, tx, pluginID)
	if err != nil {
		return err
	}
	err = p.pluginVersionDAO.DeleteWithTX(ctx, tx, pluginID)
	if err != nil {
		return err
	}
	err = p.toolDraftDAO.DeleteAllWithTX(ctx, tx, pluginID)
	if err != nil {
		return err
	}
	err = p.toolDAO.DeleteAllWithTX(ctx, tx, pluginID)
	if err != nil {
		return err
	}
	err = p.toolVersionDAO.DeleteWithTX(ctx, tx, pluginID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (p *pluginRepoImpl) DeleteAPPAllPlugins(ctx context.Context, appID int64) (pluginIDs []int64, err error) {
	opt := &dal.PluginSelectedOption{
		PluginID: true,
	}
	plugins, err := p.pluginDraftDAO.GetAPPAllPlugins(ctx, appID, opt)
	if err != nil {
		return nil, err
	}

	pluginIDs = slices.Transform(plugins, func(plugin *entity.PluginInfo) int64 {
		return plugin.ID
	})

	tx := p.query.Begin()
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

	for _, id := range pluginIDs {
		err = p.pluginDraftDAO.DeleteWithTX(ctx, tx, id)
		if err != nil {
			return nil, err
		}
		err = p.pluginDAO.DeleteWithTX(ctx, tx, id)
		if err != nil {
			return nil, err
		}
		err = p.pluginVersionDAO.DeleteWithTX(ctx, tx, id)
		if err != nil {
			return nil, err
		}
		err = p.toolDraftDAO.DeleteAllWithTX(ctx, tx, id)
		if err != nil {
			return nil, err
		}
		err = p.toolDAO.DeleteAllWithTX(ctx, tx, id)
		if err != nil {
			return nil, err
		}
		err = p.toolVersionDAO.DeleteWithTX(ctx, tx, id)
		if err != nil {
			return nil, err
		}
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	return pluginIDs, nil
}

func (p *pluginRepoImpl) UpdateDraftPluginWithCode(ctx context.Context, req *UpdatePluginDraftWithCode) (err error) {
	tx := p.query.Begin()
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

	newDoc := &model.Openapi3T{}
	err = copier.CopyWithOption(newDoc, req.OpenapiDoc, copier.Option{DeepCopy: true, IgnoreEmpty: true})
	if err != nil {
		return err
	}

	newDoc.Paths = openapi3.Paths{} // reset paths

	updatedPlugin := entity.NewPluginInfo(&model.PluginInfo{
		ID:         req.PluginID,
		ServerURL:  ptr.Of(req.OpenapiDoc.Servers[0].URL),
		Manifest:   req.Manifest,
		OpenapiDoc: req.OpenapiDoc,
	})
	err = p.pluginDraftDAO.UpdateWithTX(ctx, tx, updatedPlugin)
	if err != nil {
		return err
	}

	for _, tool := range req.UpdatedTools {
		err = p.toolDraftDAO.UpdateWithTX(ctx, tx, tool)
		if err != nil {
			return err
		}
	}

	if len(req.NewDraftTools) > 0 {
		_, err = p.toolDraftDAO.BatchCreateWithTX(ctx, tx, req.NewDraftTools)
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

func (p *pluginRepoImpl) CreateDraftPluginWithCode(ctx context.Context, req *CreateDraftPluginWithCodeRequest) (resp *CreateDraftPluginWithCodeResponse, err error) {
	doc := req.OpenapiDoc
	mf := req.Manifest

	pluginType, _ := model.ToThriftPluginType(mf.API.Type)

	pl := entity.NewPluginInfo(&model.PluginInfo{
		PluginType:  pluginType,
		SpaceID:     req.SpaceID,
		DeveloperID: req.DeveloperID,
		APPID:       req.ProjectID,
		IconURI:     ptr.Of(mf.LogoURL),
		ServerURL:   ptr.Of(doc.Servers[0].URL),
		Manifest:    mf,
		OpenapiDoc:  doc,
	})

	tools := make([]*entity.ToolInfo, 0, len(doc.Paths))
	for subURL, pathItem := range doc.Paths {
		for method, op := range pathItem.Operations() {
			tools = append(tools, &entity.ToolInfo{
				ActivatedStatus: ptr.Of(model.ActivateTool),
				DebugStatus:     ptr.Of(common.APIDebugStatus_DebugWaiting),
				SubURL:          ptr.Of(subURL),
				Method:          ptr.Of(method),
				Operation:       model.NewOpenapi3Operation(op),
			})
		}
	}

	tx := p.query.Begin()
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

	pluginID, err := p.pluginDraftDAO.CreateWithTX(ctx, tx, pl)
	if err != nil {
		return nil, err
	}

	pl.ID = pluginID

	for _, tool := range tools {
		tool.PluginID = pluginID
	}

	_, err = p.toolDraftDAO.BatchCreateWithTX(ctx, tx, tools)
	if err != nil {
		return nil, err
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	return &CreateDraftPluginWithCodeResponse{
		Plugin: pl,
		Tools:  tools,
	}, nil
}

func (p *pluginRepoImpl) CopyPlugin(ctx context.Context, req *CopyPluginRequest) (plugin *entity.PluginInfo, tools []*entity.ToolInfo, err error) {
	tx := p.query.Begin()
	if tx.Error != nil {
		return nil, nil, tx.Error
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

	plugin, tools = req.Plugin, req.Tools

	newPluginID, err := p.pluginDraftDAO.CreateWithTX(ctx, tx, plugin)
	if err != nil {
		return nil, nil, err
	}

	plugin.ID = newPluginID
	for _, tool := range tools {
		tool.PluginID = newPluginID
	}

	toolIDs, err := p.toolDraftDAO.BatchCreateWithTX(ctx, tx, tools)
	if err != nil {
		return nil, nil, err
	}

	for i, tool := range tools {
		tool.ID = toolIDs[i]
	}

	if plugin.GetVersion() == "" {
		err = tx.Commit()
		if err != nil {
			return nil, nil, err
		}

		return plugin, tools, nil
	}

	// publish plugin
	filteredTools := make([]*entity.ToolInfo, 0, len(tools))
	for _, tool := range tools {
		if tool.GetActivatedStatus() == model.DeactivateTool ||
			tool.GetDebugStatus() == common.APIDebugStatus_DebugWaiting {
			continue
		}
		filteredTools = append(filteredTools, tool)
	}

	if len(filteredTools) == 0 {
		return nil, nil, fmt.Errorf("at least one activated tool is required in plugin '%d'", plugin.ID)
	}

	err = p.pluginDAO.UpsertWithTX(ctx, tx, plugin)
	if err != nil {
		return nil, nil, err
	}
	err = p.pluginVersionDAO.CreateWithTX(ctx, tx, plugin)
	if err != nil {
		return nil, nil, err
	}

	err = p.toolDAO.BatchCreateWithTX(ctx, tx, filteredTools)
	if err != nil {
		return nil, nil, err
	}
	err = p.toolVersionDAO.BatchCreateWithTX(ctx, tx, filteredTools)
	if err != nil {
		return nil, nil, err
	}

	err = tx.Commit()
	if err != nil {
		return nil, nil, err
	}

	return req.Plugin, req.Tools, nil
}

func (p *pluginRepoImpl) MoveAPPPluginToLibrary(ctx context.Context, draftPlugin *entity.PluginInfo,
	draftTools []*entity.ToolInfo) (err error) {

	tx := p.query.Begin()
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

	err = p.pluginDraftDAO.UpdateWithTX(ctx, tx, draftPlugin)
	if err != nil {
		return err
	}

	err = p.pluginDAO.DeleteWithTX(ctx, tx, draftPlugin.ID)
	if err != nil {
		return err
	}
	err = p.pluginVersionDAO.DeleteWithTX(ctx, tx, draftPlugin.ID)
	if err != nil {
		return err
	}
	err = p.toolDAO.DeleteAllWithTX(ctx, tx, draftPlugin.ID)
	if err != nil {
		return err
	}
	err = p.toolVersionDAO.DeleteWithTX(ctx, tx, draftPlugin.ID)
	if err != nil {
		return err
	}

	// publish plugin
	err = p.pluginDAO.UpsertWithTX(ctx, tx, draftPlugin)
	if err != nil {
		return err
	}
	err = p.pluginVersionDAO.CreateWithTX(ctx, tx, draftPlugin)
	if err != nil {
		return err
	}
	err = p.toolDAO.BatchCreateWithTX(ctx, tx, draftTools)
	if err != nil {
		return err
	}
	err = p.toolVersionDAO.BatchCreateWithTX(ctx, tx, draftTools)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func (p *pluginRepoImpl) UpdateDebugExample(ctx context.Context, pluginID int64, openapiDoc *model.Openapi3T) (err error) {
	updatedPlugin := entity.NewPluginInfo(&model.PluginInfo{
		ID:         pluginID,
		OpenapiDoc: openapiDoc,
	})
	return p.pluginDraftDAO.Update(ctx, updatedPlugin)
}
