package search

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/resource"
	"code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/search/entity"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var ResourceSVC = &ResourceApplicationService{}

type ResourceApplicationService struct {
	*ServiceComponents
	DomainSVC search.Search
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

		// TODO: 并发 pack
		ri, err := r.packResource(ctx, v)
		if err != nil {
			logs.CtxErrorf(ctx, "[LibraryResourceList] packResource failed, err: %v", err)
			continue
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

func (r *ResourceApplicationService) getDefaultIconURL(ctx context.Context, tp common.ResType) *string {
	iconURL, ok := iconURI[tp]
	if !ok {
		logs.CtxWarnf(ctx, "[getDefaultIconURL] don't have type: %d  default icon", tp)

		return nil
	}

	return r.getDefaultIconURLWitURI(ctx, iconURL)
}

func (r *ResourceApplicationService) getDefaultIconURLWitURI(ctx context.Context, uri string) *string {
	url, err := r.TOS.GetObjectUrl(ctx, uri)
	if err != nil {
		logs.CtxWarnf(ctx, "[getDefaultIconURLWitURI] GetObjectUrl failed, uri: %s, err: %v", uri, err)
	}

	return &url
}

func (r *ResourceApplicationService) getIconURL(ctx context.Context, uri *string, tp common.ResType) *string {
	if uri == nil || *uri == "" {
		return r.getDefaultIconURL(ctx, tp)
	}

	url, err := r.TOS.GetObjectUrl(ctx, *uri)
	if err != nil {
		logs.CtxWarnf(ctx, "[getIconURL] GetObjectUrl failed, uri: %s, err: %v", url, err)
	}

	if url != "" {
		return &url
	}

	return r.getDefaultIconURL(ctx, tp)
}

func (r *ResourceApplicationService) packUserInfo(ctx context.Context, ri *common.ResourceInfo, ownerID int64) *common.ResourceInfo {
	u, err := r.UserDomainSVC.GetUserInfo(ctx, ownerID)
	if err != nil {
		logs.CtxWarnf(ctx, "[LibraryResourceList] GetUserInfo failed, uid: %d, resID: %d, Name : %s, err: %v",
			ownerID, ri.ResID, ri.GetName(), err)
	} else {
		ri.CreatorName = ptr.Of(u.Name)
		ri.CreatorAvatar = ptr.Of(u.IconURL)
	}

	if ri.GetCreatorAvatar() == "" {
		ri.CreatorAvatar = r.getDefaultIconURLWitURI(ctx, consts.DefaultUserIcon)
	}

	return ri
}

func (r *ResourceApplicationService) packResource(ctx context.Context, v *entity.ResourceDocument) (*common.ResourceInfo, error) {
	ri := &common.ResourceInfo{
		ResID:         ptr.Of(v.ResID),
		ResType:       ptr.Of(v.ResType),
		Name:          v.Name,
		SpaceID:       v.SpaceID,
		CreatorID:     v.OwnerID,
		ResSubType:    v.ResSubType,
		PublishStatus: v.PublishStatus,
		EditTime:      ptr.Of(v.GetUpdateTime() / 1000),
	}

	if v.BizStatus != nil {
		ri.BizResStatus = ptr.Of(int32(*v.BizStatus))
	}

	packer := NewPackResource(v.ResID, v.ResType, r)

	data, err := packer.GetDataInfo(ctx)
	if err != nil {
		logs.CtxErrorf(ctx, "[packResource] GetDataInfo failed, err: %v", err)
		return nil, err
	}

	ri.Icon = r.getIconURL(ctx, data.iconURI, v.ResType)
	ri = r.packUserInfo(ctx, ri, v.GetOwnerID())
	ri.Desc = data.desc
	ri.Actions = packer.GetActions(ctx)

	return ri, nil
}
