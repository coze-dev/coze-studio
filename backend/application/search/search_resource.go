package search

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/resource"
	"code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/search/entity"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	user "code.byted.org/flow/opencoze/backend/domain/user/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var ResourceSVC = &ResourceApplicationService{}

type ResourceApplicationService struct {
	DomainSVC     search.Search
	userDomainSVC user.User
	tos           storage.Storage
}

var defaultAction = []*common.ResourceAction{
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
}

var iconURI = map[common.ResType]string{
	common.ResType_Plugin:    consts.DefaultPluginIcon,
	common.ResType_Workflow:  consts.DefaultWorkflowIcon,
	common.ResType_Knowledge: consts.DefaultDatasetIcon,
	common.ResType_Prompt:    consts.DefaultPromptIcon,
	common.ResType_Database:  consts.DefaultDatabaseIcon,
	// ResType_UI:        consts.DefaultWorkflowIcon,
	// ResType_Voice:     consts.DefaultPluginIcon,
	// ResType_Imageflow: consts.DefaultPluginIcon,
}

func (r *ResourceApplicationService) LibraryResourceList(ctx context.Context, req *resource.LibraryResourceListRequest) (resp *resource.LibraryResourceListResponse, err error) {
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

	resources := make([]*common.ResourceInfo, 0, len(searchResp.Data))
	for idx := range searchResp.Data {
		v := searchResp.Data[idx]

		ri := &common.ResourceInfo{
			ResID:         ptr.Of(v.ResID),
			Name:          v.Name,
			Icon:          &v.IconURL,
			Desc:          v.Desc,
			SpaceID:       v.SpaceID,
			CreatorID:     v.OwnerID,
			ResType:       ptr.Of(v.ResType),
			ResSubType:    v.ResSubType,
			PublishStatus: v.PublishStatus,
			EditTime:      ptr.Of(v.UpdateTime / 1000),
			Actions:       defaultAction,
		}

		if v.BizStatus != nil {
			ri.BizResStatus = ptr.Of(int32(*v.BizStatus))
		}

		if ri.GetIcon() == "" {
			if iconURL, ok := iconURI[ri.GetResType()]; ok {
				uri, err := r.tos.GetObjectUrl(ctx, iconURL)
				if err == nil {
					ri.Icon = ptr.Of(uri)
				}
			}
		}

		u, err := r.userDomainSVC.GetUserInfo(ctx, v.GetOwnerID())
		if err == nil {
			ri.CreatorName = ptr.Of(u.Name)
			ri.CreatorAvatar = ptr.Of(u.IconURL)
		} else {
			logs.CtxWarnf(ctx, "[LibraryResourceList] GetUserInfo failed, uid: %d, resID: %d, Name : %s, err: %v",
				v.GetOwnerID(), v.ResID, ri.GetName(), err)
		}

		if ri.GetCreatorAvatar() == "" {
			url, _ := r.tos.GetObjectUrl(ctx, consts.DefaultUserIcon)
			if url != "" {
				ri.CreatorAvatar = ptr.Of(url)
			}
		}

		resources = append(resources, ri)
	}

	return &resource.LibraryResourceListResponse{
		Code:         0,
		ResourceList: resources,
		Cursor:       ptr.Of(searchResp.NextCursor),
		HasMore:      searchResp.HasMore,
	}, nil
}
