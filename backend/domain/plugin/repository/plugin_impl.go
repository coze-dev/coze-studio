package repository

import (
	"context"
	"fmt"
	"runtime/debug"

	"github.com/getkin/kin-openapi/openapi3"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	pluginConf "code.byted.org/flow/opencoze/backend/conf/plugin"
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

func (p *pluginRepoImpl) CreateDraftPlugin(ctx context.Context, plugin *entity.PluginInfo) (pluginID int64, err error) {
	pluginID, err = p.pluginDraftDAO.Create(ctx, plugin)
	if err != nil {
		return 0, err
	}

	return pluginID, nil
}

func (p *pluginRepoImpl) GetDraftPlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, exist bool, err error) {
	return p.pluginDraftDAO.Get(ctx, pluginID)
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

func (p *pluginRepoImpl) GetAPPAllDraftPlugins(ctx context.Context, appID int64) (plugins []*entity.PluginInfo, err error) {
	return p.pluginDraftDAO.GetAPPAllPlugins(ctx, appID, nil)
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

	filteredTools := make([]*entity.ToolInfo, 0, len(draftTools))
	for _, tool := range draftTools {
		if tool.GetActivatedStatus() == plugin.DeactivateTool {
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

		filteredTools := make([]*entity.ToolInfo, 0, len(draftTools))
		for _, tool := range draftTools {
			if tool.GetActivatedStatus() == plugin.DeactivateTool {
				continue
			}

			if tool.DebugStatus == nil ||
				*tool.DebugStatus == common.APIDebugStatus_DebugWaiting {
				return fmt.Errorf("tool '%d' in plugin '%d' does not pass debugging", tool.ID, draftPlugin.ID)
			}

			tool.Version = draftPlugin.Version

			filteredTools = append(filteredTools, tool)
		}

		if len(filteredTools) == 0 {
			continue
		}

		pluginTools[draftPlugin.ID] = filteredTools
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

	// plugin 表只存储 root 信息，更新后需要还原
	paths := req.OpenapiDoc.Paths
	req.OpenapiDoc.Paths = openapi3.Paths{}

	updatedPlugin := entity.NewPluginInfo(&plugin.PluginInfo{
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

	// plugin 表只存储 root 信息，需要还原
	req.OpenapiDoc.Paths = paths

	return nil
}

func (p *pluginRepoImpl) CreateDraftPluginWithCode(ctx context.Context, req *CreateDraftPluginWithCodeRequest) (resp *CreateDraftPluginWithCodeResponse, err error) {
	doc := req.OpenapiDoc
	mf := req.Manifest

	pluginType, _ := plugin.ToThriftPluginType(mf.API.Type)

	pl := entity.NewPluginInfo(&plugin.PluginInfo{
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
		for method, operation := range pathItem.Operations() {
			tools = append(tools, &entity.ToolInfo{
				ActivatedStatus: ptr.Of(plugin.ActivateTool),
				DebugStatus:     ptr.Of(common.APIDebugStatus_DebugWaiting),
				SubURL:          ptr.Of(subURL),
				Method:          ptr.Of(method),
				Operation:       ptr.Of(plugin.Openapi3Operation(*operation)),
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
