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
	client search.ResourceEventBus
}

func NewNotify(client search.ResourceEventBus) *Notify {
	return &Notify{client: client}
}

func (n *Notify) PublishWorkflowResource(ctx context.Context, op crosssearch.OpType, r *crosssearch.Resource) error {
	entityResource := &entity.ResourceDocument{
		ResType: common.ResType_Workflow,
		ResID:   r.WorkflowID,
		Name:    r.Name,
		SpaceID: r.SpaceID,
		OwnerID: r.OwnerID,
		APPID:   r.APPID,
	}
	if r.PublishStatus != nil {
		publishStatus := *r.PublishStatus
		entityResource.PublishStatus = ptr.Of(common.PublishStatus(publishStatus))
		entityResource.PublishTimeMS = r.PublishedAt
	}

	resource := &entity.ResourceDomainEvent{
		OpType:   entity.OpType(op),
		Resource: entityResource,
	}
	if op == crosssearch.Created {
		resource.Resource.CreateTimeMS = r.CreatedAt
		resource.Resource.UpdateTimeMS = r.UpdatedAt
	} else if op == crosssearch.Updated {
		resource.Resource.UpdateTimeMS = r.UpdatedAt
	}

	err := n.client.PublishResources(ctx, resource)
	if err != nil {
		return err
	}

	return nil
}
