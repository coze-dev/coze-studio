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

	"github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	"github.com/coze-dev/coze-studio/backend/domain/search/entity"
	search "github.com/coze-dev/coze-studio/backend/domain/search/service"
	crosssearch "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/search"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
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
		ResType:    common.ResType_Workflow,
		ResID:      r.WorkflowID,
		ResSubType: r.Mode,
		Name:       r.Name,
		SpaceID:    r.SpaceID,
		OwnerID:    r.OwnerID,
		APPID:      r.APPID,
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
