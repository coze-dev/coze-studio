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

package search

import (
	"context"
	"fmt"
	"sync"
	"time"

	search2 "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/search"
	"github.com/coze-dev/coze-studio/backend/api/model/flow/marketplace/marketplace_common"
	"github.com/coze-dev/coze-studio/backend/api/model/flow/marketplace/product_common"
	"github.com/coze-dev/coze-studio/backend/api/model/flow/marketplace/product_public_api"
	"github.com/coze-dev/coze-studio/backend/api/model/intelligence"
	"github.com/coze-dev/coze-studio/backend/api/model/intelligence/common"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	searchEntity "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/taskgroup"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
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
		return nil, errorx.New(errno.ErrSearchPermissionCode, errorx.KV("msg", "session is required"))
	}

	do := searchRequestTo2Do(*userID, req)

	searchResp, err := s.DomainSVC.SearchProjects(ctx, do)
	if err != nil {
		return nil, err
	}

	if len(searchResp.Data) == 0 {
		return &intelligence.GetDraftIntelligenceListResponse{
			Data: &intelligence.DraftIntelligenceListData{
				Intelligences: make([]*intelligence.IntelligenceData, 0),
				Total:         0,
				HasMore:       false,
				NextCursorID:  "",
			},
		}, nil
	}

	tasks := taskgroup.NewUninterruptibleTaskGroup(ctx, len(searchResp.Data))
	lock := sync.Mutex{}
	intelligenceDataList := make([]*intelligence.IntelligenceData, len(searchResp.Data))

	logs.CtxDebugf(ctx, "[GetDraftIntelligenceList] searchResp.Data: %v", conv.DebugJsonToStr(searchResp.Data))
	if len(searchResp.Data) > 1 {
		for idx := range searchResp.Data[1:] {
			index := idx + 1
			data := searchResp.Data[index]
			tasks.Go(func() error {
				info, err := s.packIntelligenceData(ctx, data)
				if err != nil {
					logs.CtxErrorf(ctx, "[packIntelligenceData] failed id %v, type %d , name %s, err: %v", data.ID, data.Type, data.GetName(), err)
					return err
				}

				lock.Lock()
				defer lock.Unlock()
				intelligenceDataList[index] = info
				return nil
			})
		}
	}
	if len(searchResp.Data) != 0 {
		info, err := s.packIntelligenceData(ctx, searchResp.Data[0])
		if err != nil {
			logs.CtxErrorf(ctx, "[packIntelligenceData] failed id %v, type %d , name %s, err: %v", searchResp.Data[0].ID, searchResp.Data[0].Type, searchResp.Data[0].GetName(), err)
			return nil, err
		}
		lock.Lock()
		intelligenceDataList[0] = info
		lock.Unlock()
	}
	err = tasks.Wait()
	if err != nil {
		return nil, err
	}
	filterDataList := make([]*intelligence.IntelligenceData, 0)
	for _, data := range intelligenceDataList {
		if data != nil {
			filterDataList = append(filterDataList, data)
		}
	}

	return &intelligence.GetDraftIntelligenceListResponse{
		Code: 0,
		Data: &intelligence.DraftIntelligenceListData{
			Intelligences: filterDataList,
			Total:         int32(len(filterDataList)),
			HasMore:       searchResp.HasMore,
			NextCursorID:  searchResp.NextCursor,
		},
	}, nil
}

func (s *SearchApplicationService) PublicFavoriteProduct(ctx context.Context, req *product_public_api.FavoriteProductRequest) (*product_public_api.FavoriteProductResponse, error) {
	isFav := !req.GetIsCancel()
	entityID := req.GetEntityID()
	typ := req.GetEntityType()

	switch req.GetEntityType() {
	case product_common.ProductEntityType_Bot, product_common.ProductEntityType_Project:
		err := s.favoriteProject(ctx, entityID, typ, isFav)
		if err != nil {
			return nil, err
		}
	default:
		return nil, errorx.New(errno.ErrSearchInvalidParamCode, errorx.KV("msg", fmt.Sprintf("invalid entity type '%d'", req.GetEntityType())))
	}

	return &product_public_api.FavoriteProductResponse{
		IsFirstFavorite: ptr.Of(false),
	}, nil
}

