package search

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/resource"
	"code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/search/entity"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	"code.byted.org/flow/opencoze/backend/domain/user"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var ResourceSVC = &ResourceApplicationService{}

type ResourceApplicationService struct {
	DomainSVC     search.Search
	userDomainSVC user.User
}

func (r *ResourceApplicationService) LibraryResourceList(ctx context.Context, req *resource.LibraryResourceListRequest) (
	resp *resource.LibraryResourceListResponse, err error,
) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	searchReq := &entity.SearchResourcesRequest{
		SpaceID:             req.GetSpaceID(),
		OwnerID:             0,
		Name:                req.GetName(),
		Limit:               req.GetSize(),
		Cursor:              req.GetCursor(),
		ResTypeFilter:       req.GetResTypeFilter(),
		PublishStatusFilter: req.GetPublishStatusFilter(),
		SearchKeys:          req.GetSearchKeys(),
	}

	// 设置用户过滤
	if req.IsSetUserFilter() && req.GetUserFilter() > 0 {
		searchReq.OwnerID = ptr.From(userID)
	}

	searchResp, err := r.DomainSVC.SearchResources(ctx, searchReq)
	if err != nil {
		return nil, err
	}

	// TODO: 查询 User Info

	resources := make([]*common.ResourceInfo, 0, len(searchResp.Data))
	for _, v := range searchResp.Data {
		ri := &common.ResourceInfo{
			ResID:         ptr.Of(v.ResID),
			Name:          ptr.Of(v.Name),
			Icon:          ptr.Of(v.Icon),
			Desc:          ptr.Of(v.Desc),
			SpaceID:       ptr.Of(v.SpaceID),
			CreatorID:     ptr.Of(v.OwnerID),
			ResType:       ptr.Of(v.ResType),
			ResSubType:    ptr.Of(int32(v.ResSubType)),
			PublishStatus: ptr.Of(v.PublishStatus),
			BizResStatus:  ptr.Of(int32(v.BizStatus)),
			EditTime:      ptr.Of(v.UpdateTime / 1000),
			Actions: []*common.ResourceAction{
				{
					Key:    common.ActionKey_Edit,
					Enable: true,
				},
				{
					Key:    common.ActionKey_Delete,
					Enable: true,
				},
				{
					Key:    common.ActionKey_CrossSpaceCopy,
					Enable: true,
				},
			},
		}

		u, err := r.userDomainSVC.GetUserInfo(ctx, v.OwnerID)
		if err != nil {
			return nil, err
		}
		ri.CreatorName = ptr.Of(u.Name)
		ri.CreatorAvatar = ptr.Of(u.IconURL)

		resources = append(resources, ri)
	}

	return &resource.LibraryResourceListResponse{
		Code:         0,
		ResourceList: resources,
		Cursor:       ptr.Of(searchResp.NextCursor),
		HasMore:      searchResp.HasMore,
	}, nil
}
