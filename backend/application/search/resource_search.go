package search

import (
	"context"
	"slices"
	"strconv"
	"sync"

	"code.byted.org/flow/opencoze/backend/api/model/resource"
	"code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/search/entity"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ternary"
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

func (s *SearchApplicationService) LibraryResourceList(ctx context.Context, req *resource.LibraryResourceListRequest) (resp *resource.LibraryResourceListResponse, err error) {
	userID := ctxutil.GetUIDFromCtx(ctx)
	if userID == nil {
		return nil, errorx.New(errno.ErrSearchPermissionCode, errorx.KV("msg", "session required"))
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

	searchResp, err := s.DomainSVC.SearchResources(ctx, searchReq)
	if err != nil {
		return nil, err
	}

	lock := sync.Mutex{}
	tasks := taskgroup.NewUninterruptibleTaskGroup(ctx, 10)
	resources := make([]*common.ResourceInfo, 0, len(searchResp.Data))
	for idx := range searchResp.Data {
		v := searchResp.Data[idx]

		tasks.Go(func() error {
			ri, err := s.packResource(ctx, v)
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

func (s *SearchApplicationService) getResourceDefaultIconURL(ctx context.Context, tp common.ResType) string {
	iconURL, ok := resType2iconURI[tp]
	if !ok {
		logs.CtxWarnf(ctx, "[getDefaultIconURL] don't have type: %d  default icon", tp)

		return ""
	}

	return s.getURL(ctx, iconURL)
}

func (s *SearchApplicationService) getURL(ctx context.Context, uri string) string {
	url, err := s.TOS.GetObjectUrl(ctx, uri)
	if err != nil {
		logs.CtxWarnf(ctx, "[getDefaultIconURLWitURI] GetObjectUrl failed, uri: %s, err: %v", uri, err)

		return ""
	}

	return url
}

func (s *SearchApplicationService) getResourceIconURL(ctx context.Context, uri *string, tp common.ResType) string {
	if uri == nil || *uri == "" {
		return s.getResourceDefaultIconURL(ctx, tp)
	}

	url := s.getURL(ctx, *uri)
	if url != "" {
		return url
	}

	return s.getResourceDefaultIconURL(ctx, tp)
}

func (s *SearchApplicationService) packUserInfo(ctx context.Context, ri *common.ResourceInfo, ownerID int64) *common.ResourceInfo {
	u, err := s.UserDomainSVC.GetUserInfo(ctx, ownerID)
	if err != nil {
		logs.CtxWarnf(ctx, "[LibraryResourceList] GetUserInfo failed, uid: %d, resID: %d, Name : %s, err: %v",
			ownerID, ri.ResID, ri.GetName(), err)
	} else {
		ri.CreatorName = ptr.Of(u.Name)
		ri.CreatorAvatar = ptr.Of(u.IconURL)
	}

	if ri.GetCreatorAvatar() == "" {
		ri.CreatorAvatar = ptr.Of(s.getURL(ctx, consts.DefaultUserIcon))
	}

	return ri
}

func (s *SearchApplicationService) packResource(ctx context.Context, doc *entity.ResourceDocument) (*common.ResourceInfo, error) {
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

	packer, err := NewResourcePacker(doc.ResID, doc.ResType, s.ServiceComponents)
	if err != nil {
		return nil, errorx.Wrapf(err, "NewResourcePacker failed")
	}

	ri = s.packUserInfo(ctx, ri, doc.GetOwnerID())
	ri.Actions = packer.GetActions(ctx)

	data, err := packer.GetDataInfo(ctx)
	if err != nil {
		logs.CtxWarnf(ctx, "[packResource] GetDataInfo failed, resID: %d, Name : %s, resType: %d, err: %v",
			doc.ResID, doc.GetName(), doc.ResType, err)

		ri.Icon = ptr.Of(s.getResourceDefaultIconURL(ctx, doc.ResType))

		return ri, nil // Warn : weak dependency data
	}

	ri.Desc = data.desc
	ri.Icon = ternary.IFElse(len(data.iconURL) > 0,
		&data.iconURL, ptr.Of(s.getResourceIconURL(ctx, data.iconURI, doc.ResType)))

	return ri, nil
}

func (s *SearchApplicationService) ProjectResourceList(ctx context.Context, req *resource.ProjectResourceListRequest) (resp *resource.ProjectResourceListResponse, err error) {
	resources, err := s.getAPPAllResources(ctx, req.GetProjectID())
	if err != nil {
		return nil, err
	}

	resourceGroups, err := s.packAPPResources(ctx, resources)
	if err != nil {
		return nil, err
	}

	resourceGroups = s.sortAPPResources(resourceGroups)

	return &resource.ProjectResourceListResponse{
		ResourceGroups: resourceGroups,
	}, nil
}

func (s *SearchApplicationService) getAPPAllResources(ctx context.Context, appID int64) ([]*entity.ResourceDocument, error) {
	cursor := ""
	resources := make([]*entity.ResourceDocument, 0, 100)

	for {
		res, err := s.DomainSVC.SearchResources(ctx, &entity.SearchResourcesRequest{
			APPID:  appID,
			Cursor: cursor,
			Limit:  100,
		})
		if err != nil {
			return nil, err
		}

		resources = append(resources, res.Data...)

		hasMore := res.HasMore
		cursor = res.NextCursor

		if !hasMore {
			break
		}
	}

	return resources, nil
}

func (s *SearchApplicationService) packAPPResources(ctx context.Context, resources []*entity.ResourceDocument) ([]*common.ProjectResourceGroup, error) {
	workflowGroup := &common.ProjectResourceGroup{
		GroupType:    common.ProjectResourceGroupType_Workflow,
		ResourceList: []*common.ProjectResourceInfo{},
	}
	dataGroup := &common.ProjectResourceGroup{
		GroupType:    common.ProjectResourceGroupType_Data,
		ResourceList: []*common.ProjectResourceInfo{},
	}
	pluginGroup := &common.ProjectResourceGroup{
		GroupType:    common.ProjectResourceGroupType_Plugin,
		ResourceList: []*common.ProjectResourceInfo{},
	}

	lock := sync.Mutex{}
	tasks := taskgroup.NewUninterruptibleTaskGroup(ctx, 10)
	for idx := range resources {
		v := resources[idx]

		tasks.Go(func() error {
			ri, err := s.packProjectResource(ctx, v)
			if err != nil {
				logs.CtxErrorf(ctx, "packAPPResources failed, will ignore resID: %d, Name : %s, resType: %d, err: %v",
					v.ResID, v.GetName(), v.ResType, err)
				return err
			}

			lock.Lock()
			defer lock.Unlock()

			switch v.ResType {
			case common.ResType_Workflow:
				workflowGroup.ResourceList = append(workflowGroup.ResourceList, ri)
			case common.ResType_Plugin:
				pluginGroup.ResourceList = append(pluginGroup.ResourceList, ri)
			case common.ResType_Database, common.ResType_Knowledge:
				dataGroup.ResourceList = append(dataGroup.GetResourceList(), ri)
			default:
				logs.CtxWarnf(ctx, "unsupported resType: %d", v.ResType)
			}

			return nil
		})
	}

	_ = tasks.Wait()

	resourceGroups := []*common.ProjectResourceGroup{
		workflowGroup,
		dataGroup,
		pluginGroup,
	}

	return resourceGroups, nil
}

func (s *SearchApplicationService) packProjectResource(ctx context.Context, resource *entity.ResourceDocument) (*common.ProjectResourceInfo, error) {
	packer, err := NewResourcePacker(resource.ResID, resource.ResType, nil)
	if err != nil {
		return nil, err
	}

	info := &common.ProjectResourceInfo{
		ResID:      resource.ResID,
		ResType:    resource.ResType,
		ResSubType: resource.ResSubType,
		Name:       resource.GetName(),
		Actions:    packer.GetProjectActions(ctx),
	}

	if resource.ResType == common.ResType_Knowledge {
		info.BizExtend = map[string]string{
			"format_type": strconv.FormatInt(int64(resource.GetResSubType()), 10),
		}
	}

	return info, nil
}

func (s *ServiceComponents) sortAPPResources(resourceGroups []*common.ProjectResourceGroup) []*common.ProjectResourceGroup {
	for _, g := range resourceGroups {
		slices.SortFunc(g.ResourceList, func(a, b *common.ProjectResourceInfo) int {
			if a.Name == b.Name {
				return 0
			}
			if a.Name < b.Name {
				return -1
			}
			return 1
		})
	}
	return resourceGroups
}
