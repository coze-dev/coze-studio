package service

import (
	"context"
	"fmt"
	"time"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	resourceCommon "code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossplugin"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossworkflow"
	"code.byted.org/flow/opencoze/backend/domain/app/consts"
	"code.byted.org/flow/opencoze/backend/domain/app/entity"
	"code.byted.org/flow/opencoze/backend/domain/app/repository"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	commonConsts "code.byted.org/flow/opencoze/backend/types/consts"
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
		logs.CtxErrorf(ctx, "publish by connectors failed, err=%v", err)
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
				PublishStatus: consts.PublishStatusOfPackFailed,
			})
			if updateErr != nil {
				logs.CtxErrorf(ctx, "update publish status failed, err=%v", updateErr)
			}
		}
	}()

	failedResources, err := a.packResources(ctx, req.APPID, req.Version)
	if err != nil {
		return false, err
	}
	if len(failedResources) > 0 {
		logs.CtxWarnf(ctx, "pack resources failed, len=%d", len(failedResources))
		processErr := a.packResourcesFailedPostProcess(ctx, recordID, failedResources)
		if processErr != nil {
			logs.CtxErrorf(ctx, "pack resources failed post process failed, err=%v", processErr)
		}

		return false, nil
	}

	for cid := range req.ConnectorPublishConfigs {
		switch cid {
		case commonConsts.APIConnectorID:
			updateSuccessErr := a.APPRepo.UpdateConnectorPublishStatus(ctx, recordID, consts.ConnectorPublishStatusOfSuccess)
			if updateSuccessErr == nil {
				continue
			}
			updateFailedErr := a.APPRepo.UpdateAPPPublishStatus(ctx, &repository.UpdateAPPPublishStatusRequest{
				RecordID:      recordID,
				PublishStatus: consts.PublishStatusOfPackFailed,
			})
			if updateFailedErr != nil {
				logs.CtxWarnf(ctx, "failed to update connector '%d' publish status to failed, err=%v", cid, updateFailedErr)
			}
			logs.CtxErrorf(ctx, "failed to update connector '%d' publish status to success, err=%v", cid, updateSuccessErr)

		default:
			continue
		}
	}

	err = a.APPRepo.UpdateAPPPublishStatus(ctx, &repository.UpdateAPPPublishStatusRequest{
		RecordID:      recordID,
		PublishStatus: consts.PublishStatusOfPublishDone,
	})
	if err != nil {
		return false, err
	}

	return true, nil
}

func (a *appServiceImpl) checkCanPublishAPP(ctx context.Context, req *PublishAPPRequest) (err error) {
	exist, err := a.APPRepo.CheckAPPVersionExist(ctx, &repository.GetVersionAPPRequest{
		APPID:   req.APPID,
		Version: req.Version,
	})
	if err != nil {
		return err
	}
	if exist {
		return fmt.Errorf("version '%s' already exist", req.Version)
	}

	return nil
}

func (a *appServiceImpl) createPublishVersion(ctx context.Context, req *PublishAPPRequest) (recordID int64, err error) {
	draftAPP, exist, err := a.APPRepo.GetDraftAPP(ctx, &repository.GetDraftAPPRequest{
		APPID: req.APPID,
	})
	if err != nil {
		return 0, err
	}
	if !exist {
		return 0, fmt.Errorf("draft app '%d' not exist", req.APPID)
	}

	draftAPP.PublishedAtMS = ptr.Of(time.Now().UnixMilli())
	draftAPP.Version = &req.Version
	draftAPP.VersionDesc = &req.VersionDesc

	publishRecords := make([]*entity.ConnectorPublishRecord, 0, len(req.ConnectorPublishConfigs))

	for cid, conf := range req.ConnectorPublishConfigs {
		publishRecords = append(publishRecords, &entity.ConnectorPublishRecord{
			ConnectorID:   cid,
			PublishStatus: consts.ConnectorPublishStatusOfDefault,
			PublishConfig: conf,
		})
		draftAPP.ConnectorIDs = append(draftAPP.ConnectorIDs, cid)
	}

	recordID, err = a.APPRepo.CreateAPPPublishRecord(ctx, &repository.CreateAPPPublishRecordRequest{
		PublishRecord: &entity.PublishRecord{
			APP:                     draftAPP,
			ConnectorPublishRecords: publishRecords,
		},
	})
	if err != nil {
		return 0, err
	}

	return recordID, nil
}

func (a *appServiceImpl) packResources(ctx context.Context, appID int64, version string) (failedResources []*entity.PackResourceFailedInfo, err error) {
	failedPlugins, allDraftPlugins, err := a.packPlugins(ctx, appID, version)
	if err != nil {
		return nil, err
	}

	workflowFailedInfoList, err := a.packWorkflows(ctx, appID, version,
		slices.Transform(allDraftPlugins, func(a *plugin.PluginInfo) int64 {
			return a.ID
		}))

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
		return nil, nil, err
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

func (a *appServiceImpl) packWorkflows(ctx context.Context, appID int64, version string, allDraftPluginIDs []int64) (workflowFailedInfoList []*entity.PackResourceFailedInfo, err error) {
	issues, err := crossworkflow.DefaultSVC().ReleaseApplicationWorkflows(ctx, appID, &crossworkflow.ReleaseWorkflowConfig{
		Version:   version,
		PluginIDs: allDraftPluginIDs,
	})
	if err != nil {
		return nil, err
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
	updateErr := a.APPRepo.UpdateAPPPublishStatus(ctx, &repository.UpdateAPPPublishStatusRequest{
		RecordID:               recordID,
		PublishStatus:          consts.PublishStatusOfPackFailed,
		PublishRecordExtraInfo: publishFailedInfo,
	})
	if updateErr != nil {
		return updateErr
	}

	return nil
}
