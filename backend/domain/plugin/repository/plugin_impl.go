package repository

import (
	"context"
	"fmt"
	"runtime/debug"

	"github.com/bytedance/sonic"
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
	return p.pluginDraftDAO.Create(ctx, plugin)
}

func (p *pluginRepoImpl) GetDraftPlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, exist bool, err error) {
	return p.pluginDraftDAO.Get(ctx, pluginID)
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
	_, ok := pluginConf.GetOfficialPlugin(pluginID)
	if ok {
		return true, nil
	}
	return p.pluginDAO.CheckPluginExist(ctx, pluginID)
}

func (p *pluginRepoImpl) GetOnlinePlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, exist bool, err error) {
	pi, ok := pluginConf.GetOfficialPlugin(pluginID)
	if ok {
		return pi.Info, true, nil
	}
	return p.pluginDAO.Get(ctx, pluginID)
}

func (p *pluginRepoImpl) GetOnlineCustomPlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, exist bool, err error) {
	return p.pluginDAO.Get(ctx, pluginID)
}

func (p *pluginRepoImpl) MGetOnlinePlugins(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error) {
	plugins = make([]*entity.PluginInfo, 0, len(pluginIDs))

	customPluginIDs := make([]int64, 0, len(pluginIDs))
	for _, id := range pluginIDs {
		pi, ok := pluginConf.GetOfficialPlugin(id)
		if ok {
			plugins = append(plugins, pi.Info)
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

func (p *pluginRepoImpl) GetVersionPlugin(ctx context.Context, pluginID int64, version string) (plugin *entity.PluginInfo, exist bool, err error) {
	opl, exist := pluginConf.GetOfficialPlugin(pluginID)
	if exist {
		return opl.Info, true, nil
	}
	return p.pluginVersionDAO.Get(ctx, pluginID, version)
}

func (p *pluginRepoImpl) MGetVersionPlugins(ctx context.Context, vPlugins []entity.VersionPlugin) (plugin []*entity.PluginInfo, err error) {
	plugins := make([]*entity.PluginInfo, 0, len(vPlugins))

	filtered := make([]entity.VersionPlugin, 0, len(vPlugins))
	for _, v := range vPlugins {
		opl, exist := pluginConf.GetOfficialPlugin(v.PluginID)
		if !exist {
			filtered = append(filtered, v)
			continue
		}
		plugins = append(plugins, opl.Info)
	}

	customPlugins, err := p.pluginVersionDAO.MGet(ctx, filtered)
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
	pl, ok := pluginConf.GetOfficialPlugin(pluginID)
	if !ok {
		return p.toolDAO.GetAll(ctx, pluginID)
	}

	tls := pl.GetPluginAllTools()

	tools = make([]*entity.ToolInfo, 0, len(tls))
	for _, tl := range tls {
		tools = append(tools, tl.Info)
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

func (p *pluginRepoImpl) UpdateDraftPluginWithDoc(ctx context.Context, req *UpdatePluginDraftWithDoc) (err error) {
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

func (p *pluginRepoImpl) CopyOfficialPlugin(ctx context.Context, req *CopyOfficialPluginRequest) (newPluginID int64, err error) {
	pluginID := req.PluginID
	toSpaceID := req.ToSpaceID

	plugin, exist := pluginConf.GetOfficialPlugin(pluginID)
	if !exist {
		return 0, fmt.Errorf("official plugin '%d' not found", pluginID)
	}

	pl := plugin.Info
	b, err := sonic.Marshal(pl.Manifest)
	if err != nil {
		return 0, err
	}

	newManifest := &entity.PluginManifest{}
	err = sonic.Unmarshal(b, newManifest)
	if err != nil {
		return 0, err
	}
	newManifest.Auth = &entity.AuthV2{
		Type:    pl.Manifest.Auth.Type,
		SubType: pl.Manifest.Auth.SubType,
	}

	switch pl.Manifest.Auth.Type {
	case consts.AuthTypeOfOAuth:
		payload, err := sonic.MarshalString(&entity.AuthOfOAuth{})
		if err != nil {
			return 0, err
		}
		newManifest.Auth.Payload = &payload
	case consts.AuthTypeOfService:
		switch pl.Manifest.Auth.SubType {
		case consts.AuthSubTypeOfOIDC:
			payload, err := sonic.MarshalString(&entity.AuthOfOIDC{})
			if err != nil {
				return 0, err
			}
			newManifest.Auth.Payload = &payload
		case consts.AuthSubTypeOfToken:
			payload, err := sonic.MarshalString(&entity.AuthOfToken{})
			if err != nil {
				return 0, err
			}
			newManifest.Auth.Payload = &payload
		}
	}

	newPlugin := &entity.PluginInfo{
		SpaceID:    toSpaceID,
		IconURI:    pl.IconURI,
		ServerURL:  pl.ServerURL,
		Manifest:   newManifest,
		OpenapiDoc: pl.OpenapiDoc,
	}

	tx := p.query.Begin()
	if tx.Error != nil {
		return 0, tx.Error
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

	newPluginID, err = p.pluginDraftDAO.CreateWithTX(ctx, tx, newPlugin)
	if err != nil {
		return 0, err
	}

	tools := plugin.GetPluginAllTools()
	newTools := make([]*entity.ToolInfo, 0, len(tools))

	for _, tool := range tools {
		tl := tool.Info
		newTool := &entity.ToolInfo{
			PluginID:        newPluginID,
			SubURL:          tl.SubURL,
			Method:          tl.Method,
			ActivatedStatus: ptr.Of(consts.ActivateTool),
			DebugStatus:     ptr.Of(common.APIDebugStatus_DebugPassed),
			Operation:       tl.Operation,
		}
		newTools = append(newTools, newTool)
	}

	_, err = p.toolDraftDAO.BatchCreateWithTX(ctx, tx, newTools)
	if err != nil {
		return 0, err
	}

	err = tx.Commit()
	if err != nil {
		return 0, err
	}

	return newPluginID, nil
}
