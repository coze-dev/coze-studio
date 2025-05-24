package search

import (
	"context"
	"sync"

	"code.byted.org/flow/opencoze/backend/api/model/intelligence"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/pkg/taskgroup"
	"code.byted.org/flow/opencoze/backend/types/consts"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var projectType2iconURI = map[common.IntelligenceType]string{
	common.IntelligenceType_Bot:     consts.DefaultAgentIcon,
	common.IntelligenceType_Project: consts.DefaultAppIcon,
}

func (s *SearchApplicationService) GetDraftIntelligenceList(ctx context.Context, req *intelligence.GetDraftIntelligenceListRequest) (
	resp *intelligence.GetDraftIntelligenceListResponse, err error,
) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	do := searchRequestTo2Do(*userID, req)

	searchResp, err := s.DomainSVC.SearchApps(ctx, do)
	if err != nil {
		return nil, err
	}

	tasks := taskgroup.NewUninterruptibleTaskGroup(ctx, len(searchResp.Data))
	lock := sync.Mutex{}
	intelligenceDataList := make([]*intelligence.IntelligenceData, 0, len(searchResp.Data))

	logs.CtxDebugf(ctx, "[GetDraftIntelligenceList] searchResp.Data: %v", conv.DebugJsonToStr(searchResp.Data))

	for idx := range searchResp.Data {
		data := searchResp.Data[idx]

		tasks.Go(func() error {
			info, err := s.packIntelligenceData(ctx, data)
			if err != nil {
				logs.CtxErrorf(ctx, "[packIntelligenceData] failed id %v, type %d , name %s, err: %v", data.ID, data.Type, data.GetName(), err)

				return err
			}

			lock.Lock()
			defer lock.Unlock()
			intelligenceDataList = append(intelligenceDataList, info)

			return nil
		})

		s.packIntelligenceData(ctx, data)
	}

	_ = tasks.Wait()

	return &intelligence.GetDraftIntelligenceListResponse{
		Code: 0,
		Data: &intelligence.DraftIntelligenceListData{
			Intelligences: intelligenceDataList,
			Total:         int32(len(searchResp.Data)),
			HasMore:       searchResp.HasMore,
			NextCursorID:  searchResp.NextCursor,
		},
	}, nil
}

func (s *SearchApplicationService) GetDraftIntelligenceInfo(ctx context.Context, req intelligence.GetDraftIntelligenceInfoRequest) (
	resp *intelligence.GetDraftIntelligenceInfoResponse, err error,
) {
	return nil, nil
}

func (s *SearchApplicationService) GetUserRecentlyEditIntelligence(ctx context.Context, req intelligence.GetUserRecentlyEditIntelligenceRequest) (
	resp *intelligence.GetUserRecentlyEditIntelligenceResponse, err error,
) {
	return nil, nil
}

func (s *SearchApplicationService) PublishIntelligenceList(ctx context.Context, req intelligence.PublishIntelligenceListRequest) (
	resp *intelligence.PublishIntelligenceListResponse, err error,
) {
	return nil, nil
}

func (s *SearchApplicationService) GetProjectPublishSummary(ctx context.Context, req intelligence.GetProjectPublishSummaryRequest) (
	resp *intelligence.GetProjectPublishSummaryResponse, err error,
) {
	return nil, nil
}

func (s *SearchApplicationService) packIntelligenceData(ctx context.Context, doc *searchEntity.ProjectDocument) (*intelligence.IntelligenceData, error) {
	intelligenceData := &intelligence.IntelligenceData{
		Type: doc.Type,
		BasicInfo: &common.IntelligenceBasicInfo{
			ID:          doc.ID,
			Name:        doc.GetName(),
			SpaceID:     doc.GetSpaceID(),
			OwnerID:     doc.GetOwnerID(),
			Status:      doc.Status,
			CreateTime:  doc.GetCreateTime() / 1000,
			UpdateTime:  doc.GetUpdateTime() / 1000,
			PublishTime: doc.GetPublishTime() / 1000,
		},
	}

	packer, err := NewPackProject(doc.ID, doc.Type, s.ServiceComponents)
	if err != nil {
		return nil, err
	}

	projInfo, err := packer.GetProjectInfo(ctx)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetProjectInfo failed, id: %v, type: %v", doc.ID, doc.Type)
	}

	intelligenceData.BasicInfo.Description = projInfo.desc
	intelligenceData.BasicInfo.IconURI = projInfo.iconURI
	intelligenceData.BasicInfo.IconURL = s.getProjectIconURL(ctx, projInfo.iconURI, doc.Type)

	intelligenceData.PermissionInfo = packer.GetPermissionInfo()
	intelligenceData.PublishInfo = packer.GetPublishedInfo(ctx)
	intelligenceData.OwnerInfo = packer.GetUserInfo(ctx, doc.GetOwnerID())
	intelligenceData.LatestAuditInfo = &common.AuditInfo{}
	intelligenceData.FavoriteInfo = &intelligence.FavoriteInfo{} // TODO(@fanlv): 收藏数据完成以后再补充
	intelligenceData.OtherInfo = &intelligence.OtherInfo{
		BotMode: intelligence.BotMode_SingleMode,
	}

	return intelligenceData, nil
}

func searchRequestTo2Do(userID int64, req *intelligence.GetDraftIntelligenceListRequest) *searchEntity.SearchAppsRequest {
	searchReq := &searchEntity.SearchAppsRequest{
		SpaceID: req.GetSpaceID(),
		OwnerID: 0,
		Limit:   int(req.GetSize()),
		Cursor:  req.GetCursorID(),
		OrderBy: req.GetOrderBy(),
		Order:   common.OrderByType_Desc,
		Types:   req.GetTypes(),
		Status:  req.GetStatus(),
	}

	if req.GetSearchScope() == intelligence.SearchScope_CreateByMe {
		searchReq.OwnerID = userID
	}

	return searchReq
}

func (r *SearchApplicationService) getProjectDefaultIconURL(ctx context.Context, tp common.IntelligenceType) string {
	iconURL, ok := projectType2iconURI[tp]
	if !ok {
		logs.CtxWarnf(ctx, "[getProjectDefaultIconURL] don't have type: %d  default icon", tp)

		return ""
	}

	return r.getURL(ctx, iconURL)
}

func (r *SearchApplicationService) getProjectIconURL(ctx context.Context, uri string, tp common.IntelligenceType) string {
	if uri == "" {
		return r.getProjectDefaultIconURL(ctx, tp)
	}

	url := r.getURL(ctx, uri)
	if url != "" {
		return url
	}

	return r.getProjectDefaultIconURL(ctx, tp)
}
