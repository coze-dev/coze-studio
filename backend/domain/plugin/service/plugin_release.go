package service

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"golang.org/x/mod/semver"
	"gorm.io/gorm"

	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/repository"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func (p *pluginServiceImpl) GetPluginNextVersion(ctx context.Context, pluginID int64) (version string, err error) {
	const defaultVersion = "v1.0.0"

	pl, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, pluginID)
	if err != nil {
		return "", err
	}
	if !exist {
		return defaultVersion, nil
	}

	parts := strings.Split(pl.GetVersion(), ".") // Remove the 'v' and split
	if len(parts) < 3 {
		logs.CtxErrorf(ctx, "invalid version format '%s'", pl.GetVersion())
		return defaultVersion, nil
	}

	patch, err := strconv.ParseInt(parts[2], 10, 64)
	if err != nil {
		logs.CtxErrorf(ctx, "invalid version format '%s'", pl.GetVersion())
		return defaultVersion, nil
	}

	parts[2] = strconv.FormatInt(patch+1, 10)
	nextVersion := strings.Join(parts, ".")

	return nextVersion, nil
}

func (p *pluginServiceImpl) PublishPlugin(ctx context.Context, req *PublishPluginRequest) (err error) {
	draftPlugin, exist, err := p.pluginRepo.GetDraftPlugin(ctx, req.PluginID)
	if err != nil {
		return err
	}
	if !exist {
		return fmt.Errorf("draft plugin draft '%d' not found", req.PluginID)
	}

	onlinePlugin, exist, err := p.pluginRepo.GetOnlinePlugin(ctx, req.PluginID)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	} else if exist && onlinePlugin.Version != nil {
		if semver.Compare(req.Version, *onlinePlugin.Version) != 1 {
			return fmt.Errorf("version '%s' of plugin '%d' is invalid", *onlinePlugin.Version, req.PluginID)
		}
	}

	draftPlugin.Version = &req.Version
	draftPlugin.VersionDesc = &req.VersionDesc

	err = p.pluginRepo.PublishPlugin(ctx, draftPlugin)
	if err != nil {
		return err
	}

	return nil
}

func (p *pluginServiceImpl) PublishAPPPlugins(ctx context.Context, req *PublishAPPPluginsRequest) (resp *PublishAPPPluginsResponse, err error) {
	resp = &PublishAPPPluginsResponse{}

	draftPlugins, err := p.pluginRepo.GetAPPAllDraftPlugins(ctx, req.APPID)
	if err != nil {
		return nil, err
	}

	failedPluginIDs, err := p.checkCanPublishAPPPlugins(ctx, req.Version, draftPlugins)
	if err != nil {
		return nil, err
	}

	for _, draftPlugin := range draftPlugins {
		draftPlugin.Version = &req.Version
		resp.AllDraftPlugins = append(resp.AllDraftPlugins, draftPlugin.PluginInfo)
	}

	if len(failedPluginIDs) > 0 {
		draftPluginMap := slices.ToMap(draftPlugins, func(plugin *entity.PluginInfo) (int64, *entity.PluginInfo) {
			return plugin.ID, plugin
		})

		failedPlugins := make([]*entity.PluginInfo, 0, len(failedPluginIDs))
		for _, failedPluginID := range failedPluginIDs {
			failedPlugins = append(failedPlugins, draftPluginMap[failedPluginID])
		}
		for _, failedPlugin := range failedPlugins {
			resp.FailedPlugins = append(resp.FailedPlugins, failedPlugin.PluginInfo)
		}

		return resp, nil
	}

	err = p.pluginRepo.PublishPlugins(ctx, draftPlugins)
	if err != nil {
		return nil, err
	}

	return resp, nil
}

func (p *pluginServiceImpl) checkCanPublishAPPPlugins(ctx context.Context, version string, draftPlugins []*entity.PluginInfo) (failedPluginIDs []int64, err error) {
	failedPluginIDs = make([]int64, 0, len(draftPlugins))

	draftPluginIDs := slices.Transform(draftPlugins, func(plugin *entity.PluginInfo) int64 {
		return plugin.ID
	})

	// 1. check version
	onlinePlugins, err := p.pluginRepo.MGetOnlinePlugins(ctx, draftPluginIDs,
		repository.WithPluginID(),
		repository.WithPluginVersion())
	if err != nil {
		return nil, err
	}

	if len(onlinePlugins) > 0 {
		for _, onlinePlugin := range onlinePlugins {
			if onlinePlugin.Version == nil {
				continue
			}
			if semver.Compare(version, *onlinePlugin.Version) != 1 {
				failedPluginIDs = append(failedPluginIDs, onlinePlugin.ID)
			}
		}
		if len(failedPluginIDs) > 0 {
			logs.CtxErrorf(ctx, "invalid version of plugins '%v'", failedPluginIDs)
			return failedPluginIDs, nil
		}
	}

	// 2. check debug status
	for _, draftPlugin := range draftPlugins {
		res, err := p.toolRepo.GetPluginAllDraftTools(ctx, draftPlugin.ID,
			repository.WithToolID(),
			repository.WithToolDebugStatus(),
			repository.WithToolActivatedStatus(),
		)
		if err != nil {
			return nil, err
		}

		if len(res) == 0 {
			logs.CtxErrorf(ctx, "no tools in plugin '%d'", draftPlugin.ID)
			failedPluginIDs = append(failedPluginIDs, draftPlugin.ID)
			continue
		}

		for _, tool := range res {
			if tool.GetDebugStatus() != common.APIDebugStatus_DebugWaiting {
				continue
			}
			logs.CtxErrorf(ctx, "tool '%d' in plugin '%d' has not been debugged yet", tool.ID, draftPlugin.ID)
			failedPluginIDs = append(failedPluginIDs, draftPlugin.ID)
			break
		}
	}

	if len(failedPluginIDs) > 0 {
		return failedPluginIDs, nil
	}

	return failedPluginIDs, nil
}
