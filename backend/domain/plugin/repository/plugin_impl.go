package repository

import (
	"context"
	"fmt"
	"runtime/debug"

	"github.com/getkin/kin-openapi/openapi3"
	"gorm.io/gorm"

	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	pluginConf "code.byted.org/flow/opencoze/backend/conf/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
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

func (p *pluginRepoImpl) CreateDraftPlugin(ctx context.Context, req *CreateDraftPluginRequest) (resp *CreateDraftPluginResponse, err error) {
	pluginID, err := p.pluginDraftDAO.Create(ctx, req.Plugin)
	if err != nil {
		return nil, err
	}

	resp = &CreateDraftPluginResponse{
		PluginID: pluginID,
	}

	return resp, nil
}

func (p *pluginRepoImpl) GetDraftPlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, exist bool, err error) {
	return p.pluginDraftDAO.Get(ctx, pluginID)
}

func (p *pluginRepoImpl) MGetDraftPlugins(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error) {
	return p.pluginDraftDAO.MGet(ctx, pluginIDs)
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

func (p *pluginRepoImpl) CheckOnlinePluginExist(ctx context.Context, pluginID int64) (exist bool, err error) {
	_, exist = pluginConf.GetPluginProduct(pluginID)
	if exist {
		return true, nil
	}

	return p.pluginDAO.CheckPluginExist(ctx, pluginID)
}

func (p *pluginRepoImpl) GetOnlinePlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, exist bool, err error) {
	pi, exist := pluginConf.GetPluginProduct(pluginID)
	if exist {
		return pi.Info, true, nil
	}
	return p.pluginDAO.Get(ctx, pluginID)
}

func (p *pluginRepoImpl) MGetOnlinePlugins(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error) {
	pluginProducts := pluginConf.MGetPluginProducts(pluginIDs)
	plugins = slices.Transform(pluginProducts, func(pl *pluginConf.PluginInfo) *entity.PluginInfo {
		return pl.Info
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

	customPlugins, err := p.pluginDAO.MGet(ctx, customPluginIDs)
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
		return pi.Info, true, nil
	}

	return p.pluginVersionDAO.Get(ctx, vPlugin.PluginID, vPlugin.Version)
}

func (p *pluginRepoImpl) MGetVersionPlugins(ctx context.Context, vPlugins []entity.VersionPlugin) (plugins []*entity.PluginInfo, err error) {
	pluginIDs := make([]int64, 0, len(vPlugins))
	for _, vPlugin := range vPlugins {
		pluginIDs = append(pluginIDs, vPlugin.PluginID)
	}

	pluginProducts := pluginConf.MGetPluginProducts(pluginIDs)
	plugins = slices.Transform(pluginProducts, func(pl *pluginConf.PluginInfo) *entity.PluginInfo {
		return pl.Info
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

	customPlugins, err := p.pluginVersionDAO.MGet(ctx, vCustomPlugins)
	if err != nil {
		return nil, err
	}

	plugins = append(plugins, customPlugins...)

	return plugins, nil
}

func (p *pluginRepoImpl) GetPluginAllDraftTools(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error) {
	return p.toolDraftDAO.GetAll(ctx, pluginID)
}

func (p *pluginRepoImpl) GetPluginAllOnlineTools(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error) {
	pi, exist := pluginConf.GetPluginProduct(pluginID)
	if exist {
		tis := pi.GetPluginAllTools()
		tools = slices.Transform(tis, func(ti *pluginConf.ToolInfo) *entity.ToolInfo {
			return ti.Info
		})

		return tools, nil
	}

	tools, err = p.toolDAO.GetAll(ctx, pluginID)
	if err != nil {
		return nil, err
	}

	return tools, nil
}

func (p *pluginRepoImpl) PublishPlugin(ctx context.Context, draftPlugin *entity.PluginInfo) (err error) {
	draftTools, err := p.toolDraftDAO.GetAll(ctx, draftPlugin.ID)
	if err != nil {
		return err
	}

	filteredTools := make([]*entity.ToolInfo, 0, len(draftTools))
	for _, tool := range draftTools {
		if tool.GetActivatedStatus() == consts.DeactivateTool {
			continue
		}

		if tool.DebugStatus == nil ||
			*tool.DebugStatus == common.APIDebugStatus_DebugWaiting {
			return fmt.Errorf("tool '%d' does not pass debugging", tool.ID)
		}

		tool.Version = draftPlugin.Version

		filteredTools = append(filteredTools, tool)
	}

	if len(filteredTools) == 0 {
		return fmt.Errorf("at least one tool is required")
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

	err = p.toolDAO.BatchCreateWithTX(ctx, tx, filteredTools)
	if err != nil {
		return err
	}

	err = p.toolVersionDAO.BatchCreateWithTX(ctx, tx, filteredTools)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
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

	err = p.toolDraftDAO.DeleteAllWithTX(ctx, tx, pluginID)
	if err != nil {
		return err
	}

	err = p.toolDAO.DeleteAllWithTX(ctx, tx, pluginID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (p *pluginRepoImpl) ListPluginDraftTools(ctx context.Context, pluginID int64, pageInfo entity.PageInfo) (tools []*entity.ToolInfo, total int64, err error) {
	return p.toolDraftDAO.List(ctx, pluginID, pageInfo)
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

	// plugin 表只存储 root 信息，更新后需要还原
	paths := req.OpenapiDoc.Paths
	req.OpenapiDoc.Paths = openapi3.Paths{}

	updatedPlugin := &entity.PluginInfo{
		ID:         req.PluginID,
		ServerURL:  ptr.Of(req.OpenapiDoc.Servers[0].URL),
		Manifest:   req.Manifest,
		OpenapiDoc: req.OpenapiDoc,
	}
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

	// plugin 表只存储 root 信息，需要还原
	req.OpenapiDoc.Paths = paths

	return nil
}

func (p *pluginRepoImpl) CreateDraftPluginWithCode(ctx context.Context, req *CreateDraftPluginWithCodeRequest) (resp *CreateDraftPluginWithCodeResponse, err error) {
	doc := req.OpenapiDoc
	mf := req.Manifest

	err = doc.Validate(ctx)
	if err != nil {
		return nil, fmt.Errorf("openapi doc validates failed, err=%v", err)
	}
	err = mf.Validate()
	if err != nil {
		return nil, fmt.Errorf("plugin manifest validated failed, err=%v", err)
	}

	plugin := &entity.PluginInfo{
		PluginType:  req.PluginType,
		SpaceID:     req.SpaceID,
		DeveloperID: req.DeveloperID,
		ProjectID:   req.ProjectID,
		//IconURI:     ptr.Of(mf.LogoURL),
		ServerURL:  ptr.Of(doc.Servers[0].URL),
		Manifest:   mf,
		OpenapiDoc: doc,
	}

	tools := make([]*entity.ToolInfo, 0, len(doc.Paths))
	for subURL, pathItem := range doc.Paths {
		for method, operation := range pathItem.Operations() {
			tools = append(tools, &entity.ToolInfo{
				ActivatedStatus: ptr.Of(consts.ActivateTool),
				DebugStatus:     ptr.Of(common.APIDebugStatus_DebugWaiting),
				SubURL:          ptr.Of(subURL),
				Method:          ptr.Of(method),
				Operation:       ptr.Of(entity.Openapi3Operation(*operation)),
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

	pluginID, err := p.pluginDraftDAO.CreateWithTX(ctx, tx, plugin)
	if err != nil {
		return nil, err
	}

	plugin.ID = pluginID

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
		Plugin: plugin,
		Tools:  tools,
	}, nil
}
