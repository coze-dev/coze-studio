package application

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
	"code.byted.org/flow/opencoze/backend/domain/prompt/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type PromptApplicationService struct{}

var PromptSVC = PromptApplicationService{}

func (p *PromptApplicationService) UpsertPromptResource(ctx context.Context, req *playground.UpsertPromptResourceRequest) (resp *playground.UpsertPromptResourceResponse, err error) {
	session := getUserSessionFromCtx(ctx)
	if session == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "no session data provided"))
	}

	promptID := req.Prompt.GetID()
	if promptID == 0 {
		// create a new prompt resource
		return p.createPromptResource(ctx, req)
	}

	// update an existing prompt resource
	return p.updatePromptResource(ctx, req)
}

func (p *PromptApplicationService) GetPromptResourceInfo(ctx context.Context, req *playground.GetPromptResourceInfoRequest) (
	resp *playground.GetPromptResourceInfoResponse, err error) {

	promptInfo, err := promptDomainSVC.GetPromptResource(ctx, req.GetPromptResourceID())
	if err != nil {
		return nil, err
	}

	return &playground.GetPromptResourceInfoResponse{
		Data: promptInfoDo2To(promptInfo),
		Code: 0,
	}, nil

}

func (p *PromptApplicationService) GetOfficialPromptResourceList(ctx context.Context, c *playground.GetOfficialPromptResourceListRequest) (
	*playground.GetOfficialPromptResourceListResponse, error) {
	session := getUserSessionFromCtx(ctx)
	if session == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "no session data provided"))
	}

	promptList, err := promptDomainSVC.ListOfficialPromptResource(ctx, session.SpaceID, c.GetKeyword())
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

func (p *PromptApplicationService) DeletePromptResource(ctx context.Context, req *playground.DeletePromptResourceRequest) (
	resp *playground.DeletePromptResourceResponse, err error) {

	err = promptDomainSVC.DeletePromptResource(ctx, req.GetPromptResourceID())
	if err != nil {
		return nil, err
	}
	return &playground.DeletePromptResourceResponse{
		Code: 0,
	}, nil
}

func (p *PromptApplicationService) createPromptResource(ctx context.Context, req *playground.UpsertPromptResourceRequest) (resp *playground.UpsertPromptResourceResponse, err error) {
	do := p.toPromptResourceDO(req.Prompt)
	uid := getUIDFromCtx(ctx)

	do.CreatorID = *uid

	promptID, err := promptDomainSVC.CreatePromptResource(ctx, do)
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

func (*PromptApplicationService) updatePromptResource(ctx context.Context, req *playground.UpsertPromptResourceRequest) (resp *playground.UpsertPromptResourceResponse, err error) {
	promptID := req.Prompt.GetID()

	promptResource, err := promptDomainSVC.GetPromptResource(ctx, promptID)
	if err != nil {
		return nil, err
	}

	logs.Info("promptResource.SpaceID: %v , promptResource.CreatorID : %v", promptResource.SpaceID, promptResource.CreatorID)
	uid := getUIDFromCtx(ctx)

	allow, err := permissionDomainSVC.UserSpaceCheck(ctx, promptResource.SpaceID, *uid)
	if err != nil {
		return nil, err
	}

	if !allow {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "user not in space"))
	}

	err = promptDomainSVC.UpdatePromptResource(ctx, promptResource)
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
