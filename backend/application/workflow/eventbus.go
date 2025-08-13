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

package workflow

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	"github.com/coze-dev/coze-studio/backend/domain/search/entity"
	search "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	"github.com/coze-dev/coze-studio/backend/domain/search/service"
)

var eventBus service.ResourceEventBus

func setEventBus(bus service.ResourceEventBus) {
	eventBus = bus
}

func PublishWorkflowResource(ctx context.Context, workflowID int64, mode *int32, op search.OpType, r *search.ResourceDocument) error {
	if r == nil {
		r = &search.ResourceDocument{}
	}

	r.ResType = common.ResType_Workflow
	r.ResID = workflowID
	r.ResSubType = mode

	event := &entity.ResourceDomainEvent{
		OpType:   entity.OpType(op),
		Resource: r,
	}

	if op == search.Created {
		event.Resource.CreateTimeMS = r.CreateTimeMS
		event.Resource.UpdateTimeMS = r.UpdateTimeMS
	} else if op == search.Updated {
		event.Resource.UpdateTimeMS = r.UpdateTimeMS
	}

	err := eventBus.PublishResources(ctx, event)
	if err != nil {
		return err
	}

	return nil
}