func (s *SearchApplicationService) favoriteProject(ctx context.Context, projectID int64, typ product_common.ProductEntityType, isFav bool) error {
	var entityType common.IntelligenceType
	if typ == product_common.ProductEntityType_Bot {
		entityType = common.IntelligenceType_Bot
	} else {
		entityType = common.IntelligenceType_Project
	}
	err := s.ProjectEventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Updated,
		Project: &searchEntity.ProjectDocument{
			ID:        projectID,
			IsFav:     ptr.Of(ternary.IFElse(isFav, 1, 0)),
			FavTimeMS: ptr.Of(time.Now().UnixMilli()),
			Type:      entityType,
		},
	})
	if err != nil {
		return err
	}

	return nil
}

func (s *SearchApplicationService) PublicGetUserFavoriteList(ctx context.Context, req *product_public_api.GetUserFavoriteListV2Request) (resp *product_public_api.GetUserFavoriteListV2Response, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrSearchPermissionCode, errorx.KV("msg", "session required"))
	}

	var data *product_public_api.GetUserFavoriteListDataV2
	switch req.GetEntityType() {
	case product_common.ProductEntityType_Project, product_common.ProductEntityType_Bot, product_common.ProductEntityType_Common:
		data, err = s.searchFavProjects(ctx, *userID, req)
	default:
		return nil, errorx.New(errno.ErrSearchInvalidParamCode, errorx.KV("msg", fmt.Sprintf("invalid entity type '%d'", req.GetEntityType())))
	}
	if err != nil {
		return nil, err
	}

	resp = &product_public_api.GetUserFavoriteListV2Response{
		Data: data,
	}

	return resp, nil
}

func (s *SearchApplicationService) searchFavProjects(ctx context.Context, userID int64, req *product_public_api.GetUserFavoriteListV2Request) (*product_public_api.GetUserFavoriteListDataV2, error) {
	var types []common.IntelligenceType
	if req.GetEntityType() == product_common.ProductEntityType_Common {
		types = []common.IntelligenceType{common.IntelligenceType_Bot, common.IntelligenceType_Project}
	} else if req.GetEntityType() == product_common.ProductEntityType_Bot {
		types = []common.IntelligenceType{common.IntelligenceType_Bot}
	} else {
		types = []common.IntelligenceType{common.IntelligenceType_Project}
	}

	res, err := SearchSVC.DomainSVC.SearchProjects(ctx, &searchEntity.SearchProjectsRequest{
		OwnerID:        userID,
		Types:          types,
		IsFav:          true,
		OrderFiledName: search2.FieldOfFavTime,
		OrderAsc:       false,
		Limit:          req.PageSize,
		Cursor:         req.GetCursorID(),
	})
	if err != nil {
		return nil, err
	}

	if len(res.Data) == 0 {
		return &product_public_api.GetUserFavoriteListDataV2{
			FavoriteEntities: []*product_common.FavoriteEntity{},
			CursorID:         res.NextCursor,
			HasMore:          res.HasMore,
		}, nil
	}

	favEntities := make([]*product_common.FavoriteEntity, 0, len(res.Data))
	for _, r := range res.Data {
		favEntity, err := s.projectResourceToProductInfo(ctx, userID, r)
		if err != nil {
			logs.CtxErrorf(ctx, "[pluginResourceToProductInfo] failed to get project info, id=%v, type=%d, err=%v",
				r.ID, r.Type, err)
			continue
		}
		favEntities = append(favEntities, favEntity)
	}

	data := &product_public_api.GetUserFavoriteListDataV2{
		FavoriteEntities: favEntities,
		CursorID:         res.NextCursor,
		HasMore:          res.HasMore,
	}

	return data, nil
}

func (s *SearchApplicationService) projectResourceToProductInfo(ctx context.Context, userID int64, doc *searchEntity.ProjectDocument) (favEntity *product_common.FavoriteEntity, err error) {
	typ := func() product_common.ProductEntityType {
		if doc.Type == common.IntelligenceType_Bot {
			return product_common.ProductEntityType_Bot
		}
		return product_common.ProductEntityType_Project
	}()

	packer, err := NewPackProject(userID, doc.ID, doc.Type, s)
	if err != nil {
		return nil, err
	}

	pi, err := packer.GetProjectInfo(ctx)
	if err != nil {
		return nil, err
	}

	ui := packer.GetUserInfo(ctx, userID)

	var userInfo *product_common.UserInfo
	if ui != nil {
		userInfo = &product_common.UserInfo{
			UserID:     ui.UserID,
			UserName:   ui.UserUniqueName,
			Name:       ui.Nickname,
			AvatarURL:  ui.AvatarURL,
			FollowType: ptr.Of(marketplace_common.FollowType_Unknown),
		}
	}

	e := &product_common.FavoriteEntity{
		EntityID:           doc.ID,
		EntityType:         typ,
		Name:               doc.GetName(),
		IconURL:            pi.iconURI,
		Description:        pi.desc,
		SpaceID:            doc.GetSpaceID(),
		HasSpacePermission: true,
		FavoriteAt:         doc.GetFavTime(),
		UserInfo:           userInfo,
	}

	return e, nil
}

