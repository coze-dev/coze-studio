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

package service

import (
	"context"
	"time"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/plugin"
	resourceCommon "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	crossplugin "github.com/coze-dev/coze-studio/backend/crossdomain/contract/plugin"
	crossworkflow "github.com/coze-dev/coze-studio/backend/crossdomain/contract/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/app/entity"
	"github.com/coze-dev/coze-studio/backend/domain/app/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	commonConsts "github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (a *appServiceImpl) PublishAPP(ctx context.Context, req *PublishAPPRequest) (resp *PublishAPPResponse, err error) {
	err = a.checkCanPublishAPP(ctx, req)
	if err != nil {
		return nil, err
	}

	recordID, err := a.createPublishVersion(ctx, req)
	if err != nil {
		return nil, err
	}

	success, err := a.publishByConnectors(ctx, recordID, req)
	if err != nil {
		logs.CtxErrorf(ctx, "publish by connectors failed, recordID=%d, err=%v", recordID, err)
	}

	resp = &PublishAPPResponse{
		Success:         success,
		PublishRecordID: recordID,
	}

	return resp, nil
}

func (a *appServiceImpl) publishByConnectors(ctx context.Context, recordID int64, req *PublishAPPRequest) (success bool, err error) {
	defer func() {
		if err != nil {
			updateErr := a.APPRepo.UpdateAPPPublishStatus(ctx, &repository.UpdateAPPPublishStatusRequest{
				RecordID:      recordID,
				PublishStatus: entity.PublishStatusOfPackFailed,
			})
			if updateErr != nil {
				logs.CtxErrorf(ctx, "UpdateAPPPublishStatus failed, recordID=%d, err=%v", recordID, updateErr)
			}
		}
	}()

	connectorIDs := make([]int64, 0, len(req.ConnectorPublishConfigs))
	for cid := range req.ConnectorPublishConfigs {
		connectorIDs = append(connectorIDs, cid)
	}
	failedResources, err := a.packResources(ctx, req.APPID, req.Version, connectorIDs)
	if err != nil {
		return false, err
	}
	if len(failedResources) > 0 {
		logs.CtxWarnf(ctx, "packResources failed, recordID=%d, len=%d", recordID, len(failedResources))

		processErr := a.packResourcesFailedPostProcess(ctx, recordID, failedResources)
		if processErr != nil {
			logs.CtxErrorf(ctx, "packResourcesFailedPostProcess failed, recordID=%d, err=%v", recordID, processErr)
		}

		return false, nil
	}

	for cid := range req.ConnectorPublishConfigs {
		switch cid {
		case commonConsts.APIConnectorID:
			updateSuccessErr := a.APPRepo.UpdateConnectorPublishStatus(ctx, recordID, entity.ConnectorPublishStatusOfSuccess)
			if updateSuccessErr == nil {
				continue
			}

			logs.CtxErrorf(ctx, "failed to update connector '%d' publish status to success, err=%v", cid, updateSuccessErr)

			updateFailedErr := a.APPRepo.UpdateAPPPublishStatus(ctx, &repository.UpdateAPPPublishStatusRequest{
				RecordID:      recordID,
				PublishStatus: entity.PublishStatusOfPackFailed,
			})

			if updateFailedErr != nil {
				logs.CtxWarnf(ctx, "failed to update connector '%d' publish status to failed, err=%v", cid, updateFailedErr)
			}

		default:
			continue
		}
	}

	err = a.APPRepo.UpdateAPPPublishStatus(ctx, &repository.UpdateAPPPublishStatusRequest{
		RecordID:      recordID,
		PublishStatus: entity.PublishStatusOfPublishDone,
	})
	if err != nil {
		return false, errorx.Wrapf(err, "UpdateAPPPublishStatus failed, recordID=%d", recordID)
	}

	return true, nil
}

func (a *appServiceImpl) checkCanPublishAPP(ctx context.Context, req *PublishAPPRequest) (err error) {
	exist, err := a.APPRepo.CheckAPPVersionExist(ctx, req.APPID, req.Version)
	if err != nil {
		return errorx.Wrapf(err, "CheckAPPVersionExist failed, appID=%d, version=%s", req.APPID, req.Version)
	}
	if exist {
		return errorx.New(errno.ErrAppRecordNotFound)
	}

	return nil
}

func (a *appServiceImpl) createPublishVersion(ctx context.Context, req *PublishAPPRequest) (recordID int64, err error) {
	draftAPP, exist, err := a.APPRepo.GetDraftAPP(ctx, req.APPID)
	if err != nil {
		return 0, errorx.Wrapf(err, "GetDraftAPP failed, appID=%d", req.APPID)
	}
	if !exist {
		return 0, errorx.New(errno.ErrAppRecordNotFound)
	}

	draftAPP.PublishedAtMS = ptr.Of(time.Now().UnixMilli())
	draftAPP.Version = &req.Version
	draftAPP.VersionDesc = &req.VersionDesc

	publishRecords := make([]*entity.ConnectorPublishRecord, 0, len(req.ConnectorPublishConfigs))

	for cid, conf := range req.ConnectorPublishConfigs {
		publishRecords = append(publishRecords, &entity.ConnectorPublishRecord{
			ConnectorID:   cid,
			PublishStatus: entity.ConnectorPublishStatusOfDefault,
			PublishConfig: conf,
		})
		draftAPP.ConnectorIDs = append(draftAPP.ConnectorIDs, cid)
	}

	recordID, err = a.APPRepo.CreateAPPPublishRecord(ctx, &entity.PublishRecord{
		APP:                     draftAPP,
		ConnectorPublishRecords: publishRecords,
	})
	if err != nil {
		return 0, errorx.Wrapf(err, "CreateAPPPublishRecord failed, appID=%d", req.APPID)
	}

	return recordID, nil
}

func (a *appServiceImpl) packResources(ctx context.Context, appID int64, version string, connectorIDs []int64) (failedResources []*entity.PackResourceFailedInfo, err error) {
	failedPlugins, allDraftPlugins, err := a.packPlugins(ctx, appID, version)
	if err != nil {
		return nil, err
	}

	workflowFailedInfoList, err := a.packWorkflows(ctx, appID, version,
		slices.Transform(allDraftPlugins, func(a *plugin.PluginInfo) int64 {
			return a.ID
		}), connectorIDs)
	if err != nil {
		return nil, err
	}

	length := len(failedPlugins) + len(workflowFailedInfoList)
	if length == 0 {
		return nil, nil
	}

	failedResources = append(failedResources, failedPlugins...)
	failedResources = append(failedResources, workflowFailedInfoList...)

	return failedResources, nil
}

func (a *appServiceImpl) packPlugins(ctx context.Context, appID int64, version string) (failedInfo []*entity.PackResourceFailedInfo, allDraftPlugins []*plugin.PluginInfo, err error) {
	res, err := crossplugin.DefaultSVC().PublishAPPPlugins(ctx, &plugin.PublishAPPPluginsRequest{
		APPID:   appID,
		Version: version,
	})
	if err != nil {
		return nil, nil, errorx.Wrapf(err, "PublishAPPPlugins failed, appID=%d, version=%s", appID, version)
	}

	failedInfo = make([]*entity.PackResourceFailedInfo, 0, len(res.FailedPlugins))
	for _, p := range res.FailedPlugins {
		failedInfo = append(failedInfo, &entity.PackResourceFailedInfo{
			ResID:   p.ID,
			ResType: resourceCommon.ResType_Plugin,
			ResName: p.GetName(),
		})
	}

	return failedInfo, res.AllDraftPlugins, nil

}

func (a *appServiceImpl) packWorkflows(ctx context.Context, appID int64, version string, allDraftPluginIDs []int64, connectorIDs []int64) (workflowFailedInfoList []*entity.PackResourceFailedInfo, err error) {
	issues, err := crossworkflow.DefaultSVC().ReleaseApplicationWorkflows(ctx, appID, &crossworkflow.ReleaseWorkflowConfig{
		Version:      version,
		PluginIDs:    allDraftPluginIDs,
		ConnectorIDs: connectorIDs,
	})
	if err != nil {
		return nil, errorx.Wrapf(err, "ReleaseApplicationWorkflows failed, appID=%d, version=%s", appID, version)
	}

	if len(issues) == 0 {
		return workflowFailedInfoList, nil
	}

	workflowFailedInfoList = make([]*entity.PackResourceFailedInfo, 0, len(issues))
	for _, issue := range issues {
		workflowFailedInfoList = append(workflowFailedInfoList, &entity.PackResourceFailedInfo{
			ResID:   issue.WorkflowID,
			ResType: resourceCommon.ResType_Workflow,
			ResName: issue.WorkflowName,
		})
	}

	return workflowFailedInfoList, nil
}

func (a *appServiceImpl) packResourcesFailedPostProcess(ctx context.Context, recordID int64, packFailedInfo []*entity.PackResourceFailedInfo) (err error) {
	publishFailedInfo := &entity.PublishRecordExtraInfo{
		PackFailedInfo: packFailedInfo,
	}
	err = a.APPRepo.UpdateAPPPublishStatus(ctx, &repository.UpdateAPPPublishStatusRequest{
		RecordID:               recordID,
		PublishStatus:          entity.PublishStatusOfPackFailed,
		PublishRecordExtraInfo: publishFailedInfo,
	})
	if err != nil {
		return errorx.Wrapf(err, "UpdateAPPPublishStatus failed, recordID=%d", recordID)
	}

	return nil
}
