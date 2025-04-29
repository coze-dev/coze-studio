package application

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/resource"
	"code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var ResourceSVC = &Resource{}

type Resource struct{}

func (r *Resource) LibraryResourceList(ctx context.Context, req *resource.LibraryResourceListRequest) (
	resp *resource.LibraryResourceListResponse, err error) {

	userID := getUIDFromCtx(ctx)
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

	searchResp, err := searchDomainSVC.SearchResources(ctx, searchReq)
	if err != nil {
		return nil, err
	}

	// TODO: 查询 User Info

	resources := make([]*common.ResourceInfo, 0, len(searchResp.Data))
	for _, r := range searchResp.Data {
		resources = append(resources, &common.ResourceInfo{
			ResID:         ptr.Of(r.ResID),
			Name:          ptr.Of(r.Name),
			Desc:          nil,
			SpaceID:       ptr.Of(r.SpaceID),
			CreatorID:     ptr.Of(r.OwnerID),
			ResType:       ptr.Of(r.ResType),
			ResSubType:    ptr.Of(int32(r.ResSubType)),
			PublishStatus: ptr.Of(r.PublishStatus),
			BizResStatus:  ptr.Of(int32(r.BizStatus)),
			EditTime:      ptr.Of(r.UpdateTime),
		})
	}

	return &resource.LibraryResourceListResponse{
		Code:         0,
		ResourceList: resources,
		Cursor:       ptr.Of(searchResp.NextCursor),
		HasMore:      searchResp.HasMore,
	}, nil
}
