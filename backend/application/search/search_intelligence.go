package search

import (
	"context"
	"log"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/intelligence"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/application/singleagent"
	agentEntity "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var IntelligenceSVC = &Intelligence{}

type Intelligence struct {
	DomainSVC      search.Search
	singleAgentSVC singleagent.SingleAgent
	tosClient      storage.Storage
}

func (i *Intelligence) GetDraftIntelligenceList(ctx context.Context, req *intelligence.GetDraftIntelligenceListRequest) (
	resp *intelligence.GetDraftIntelligenceListResponse, err error,
) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	searchResp, err := i.DomainSVC.SearchApps(ctx, searchRequestTo2Do(ptr.From(userID), req))
	if err != nil {
		return nil, err
	}

	ownerIDs := slices.Transform(searchResp.Data, func(a *searchEntity.AppDocument) int64 {
		return a.OwnerID
	})

	ownerIDs = slices.Unique(ownerIDs)

	// TODO: 查询用户信息

	idsOfAppType := slices.GroupBy(searchResp.Data, func(a *searchEntity.AppDocument) (common.IntelligenceType, int64) {
		return a.Type, a.ID
	})

	var agentInfos []*agentEntity.SingleAgent
	if ids := idsOfAppType[common.IntelligenceType_Bot]; len(ids) > 0 {
		agentInfos, err = i.singleAgentSVC.MGetSingleAgentDraft(ctx, ids)
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
	resp *intelligence.GetDraftIntelligenceInfoResponse, err error,
) {
	return nil, nil
}

func (i *Intelligence) GetUserRecentlyEditIntelligence(ctx context.Context, req intelligence.GetUserRecentlyEditIntelligenceRequest) (
	resp *intelligence.GetUserRecentlyEditIntelligenceResponse, err error,
) {
	return nil, nil
}

func (i *Intelligence) PublishIntelligenceList(ctx context.Context, req intelligence.PublishIntelligenceListRequest) (
	resp *intelligence.PublishIntelligenceListResponse, err error,
) {
	return nil, nil
}

func (i *Intelligence) GetProjectPublishSummary(ctx context.Context, req intelligence.GetProjectPublishSummaryRequest) (
	resp *intelligence.GetProjectPublishSummaryResponse, err error,
) {
	return nil, nil
}

func constructIntelligenceList(ctx context.Context, searchResp *searchEntity.SearchAppsResponse, agentInfos []*agentEntity.SingleAgent) (
	*intelligence.DraftIntelligenceListData, error,
) {
	agents := slices.ToMap(agentInfos, func(a *agentEntity.SingleAgent) (int64, *agentEntity.SingleAgent) {
		return a.AgentID, a
	})

	itlList := make([]*intelligence.IntelligenceData, 0, len(searchResp.Data))
	for _, a := range searchResp.Data {
		var desc, iconURI string
		switch a.Type {
		case common.IntelligenceType_Bot:
			ag, ok := agents[a.ID]
			if !ok {
				return nil, errorx.New(errno.ErrResourceNotFound, errorx.KV("type", a.Type.String()),
					errorx.KV("id", strconv.FormatInt(a.ID, 10)))
			}

			desc = ag.Desc
			iconURI = ag.IconURI
		}

		itl := &intelligence.IntelligenceData{
			Type: a.Type,
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
			PublishInfo: &intelligence.IntelligencePublishInfo{
				HasPublished: false,
			},
			PermissionInfo: &intelligence.IntelligencePermissionInfo{
				InCollaboration: false,
				CanDelete:       true,
				CanView:         true,
			},
			OwnerInfo:    &common.User{},
			FavoriteInfo: &intelligence.FavoriteInfo{},
			OtherInfo:    &intelligence.OtherInfo{},
		}

		if iconURI != "" {
			iconURL, err := IntelligenceSVC.tosClient.GetObjectUrl(ctx, iconURI)
			if err != nil {
				log.Printf("[constructIntelligenceList] GetObjectURL failed, err: %v", err)
				return nil, err
			}
			itl.BasicInfo.IconURL = iconURL
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

func searchRequestTo2Do(userID int64, req *intelligence.GetDraftIntelligenceListRequest) *searchEntity.SearchAppsRequest {
	searchReq := &searchEntity.SearchAppsRequest{
		SpaceID:     req.GetSpaceID(),
		OwnerID:     0,
		IsPublished: false, // 因为是获取草稿列表，所以设置为false
		Limit:       int(req.GetSize()),
		Cursor:      req.GetCursorID(),
		OrderBy:     req.GetOrderBy(),
		Order:       common.OrderByType_Desc,
		Types:       req.GetTypes(),
		Status:      req.GetStatus(),
	}

	if req.GetSearchScope() == intelligence.SearchScope_CreateByMe {
		searchReq.OwnerID = userID
	}

	return searchReq
}
