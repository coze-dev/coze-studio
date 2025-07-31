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
	"errors"
	"slices"
	"strconv"
	"sync"

	knowledgeModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/api/model/resource"
	"github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/domain/search/entity"
	search "github.com/coze-dev/coze-studio/backend/domain/search/service"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/taskgroup"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
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
		ResTypeFilter:       req.GetResTypeFilter(),
		PublishStatusFilter: req.GetPublishStatusFilter(),
		SearchKeys:          req.GetSearchKeys(),
		Cursor:              req.GetCursor(),
		Limit:               req.GetSize(),
	}

	// Set up user filtering
	if req.IsSetUserFilter() && req.GetUserFilter() > 0 {
		searchReq.OwnerID = ptr.From(userID)
	}

	searchResp, err := s.DomainSVC.SearchResources(ctx, searchReq)
	if err != nil {
		return nil, err
	}

	lock := sync.Mutex{}
	tasks := taskgroup.NewUninterruptibleTaskGroup(ctx, 10)
	resources := make([]*common.ResourceInfo, len(searchResp.Data))
	if len(searchResp.Data) > 1 {
		for idx := range searchResp.Data[1:] {
			index := idx + 1
			v := searchResp.Data[index]
			tasks.Go(func() error {
				ri, err := s.packResource(ctx, v)
				if err != nil {
					logs.CtxErrorf(ctx, "[LibraryResourceList] packResource failed, will ignore resID: %d, Name : %s, resType: %d, err: %v",
						v.ResID, v.GetName(), v.ResType, err)
					return err
				}

				lock.Lock()
				defer lock.Unlock()
				resources[index] = ri
				return nil
			})
		}
	}
	if len(searchResp.Data) != 0 {
		ri, err := s.packResource(ctx, searchResp.Data[0])
		if err != nil {
			return nil, err
		}
		lock.Lock()
		resources[0] = ri
		lock.Unlock()
	}
	err = tasks.Wait()
	if err != nil {
		return nil, err
	}

	filterResource := make([]*common.ResourceInfo, 0)
	for _, res := range resources {
		if res == nil {
			continue
		}
		filterResource = append(filterResource, res)
	}

	return &resource.LibraryResourceListResponse{
		Code:         0,
		ResourceList: filterResource,
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
	ri.BizResStatus = data.status
	ri.Desc = data.desc
	ri.Icon = ternary.IFElse(len(data.iconURL) > 0,
		&data.iconURL, ptr.Of(s.getResourceIconURL(ctx, data.iconURI, doc.ResType)))
	ri.BizExtend = map[string]string{
		"url": ptr.From(ri.Icon),
	}
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
		pluginGroup,
		dataGroup,
	}

	return resourceGroups, nil
}

func (s *SearchApplicationService) packProjectResource(ctx context.Context, resource *entity.ResourceDocument) (*common.ProjectResourceInfo, error) {
	packer, err := NewResourcePacker(resource.ResID, resource.ResType, s.ServiceComponents)
	if err != nil {
		return nil, err
	}

	info := &common.ProjectResourceInfo{
		ResID:      resource.ResID,
		ResType:    resource.ResType,
		ResSubType: resource.ResSubType,
		Name:       resource.GetName(),
		Actions:    packer.GetProjectDefaultActions(ctx),
	}

	if resource.ResType == common.ResType_Knowledge {
		info.BizExtend = map[string]string{
			"format_type": strconv.FormatInt(int64(resource.GetResSubType()), 10),
		}
		di, err := packer.GetDataInfo(ctx)
		if err != nil {
			logs.CtxErrorf(ctx, "GetDataInfo failed, resID=%d, resType=%d, err=%v",
				resource.ResID, resource.ResType, err)
		} else {
			info.BizResStatus = ptr.Of(*di.status)
			if *di.status == int32(knowledgeModel.KnowledgeStatusDisable) {
				actions := slices.Clone(info.Actions)
				for _, a := range actions {
					if a.Key == common.ProjectResourceActionKey_Disable {
						a.Key = common.ProjectResourceActionKey_Enable
						break
					}
				}
			}
		}
	}

	if resource.ResType == common.ResType_Plugin {
		err = s.PluginDomainSVC.CheckPluginToolsDebugStatus(ctx, resource.ResID)
		if err != nil {
			var e errorx.StatusError
			if !errors.As(err, &e) {
				logs.CtxErrorf(ctx, "CheckPluginToolsDebugStatus failed, resID=%d, resType=%d, err=%v",
					resource.ResID, resource.ResType, err)
			} else {
				actions := slices.Clone(info.Actions)
				for _, a := range actions {
					if a.Key == common.ProjectResourceActionKey_MoveToLibrary ||
						a.Key == common.ProjectResourceActionKey_CopyToLibrary {
						a.Enable = false
						a.Hint = ptr.Of(e.Msg())
					}
				}
			}
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
