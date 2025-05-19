package search

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/domain/search"
	"code.byted.org/flow/opencoze/backend/domain/search/entity"
	crosssearch "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/search"
)

type Notifier interface {
	PublishWorkflowResource(ctx context.Context, OpType crosssearch.OpType, event *crosssearch.Resource) error
}

type Notify struct {
	client search.ResourceEventbus
}

func NewNotify(client search.ResourceEventbus) *Notify {
	return &Notify{client: client}
}

func (n *Notify) PublishWorkflowResource(ctx context.Context, op crosssearch.OpType, r *crosssearch.Resource) error {
	resource := &entity.ResourceDomainEvent{
		OpType: entity.OpType(op),
		Resource: &entity.Resource{
			ResType: common.ResType_Workflow,
			ID:      r.WorkflowID,
			Name:    r.Name,
			Desc:    r.Desc,

			SpaceID:       r.SpaceID,
			OwnerID:       r.OwnerID,
			PublishStatus: common.PublishStatus(r.PublishStatus),

			CreatedAt:   r.CreatedAt,
			UpdatedAt:   r.UpdatedAt,
			PublishedAt: r.PublishedAt,
		},
	}

	err := n.client.PublishResources(ctx, resource)
	if err != nil {
		return err
	}

	return nil
}
