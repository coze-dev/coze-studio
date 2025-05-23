package search

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/domain/search/entity"
	search "code.byted.org/flow/opencoze/backend/domain/search/service"
	crosssearch "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/search"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
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
			Name:    &r.Name,
			Desc:    &r.Desc,

			SpaceID:       &r.SpaceID,
			OwnerID:       &r.OwnerID,
			PublishStatus: ptr.Of(common.PublishStatus(r.PublishStatus)),

			PublishedAt: &r.PublishedAt, // TODO(zhuangjie): 确认什么时候需要填这个。
		},
	}

	if op == crosssearch.Created {
		resource.Resource.CreatedAt = &r.CreatedAt
		resource.Resource.UpdatedAt = &r.UpdatedAt
	} else if op == crosssearch.Updated {
		resource.Resource.UpdatedAt = &r.UpdatedAt
	}

	err := n.client.PublishResources(ctx, resource)
	if err != nil {
		return err
	}

	return nil
}
