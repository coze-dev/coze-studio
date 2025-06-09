package service

import (
	"context"
	"fmt"
	"sort"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	pluginConf "code.byted.org/flow/opencoze/backend/conf/plugin"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

func (p *pluginServiceImpl) GetOnlinePlugin(ctx context.Context, pluginID int64) (plugin *entity.PluginInfo, err error) {
	pl, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, pluginID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("online plugin '%d' not found", pluginID)
	}

	return pl, nil
}

func (p *pluginServiceImpl) MGetOnlinePlugins(ctx context.Context, pluginIDs []int64) (plugins []*entity.PluginInfo, err error) {
	plugins, err = p.pluginRepo.MGetOnlinePlugins(ctx, pluginIDs)
	if err != nil {
		return nil, err
	}

	res := make([]*model.PluginInfo, 0, len(plugins))
	for _, pl := range plugins {
		res = append(res, pl.PluginInfo)
	}

	return plugins, nil
}

func (p *pluginServiceImpl) GetOnlineTool(ctx context.Context, toolID int64) (tool *entity.ToolInfo, err error) {
	tool, exist, err := p.toolRepo.GetOnlineTool(ctx, toolID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, fmt.Errorf("online tool '%d' not found", toolID)
	}

	return tool, nil
}

func (p *pluginServiceImpl) MGetOnlineTools(ctx context.Context, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
	tools, err = p.toolRepo.MGetOnlineTools(ctx, toolIDs)
	if err != nil {
		return nil, err
	}

	return tools, nil
}

func (p *pluginServiceImpl) ListPluginProducts(ctx context.Context, req *ListPluginProductsRequest) (resp *ListPluginProductsResponse, err error) {
	plugins := slices.Transform(pluginConf.GetAllPluginProducts(), func(p *pluginConf.PluginInfo) *entity.PluginInfo {
		return entity.NewPluginInfo(p.Info)
	})
	sort.Slice(plugins, func(i, j int) bool {
		return plugins[i].GetRefProductID() < plugins[j].GetRefProductID()
	})

	return &ListPluginProductsResponse{
		Plugins: plugins,
		Total:   int64(len(plugins)),
	}, nil
}

func (p *pluginServiceImpl) GetPluginProductAllTools(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error) {
	res, err := p.toolRepo.GetPluginAllOnlineTools(ctx, pluginID)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (p *pluginServiceImpl) DeleteAPPAllPlugins(ctx context.Context, appID int64) (pluginIDs []int64, err error) {
	return p.pluginRepo.DeleteAPPAllPlugins(ctx, appID)
}

func (p *pluginServiceImpl) MGetVersionPlugins(ctx context.Context, req *MGetVersionPluginsRequest) (plugins []*entity.PluginInfo, err error) {
	plugins, err = p.pluginRepo.MGetVersionPlugins(ctx, req.VersionPlugins)
	if err != nil {
		return nil, err
	}

	return plugins, nil
}

func (p *pluginServiceImpl) MGetPluginLatestVersion(ctx context.Context, pluginIDs []int64) (resp *MGetPluginLatestVersionResponse, err error) {
	plugins, err := p.pluginRepo.MGetOnlinePlugins(ctx, pluginIDs,
		repository.WithPluginID(),
		repository.WithPluginVersion())
	if err != nil {
		return nil, err
	}

	versions := make(map[int64]string, len(plugins))
	for _, pl := range plugins {
		versions[pl.ID] = pl.GetVersion()
	}

	resp = &MGetPluginLatestVersionResponse{
		Versions: versions,
	}

	return resp, nil
}
