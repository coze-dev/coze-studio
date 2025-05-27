package app

import (
	"context"
	"fmt"
	"strconv"

	intelligenceAPI "code.byted.org/flow/opencoze/backend/api/model/intelligence"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	projectAPI "code.byted.org/flow/opencoze/backend/api/model/project"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/app/repository"
	"code.byted.org/flow/opencoze/backend/domain/app/service"
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	user "code.byted.org/flow/opencoze/backend/domain/user/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var APPApplicationSVC = &APPApplicationService{}

type APPApplicationService struct {
	DomainSVC service.AppService
	appRepo   repository.AppRepository

	oss      storage.Storage
	eventbus search.ProjectEventBus

	userSVC user.User
}

func (a *APPApplicationService) DraftProjectCreate(ctx context.Context, req *projectAPI.DraftProjectCreateRequest) (resp *projectAPI.DraftProjectCreateResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	res, err := a.DomainSVC.CreateDraftAPP(ctx, &service.CreateDraftAPPRequest{
		SpaceID: req.SpaceID,
		OwnerID: *userID,
		IconURI: req.IconURI,
		Name:    req.Name,
		Desc:    req.Description,
	})
	if err != nil {
		return nil, err
	}

	err = a.eventbus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Created,
		Project: &searchEntity.ProjectDocument{
			Status:  common.IntelligenceStatus_Using,
			Type:    common.IntelligenceType_Project,
			ID:      res.APPID,
			SpaceID: &req.SpaceID,
			OwnerID: userID,
			Name:    &req.Name,
		},
	})
	if err != nil {
		return nil, err
	}

	resp = &projectAPI.DraftProjectCreateResponse{
		Data: &projectAPI.DraftProjectCreateData{
			ProjectID: res.APPID,
		},
	}

	return resp, nil
}

func (a *APPApplicationService) GetDraftIntelligenceInfo(ctx context.Context, req *intelligenceAPI.GetDraftIntelligenceInfoRequest) (resp *intelligenceAPI.GetDraftIntelligenceInfoResponse, err error) {
	res, err := a.DomainSVC.GetDraftAPP(ctx, &service.GetDraftAPPRequest{
		APPID: req.IntelligenceID,
	})
	if err != nil {
		return nil, err
	}

	iconURL, err := a.oss.GetObjectUrl(ctx, res.APP.GetIconURI())
	if err != nil {
		logs.CtxWarnf(ctx, "get icon url failed with '%s', err=%v", res.APP.GetIconURI(), err)
	}

	basicInfo := &common.IntelligenceBasicInfo{
		ID:          res.APP.ID,
		SpaceID:     res.APP.SpaceID,
		OwnerID:     res.APP.OwnerID,
		Name:        res.APP.GetName(),
		Description: res.APP.GetDesc(),
		IconURI:     res.APP.GetIconURI(),
		IconURL:     iconURL,
		CreateTime:  res.APP.CreatedAtMS / 1000,
		UpdateTime:  res.APP.UpdatedAtMS / 1000,
		PublishTime: res.APP.GetPublishedAtMS() / 1000,
		Status:      common.IntelligenceStatus_Using, // TODO(@maronghong): 完善状态
	}

	publishInfo := &intelligenceAPI.IntelligencePublishInfo{
		HasPublished: res.APP.HasPublished(),
		PublishTime:  strconv.FormatInt(res.APP.GetPublishedAtMS()/1000, 10),
	}

	ui, err := a.userSVC.GetUserInfo(ctx, res.APP.OwnerID)
	if err != nil {
		return nil, err
	}
	ownerInfo := &common.User{
		UserID:         ui.UserID,
		Nickname:       ui.Name,
		AvatarURL:      ui.IconURL,
		UserUniqueName: ui.UniqueName,
	}

	err = a.eventbus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Updated,
		Project: &searchEntity.ProjectDocument{
			ID:             res.APP.ID,
			Type:           common.IntelligenceType_Project,
			IsRecentlyOpen: ptr.Of(1),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish project event failed, id=%d, err=%v", res.APP.ID, err)
	}

	resp = &intelligenceAPI.GetDraftIntelligenceInfoResponse{
		Data: &intelligenceAPI.GetDraftIntelligenceInfoData{
			IntelligenceType: common.IntelligenceType_Project,
			BasicInfo:        basicInfo,
			PublishInfo:      publishInfo,
			OwnerInfo:        ownerInfo,
		},
	}

	return resp, nil
}

func (a *APPApplicationService) DraftProjectDelete(ctx context.Context, req *projectAPI.DraftProjectDeleteRequest) (resp *projectAPI.DraftProjectDeleteResponse, err error) {
	err = a.DomainSVC.DeleteDraftAPP(ctx, &service.DeleteDraftAPPRequest{
		APPID: req.ProjectID,
	})
	if err != nil {
		return nil, err
	}

	err = a.eventbus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Deleted,
		Project: &searchEntity.ProjectDocument{
			ID: req.ProjectID,
		},
	})

	resp = &projectAPI.DraftProjectDeleteResponse{}

	return resp, nil
}

func (a *APPApplicationService) DraftProjectUpdate(ctx context.Context, req *projectAPI.DraftProjectUpdateRequest) (resp *projectAPI.DraftProjectUpdateResponse, err error) {
	err = a.DomainSVC.UpdateDraftAPP(ctx, &service.UpdateDraftAPPRequest{
		APPID:   req.ProjectID,
		Name:    req.Name,
		Desc:    req.Description,
		IconURI: req.IconURI,
	})
	if err != nil {
		return nil, err
	}

	err = a.eventbus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Updated,
		Project: &searchEntity.ProjectDocument{
			ID:   req.ProjectID,
			Type: common.IntelligenceType_Project,
			Name: req.Name,
		},
	})
	if err != nil {
		return nil, fmt.Errorf("publish project event failed, id=%d, err=%v", req.ProjectID, err)
	}

	resp = &projectAPI.DraftProjectUpdateResponse{}

	return resp, nil
}
