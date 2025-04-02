package application

import (
	"context"

	api "code.byted.org/flow/opencoze/backend/api/model/prompt"
	"code.byted.org/flow/opencoze/backend/domain/prompt/entity"
	"code.byted.org/flow/opencoze/backend/infra/pkg/logs"
)

type PromptApplicationService struct{}

var PromptSVC = PromptApplicationService{}

func (p *PromptApplicationService) UpsertPromptResource(ctx context.Context, req *api.UpsertPromptResourceRequest) (resp *api.UpsertPromptResourceResponse, err error) {
	session := getUserSession(ctx)
	if session == nil {
		return nil, ErrUnauthorized
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

	// TODO(@fanlv)
	// update prompt resource
	// 鉴权用户是否有这个 space id 权限，是否是这个Prompt owner

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
