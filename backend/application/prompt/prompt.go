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

package prompt

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/api/model/playground"
	"github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/application/search"
	"github.com/coze-dev/coze-studio/backend/domain/prompt/entity"
	prompt "github.com/coze-dev/coze-studio/backend/domain/prompt/service"
	searchEntity "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type PromptApplicationService struct {
	DomainSVC prompt.Prompt
	eventbus  search.ResourceEventBus
}

var PromptSVC = &PromptApplicationService{}

func (p *PromptApplicationService) UpsertPromptResource(ctx context.Context, req *playground.UpsertPromptResourceRequest) (resp *playground.UpsertPromptResourceResponse, err error) {
	session := ctxutil.GetUserSessionFromCtx(ctx)
	if session == nil {
		return nil, errorx.New(errno.ErrPromptPermissionCode, errorx.KV("msg", "no session data provided"))
	}

	promptID := req.Prompt.GetID()
	if promptID == 0 {
		// create a new prompt resource
		resp, err = p.createPromptResource(ctx, req)
		if err != nil {
			return nil, err
		}

		pErr := p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
			OpType: searchEntity.Created,
			Resource: &searchEntity.ResourceDocument{
				ResType:       common.ResType_Prompt,
				ResID:         resp.Data.ID,
				Name:          req.Prompt.Name,
				SpaceID:       req.Prompt.SpaceID,
				OwnerID:       &session.UserID,
				PublishStatus: ptr.Of(common.PublishStatus_Published),
			},
		})
		if pErr != nil {
			logs.CtxErrorf(ctx, "publish resource event failed: %v", pErr)
		}

		return resp, nil
	}

	// update an existing prompt resource
	resp, err = p.updatePromptResource(ctx, req)
	if err != nil {
		return nil, err
	}

	pErr := p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Updated,
		Resource: &searchEntity.ResourceDocument{
			ResType: common.ResType_Prompt,
			ResID:   resp.Data.ID,
			Name:    req.Prompt.Name,
			SpaceID: req.Prompt.SpaceID,
		},
	})
	if pErr != nil {
		logs.CtxErrorf(ctx, "publish resource event failed: %v", pErr)
	}

	return resp, nil
}

func (p *PromptApplicationService) GetPromptResourceInfo(ctx context.Context, req *playground.GetPromptResourceInfoRequest) (
	resp *playground.GetPromptResourceInfoResponse, err error,
) {

	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPromptPermissionCode, errorx.KV("msg", "no session data provided"))
	}

	promptInfo, err := p.DomainSVC.GetPromptResource(ctx, req.GetPromptResourceID())
	if err != nil {
		return nil, err
	}
	if promptInfo.CreatorID != *uid {
		return nil, errorx.New(errno.ErrPromptPermissionCode, errorx.KV("msg", "no permission"))
	}

	return &playground.GetPromptResourceInfoResponse{
		Data: promptInfoDo2To(promptInfo),
		Code: 0,
	}, nil
}

func (p *PromptApplicationService) GetOfficialPromptResourceList(ctx context.Context, c *playground.GetOfficialPromptResourceListRequest) (
	*playground.GetOfficialPromptResourceListResponse, error,
) {
	session := ctxutil.GetUserSessionFromCtx(ctx)
	if session == nil {
		return nil, errorx.New(errno.ErrPromptPermissionCode, errorx.KV("msg", "no session data provided"))
	}

	promptList, err := p.DomainSVC.ListOfficialPromptResource(ctx, c.GetKeyword())
	if err != nil {
		return nil, err
	}

	return &playground.GetOfficialPromptResourceListResponse{
		PromptResourceList: slices.Transform(promptList, func(p *entity.PromptResource) *playground.PromptResource {
			return promptInfoDo2To(p)
		}),
		Code: 0,
	}, nil
}

func (p *PromptApplicationService) DeletePromptResource(ctx context.Context, req *playground.DeletePromptResourceRequest) (resp *playground.DeletePromptResourceResponse, err error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPromptPermissionCode, errorx.KV("msg", "no session data provided"))
	}

	promptInfo, err := p.DomainSVC.GetPromptResource(ctx, req.GetPromptResourceID())
	if err != nil {
		return nil, err
	}

	if promptInfo.CreatorID != *uid {
		return nil, errorx.New(errno.ErrPromptPermissionCode, errorx.KV("msg", "no permission"))
	}

	err = p.DomainSVC.DeletePromptResource(ctx, req.GetPromptResourceID())
	if err != nil {
		return nil, err
	}

	pErr := p.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Deleted,
		Resource: &searchEntity.ResourceDocument{
			ResType: common.ResType_Prompt,
			ResID:   req.GetPromptResourceID(),
		},
	})
	if pErr != nil {
		logs.CtxErrorf(ctx, "publish resource event failed: %v", pErr)
	}

	return &playground.DeletePromptResourceResponse{
		Code: 0,
	}, nil
}

func (p *PromptApplicationService) createPromptResource(ctx context.Context, req *playground.UpsertPromptResourceRequest) (resp *playground.UpsertPromptResourceResponse, err error) {
	do := p.toPromptResourceDO(req.Prompt)
	uid := ctxutil.GetUIDFromCtx(ctx)

	do.CreatorID = *uid

	promptID, err := p.DomainSVC.CreatePromptResource(ctx, do)
	if err != nil {
		return nil, err
	}

	return &playground.UpsertPromptResourceResponse{
		Data: &playground.ShowPromptResource{
			ID: promptID,
		},
		Code: 0,
	}, nil
}

func (p *PromptApplicationService) updatePromptResource(ctx context.Context, req *playground.UpsertPromptResourceRequest) (resp *playground.UpsertPromptResourceResponse, err error) {
	promptID := req.Prompt.GetID()

	promptResource, err := p.DomainSVC.GetPromptResource(ctx, promptID)
	if err != nil {
		return nil, err
	}

	logs.CtxInfof(ctx, "promptResource.SpaceID: %v , promptResource.CreatorID : %v", promptResource.SpaceID, promptResource.CreatorID)
	uid := ctxutil.GetUIDFromCtx(ctx)

	if promptResource.CreatorID != *uid {
		return nil, errorx.New(errno.ErrPromptPermissionCode, errorx.KV("msg", "no permission"))
	}

	err = p.DomainSVC.UpdatePromptResource(ctx, promptID, req.Prompt.Name, req.Prompt.Description, req.Prompt.PromptText)
	if err != nil {
		return nil, err
	}

	return &playground.UpsertPromptResourceResponse{
		Data: &playground.ShowPromptResource{
			ID: promptID,
		},
		Code: 0,
	}, nil
}

func (p *PromptApplicationService) toPromptResourceDO(m *playground.PromptResource) *entity.PromptResource {
	e := entity.PromptResource{}
	e.ID = m.GetID()
	e.PromptText = m.GetPromptText()
	e.SpaceID = m.GetSpaceID()
	e.Name = m.GetName()
	e.Description = m.GetDescription()

	return &e
}

func promptInfoDo2To(p *entity.PromptResource) *playground.PromptResource {
	return &playground.PromptResource{
		ID:          ptr.Of(p.ID),
		SpaceID:     ptr.Of(p.SpaceID),
		Name:        ptr.Of(p.Name),
		Description: ptr.Of(p.Description),
		PromptText:  ptr.Of(p.PromptText),
	}
}
