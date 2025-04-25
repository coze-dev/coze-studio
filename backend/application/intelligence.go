package application

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/intelligence"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	"code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var IntelligenceSVC = &Intelligence{}

type Intelligence struct{}

func (i *Intelligence) GetDraftIntelligenceList(ctx context.Context, req *intelligence.GetDraftIntelligenceListRequest) (
	resp *intelligence.GetDraftIntelligenceListResponse, err error) {

	userID := getUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	searchResp, err := searchDomainSVC.SearchApps(ctx, searchRequestTo2Do(ptr.From(userID), req))
	if err != nil {
		return nil, err
	}

	_ = searchResp

	return nil, nil
}

func (i *Intelligence) GetDraftIntelligenceInfo(ctx context.Context, req intelligence.GetDraftIntelligenceInfoRequest) (
	resp *intelligence.GetDraftIntelligenceInfoResponse, err error) {
	return nil, nil
}

func (i *Intelligence) GetUserRecentlyEditIntelligence(ctx context.Context, req intelligence.GetUserRecentlyEditIntelligenceRequest) (
	resp *intelligence.GetUserRecentlyEditIntelligenceResponse, err error) {
	return nil, nil
}

func (i *Intelligence) PublishIntelligenceList(ctx context.Context, req intelligence.PublishIntelligenceListRequest) (
	resp *intelligence.PublishIntelligenceListResponse, err error) {
	return nil, nil
}

func (i *Intelligence) GetProjectPublishSummary(ctx context.Context, req intelligence.GetProjectPublishSummaryRequest) (
	resp *intelligence.GetProjectPublishSummaryResponse, err error) {
	return nil, nil
}

func searchRequestTo2Do(userID int64, req *intelligence.GetDraftIntelligenceListRequest) *entity.SearchRequest {
	searchReq := &entity.SearchRequest{
		SpaceID:     req.GetSpaceID(),
		OwnerID:     0,
		IsPublished: false, // 因为是获取草稿列表，所以设置为false
		Limit:       int(req.GetSize()),
		Cursor:      req.GetCursorID(),
		OrderBy:     req.GetOrderBy(),
		Order:       common.OrderByType_Desc,
		AppTypes:    req.GetTypes(),
		Status:      req.GetStatus(),
	}

	if req.GetSearchScope() == intelligence.SearchScope_CreateByMe {
		searchReq.OwnerID = userID
	}

	return searchReq
}