func (s *SearchApplicationService) GetUserRecentlyEditIntelligence(ctx context.Context, req intelligence.GetUserRecentlyEditIntelligenceRequest) (
	resp *intelligence.GetUserRecentlyEditIntelligenceResponse, err error,
) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrSearchPermissionCode, errorx.KV("msg", "session required"))
	}

	res, err := SearchSVC.DomainSVC.SearchProjects(ctx, &searchEntity.SearchProjectsRequest{
		OwnerID:        *userID,
		Types:          req.Types,
		IsRecentlyOpen: true,
		OrderFiledName: search2.FieldOfRecentlyOpenTime,
		OrderAsc:       false,
		Limit:          req.Size,
	})
	if err != nil {
		return nil, err
	}

	intelligenceDataList := make([]*intelligence.IntelligenceData, 0, len(res.Data))
	for idx := range res.Data {
		data := res.Data[idx]
		info, err := s.packIntelligenceData(ctx, data)
		if err != nil {
			logs.CtxErrorf(ctx, "[packIntelligenceData] failed id %v, type %d, name %s, err: %v", data.ID, data.Type, data.GetName(), err)
			continue
		}
		intelligenceDataList = append(intelligenceDataList, info)
	}

	resp = &intelligence.GetUserRecentlyEditIntelligenceResponse{
		Data: &intelligence.GetUserRecentlyEditIntelligenceData{
			IntelligenceInfoList: intelligenceDataList,
		},
	}

	return resp, nil
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

	publishedInf := packer.GetPublishedInfo(ctx)
	if publishedInf != nil {
		intelligenceData.PublishInfo = packer.GetPublishedInfo(ctx)
	} else {
		intelligenceData.PublishInfo = &intelligence.IntelligencePublishInfo{
			HasPublished: false,
		}
	}

	intelligenceData.OwnerInfo = packer.GetUserInfo(ctx, doc.GetOwnerID())
	intelligenceData.LatestAuditInfo = &common.AuditInfo{}
	intelligenceData.FavoriteInfo = s.buildProjectFavoriteInfo(doc)
	intelligenceData.OtherInfo = s.buildProjectOtherInfo(doc)

	return intelligenceData, nil
}

func (s *SearchApplicationService) buildProjectFavoriteInfo(doc *searchEntity.ProjectDocument) *intelligence.FavoriteInfo {
	isFav := doc.GetIsFav()
	favTime := doc.GetFavTime()

	return &intelligence.FavoriteInfo{
		IsFav:   isFav,
		FavTime: conv.Int64ToStr(favTime / 1000),
	}
}

func (s *SearchApplicationService) buildProjectOtherInfo(doc *searchEntity.ProjectDocument) *intelligence.OtherInfo {
	otherInfo := &intelligence.OtherInfo{
		BotMode:          intelligence.BotMode_SingleMode,
		RecentlyOpenTime: conv.Int64ToStr(doc.GetRecentlyOpenTime() / 1000),
	}
	if doc.Type == common.IntelligenceType_Project {
		otherInfo.BotMode = intelligence.BotMode_WorkflowMode
	}

	return otherInfo
}

func searchRequestTo2Do(userID int64, req *intelligence.GetDraftIntelligenceListRequest) *searchEntity.SearchProjectsRequest {
	orderBy := func() string {
		switch req.GetOrderBy() {
		case intelligence.OrderBy_PublishTime:
			return search2.FieldOfPublishTime
		case intelligence.OrderBy_UpdateTime:
			return search2.FieldOfUpdateTime
		case intelligence.OrderBy_CreateTime:
			return search2.FieldOfCreateTime
		default:
			return search2.FieldOfUpdateTime
		}
	}()

	searchReq := &searchEntity.SearchProjectsRequest{
		SpaceID:        req.GetSpaceID(),
		Name:           req.GetName(),
		OwnerID:        0,
		Limit:          req.GetSize(),
		Cursor:         req.GetCursorID(),
		OrderFiledName: orderBy,
		OrderAsc:       false,
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
