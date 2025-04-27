package application

import (
	"context"

	api "code.byted.org/flow/opencoze/backend/api/model/prompt"
	"code.byted.org/flow/opencoze/backend/domain/prompt/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type PromptApplicationService struct{}

var PromptSVC = PromptApplicationService{}

func (p *PromptApplicationService) UpsertPromptResource(ctx context.Context, req *api.UpsertPromptResourceRequest) (resp *api.UpsertPromptResourceResponse, err error) {
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

func (p *PromptApplicationService) createPromptResource(ctx context.Context, req *api.UpsertPromptResourceRequest) (resp *api.UpsertPromptResourceResponse, err error) {
	do := p.toPromptResourceDO(req.Prompt)
	uid := getUIDFromCtx(ctx)

	do.CreatorID = *uid

	promptID, err := promptDomainSVC.CreatePromptResource(ctx, do)
	if err != nil {
		return nil, err
	}

	return &api.UpsertPromptResourceResponse{
		Data: &api.ShowPromptResource{
			ID: promptID,
		},
		Code: 0,
	}, nil
}

func (*PromptApplicationService) updatePromptResource(ctx context.Context, req *api.UpsertPromptResourceRequest) (resp *api.UpsertPromptResourceResponse, err error) {
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

	return &api.UpsertPromptResourceResponse{
		Data: &api.ShowPromptResource{
			ID: promptID,
		},
		Code: 0,
	}, nil
}

func (p *PromptApplicationService) toPromptResourceDO(m *api.PromptResource) *entity.PromptResource {
	e := entity.PromptResource{}
	e.ID = m.GetID()
	e.PromptText = m.GetPromptText()
	e.SpaceID = m.GetSpaceID()
	e.Name = m.GetName()
	e.Description = m.GetDescription()

	return &e
}
