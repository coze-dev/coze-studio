package search

import (
	"context"
	"fmt"
	"sync"
	"time"

	"code.byted.org/flow/opencoze/backend/api/model/flow/marketplace/product_common"
	"code.byted.org/flow/opencoze/backend/api/model/flow/marketplace/product_public_api"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ternary"
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

	searchResp, err := s.DomainSVC.SearchProjects(ctx, do)
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

func (s *SearchApplicationService) PublicFavoriteProduct(ctx context.Context, req *product_public_api.FavoriteProductRequest) (*product_public_api.FavoriteProductResponse, error) {
	productEntityType2DomainName := map[product_common.ProductEntityType]common.IntelligenceType{
		product_common.ProductEntityType_Bot:     common.IntelligenceType_Bot,
		product_common.ProductEntityType_Project: common.IntelligenceType_Project,
	}

	intelligenceType, ok := productEntityType2DomainName[req.GetEntityType()]
	if !ok {
		return nil, errorx.New(errno.ErrInvalidParamCode, errorx.KV("msg", "invalid entity type"))
	}

	isFav := ternary.IFElse(req.GetIsCancel(), 0, 1)
	entityID := req.GetEntityID()

	err := s.ProjectEventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Updated,
		Project: &searchEntity.ProjectDocument{
			ID:    entityID,
			IsFav: &isFav,
			Type:  intelligenceType,
		},
	})
	if err != nil {
		return nil, err
	}

	uid := ctxutil.MustGetUIDFromCtx(ctx)
	favTimeMS := ternary.IFElse(isFav == 1, time.Now().UnixMilli(), 0)

	// do we need a project(resource&app) application or domain ?
	err = SearchSVC.FavRepo.Save(ctx, makeFavInfoKey(uid, intelligenceType, entityID), &favInfo{
		IsFav:     !req.GetIsCancel(),
		FavTimeMS: favTimeMS,
	})
	if err != nil {
		return nil, err
	}

	return &product_public_api.FavoriteProductResponse{
		Code:            0,
		IsFirstFavorite: ptr.Of(false),
	}, nil
}

func makeFavInfoKey(uid int64, entityType common.IntelligenceType, entityID int64) string {
	return fmt.Sprintf("%d:%d:%d", uid, entityType, entityID)
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

	uid := ctxutil.MustGetUIDFromCtx(ctx)

	packer, err := NewPackProject(uid, doc.ID, doc.Type, s)
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
	intelligenceData.FavoriteInfo = packer.GetFavoriteInfo(ctx)
	intelligenceData.OtherInfo = packer.GetOtherInfo(ctx)

	return intelligenceData, nil
}

func searchRequestTo2Do(userID int64, req *intelligence.GetDraftIntelligenceListRequest) *searchEntity.SearchProjectsRequest {
	searchReq := &searchEntity.SearchProjectsRequest{
		SpaceID:        req.GetSpaceID(),
		OwnerID:        0,
		Limit:          int(req.GetSize()),
		Cursor:         req.GetCursorID(),
		OrderBy:        req.GetOrderBy(),
		Order:          common.OrderByType_Desc,
		Types:          req.GetTypes(),
		Status:         req.GetStatus(),
		IsFav:          req.GetIsFav(),
		IsRecentlyOpen: req.GetRecentlyOpen(),
		IsPublished:    req.GetHasPublished(),
	}

	if req.GetSearchScope() == intelligence.SearchScope_CreateByMe {
		searchReq.OwnerID = userID
	}

	return searchReq
}

func (s *SearchApplicationService) getProjectDefaultIconURL(ctx context.Context, tp common.IntelligenceType) string {
	iconURL, ok := projectType2iconURI[tp]
	if !ok {
		logs.CtxWarnf(ctx, "[getProjectDefaultIconURL] don't have type: %d  default icon", tp)

		return ""
	}

	return s.getURL(ctx, iconURL)
}

func (s *SearchApplicationService) getProjectIconURL(ctx context.Context, uri string, tp common.IntelligenceType) string {
	if uri == "" {
		return s.getProjectDefaultIconURL(ctx, tp)
	}

	url := s.getURL(ctx, uri)
	if url != "" {
		return url
	}

	return s.getProjectDefaultIconURL(ctx, tp)
}
