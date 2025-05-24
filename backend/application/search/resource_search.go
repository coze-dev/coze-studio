package search

import (
	"context"
	"sync"

	"code.byted.org/flow/opencoze/backend/api/model/resource"
	"code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/search/entity"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/pkg/taskgroup"
	"code.byted.org/flow/opencoze/backend/types/consts"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var SearchSVC = &SearchApplicationService{}

type SearchApplicationService struct {
	*ServiceComponents
	DomainSVC search.Search
}

var resType2iconURI = map[common.ResType]string{
	common.ResType_Plugin:    consts.DefaultPluginIcon,
	common.ResType_Workflow:  consts.DefaultWorkflowIcon,
	common.ResType_Knowledge: consts.DefaultDatasetIcon,
	common.ResType_Prompt:    consts.DefaultPromptIcon,
	common.ResType_Database:  consts.DefaultDatabaseIcon,
	// ResType_UI:        consts.DefaultWorkflowIcon,
	// ResType_Voice:     consts.DefaultPluginIcon,
	// ResType_Imageflow: consts.DefaultPluginIcon,
}

func (r *SearchApplicationService) LibraryResourceList(ctx context.Context, req *resource.LibraryResourceListRequest) (resp *resource.LibraryResourceListResponse, err error) {
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

	lock := sync.Mutex{}
	tasks := taskgroup.NewUninterruptibleTaskGroup(ctx, 10)
	resources := make([]*common.ResourceInfo, 0, len(searchResp.Data))
	for idx := range searchResp.Data {
		v := searchResp.Data[idx]

		tasks.Go(func() error {
			ri, err := r.packResource(ctx, v)
			if err != nil {
				logs.CtxErrorf(ctx, "[LibraryResourceList] packResource failed, will ignore resID: %d, Name : %s, resType: %d, err: %v",
					v.ResID, v.GetName(), v.ResType, err)
				return err
			}

			lock.Lock()
			defer lock.Unlock()
			resources = append(resources, ri)

			return nil
		})
	}

	_ = tasks.Wait()

	return &resource.LibraryResourceListResponse{
		Code:         0,
		ResourceList: resources,
		Cursor:       ptr.Of(searchResp.NextCursor),
		HasMore:      searchResp.HasMore,
	}, nil
}

func (r *SearchApplicationService) getResourceDefaultIconURL(ctx context.Context, tp common.ResType) string {
	iconURL, ok := resType2iconURI[tp]
	if !ok {
		logs.CtxWarnf(ctx, "[getDefaultIconURL] don't have type: %d  default icon", tp)

		return ""
	}

	return r.getURL(ctx, iconURL)
}

func (r *SearchApplicationService) getURL(ctx context.Context, uri string) string {
	url, err := r.TOS.GetObjectUrl(ctx, uri)
	if err != nil {
		logs.CtxWarnf(ctx, "[getDefaultIconURLWitURI] GetObjectUrl failed, uri: %s, err: %v", uri, err)

		return ""
	}

	return url
}

func (r *SearchApplicationService) getResourceIconURL(ctx context.Context, uri *string, tp common.ResType) string {
	if uri == nil || *uri == "" {
		return r.getResourceDefaultIconURL(ctx, tp)
	}

	url := r.getURL(ctx, *uri)
	if url != "" {
		return url
	}

	return r.getResourceDefaultIconURL(ctx, tp)
}

func (r *SearchApplicationService) packUserInfo(ctx context.Context, ri *common.ResourceInfo, ownerID int64) *common.ResourceInfo {
	u, err := r.UserDomainSVC.GetUserInfo(ctx, ownerID)
	if err != nil {
		logs.CtxWarnf(ctx, "[LibraryResourceList] GetUserInfo failed, uid: %d, resID: %d, Name : %s, err: %v",
			ownerID, ri.ResID, ri.GetName(), err)
	} else {
		ri.CreatorName = ptr.Of(u.Name)
		ri.CreatorAvatar = ptr.Of(u.IconURL)
	}

	if ri.GetCreatorAvatar() == "" {
		ri.CreatorAvatar = ptr.Of(r.getURL(ctx, consts.DefaultUserIcon))
	}

	return ri
}

func (r *SearchApplicationService) packResource(ctx context.Context, doc *entity.ResourceDocument) (*common.ResourceInfo, error) {
	ri := &common.ResourceInfo{
		ResID:         ptr.Of(doc.ResID),
		ResType:       ptr.Of(doc.ResType),
		Name:          doc.Name,
		SpaceID:       doc.SpaceID,
		CreatorID:     doc.OwnerID,
		ResSubType:    doc.ResSubType,
		PublishStatus: doc.PublishStatus,
		EditTime:      ptr.Of(doc.GetUpdateTime() / 1000),
	}

	if doc.BizStatus != nil {
		ri.BizResStatus = ptr.Of(int32(*doc.BizStatus))
	}

	packer, err := NewResourcePacker(doc.ResID, doc.ResType, r.ServiceComponents)
	if err != nil {
		return nil, errorx.Wrapf(err, "NewResourcePacker failed")
	}

	data, err := packer.GetDataInfo(ctx)
	if err != nil {
		return nil, errorx.Wrapf(err, "GetDataInfo failed")
	}

	ri.Icon = ptr.Of(r.getResourceIconURL(ctx, data.iconURI, doc.ResType))
	ri = r.packUserInfo(ctx, ri, doc.GetOwnerID())
	ri.Desc = data.desc
	ri.Actions = packer.GetActions(ctx)

	return ri, nil
}
