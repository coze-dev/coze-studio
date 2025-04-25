package application

import (
	"context"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/intelligence"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	agentEntity "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
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

	ownerIDs := slices.Transform(searchResp.Data, func(a *searchEntity.AppDocument) int64 {
		return a.OwnerID
	})

	ownerIDs = slices.Unique(ownerIDs)

	// TODO: 查询用户信息

	idsOfAppType := slices.GroupBy(searchResp.Data, func(a *searchEntity.AppDocument) (common.IntelligenceType, int64) {
		return a.AppType, a.ID
	})

	var agentInfos []*agentEntity.SingleAgent
	if ids := idsOfAppType[common.IntelligenceType_Bot]; len(ids) > 0 {
		agentInfos, err = singleAgentDomainSVC.MGetSingleAgentDraft(ctx, ids)
		if err != nil {
			return nil, err
		}
	}

	// TODO: 查询 Project Info

	itlList, err := constructIntelligenceList(ctx, searchResp, agentInfos)
	if err != nil {
		return nil, err
	}

	return &intelligence.GetDraftIntelligenceListResponse{
		Code: 0,
		Data: itlList,
	}, nil
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

func constructIntelligenceList(ctx context.Context, searchResp *searchEntity.SearchResponse, agentInfos []*agentEntity.SingleAgent) (
	*intelligence.DraftIntelligenceListData, error) {

	agents := slices.ToMap(agentInfos, func(a *agentEntity.SingleAgent) (int64, *agentEntity.SingleAgent) {
		return a.ID, a
	})

	itlList := make([]*intelligence.IntelligenceData, 0, len(searchResp.Data))
	for _, a := range searchResp.Data {
		var desc, iconURI string
		switch a.AppType {
		case common.IntelligenceType_Bot:
			ag, ok := agents[a.ID]
			if !ok {
				return nil, errorx.New(errno.ErrResourceNotFound, errorx.KV("type", a.AppType.String()),
					errorx.KV("id", strconv.FormatInt(a.ID, 10)))
			}

			desc = ag.Desc
			iconURI = ag.IconURI
		}

		itl := &intelligence.IntelligenceData{
			Type: a.AppType,
			BasicInfo: &common.IntelligenceBasicInfo{
				ID:          a.ID,
				Name:        a.Name,
				Description: desc,
				IconURI:     iconURI,
				IconURL:     "",
				SpaceID:     a.SpaceID,
				OwnerID:     a.OwnerID,
				Status:      a.Status,
				CreateTime:  a.CreateTime,
				UpdateTime:  a.UpdateTime,
				PublishTime: a.PublishTime,
			},
			PublishInfo:    nil,
			PermissionInfo: nil,
			OwnerInfo:      nil,
			FavoriteInfo:   nil,
			OtherInfo:      nil,
		}

		itlList = append(itlList, itl)
	}

	return &intelligence.DraftIntelligenceListData{
		Intelligences: itlList,
		Total:         int32(len(searchResp.Data)),
		HasMore:       searchResp.HasMore,
		NextCursorID:  searchResp.NextCursor,
	}, nil
}
func searchRequestTo2Do(userID int64, req *intelligence.GetDraftIntelligenceListRequest) *searchEntity.SearchRequest {
	searchReq := &searchEntity.SearchRequest{
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
