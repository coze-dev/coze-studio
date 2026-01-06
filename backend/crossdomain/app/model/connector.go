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

package model

import (
	publishAPI "github.com/coze-dev/coze-studio/backend/api/model/app/intelligence/publish"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

var ConnectorIDWhiteList = []int64{
	consts.WebSDKConnectorID,
	consts.APIConnectorID,
}

type ConnectorPublishRecord struct {
	ConnectorID   int64                  `json:"connector_id"`
	PublishStatus ConnectorPublishStatus `json:"publish_status"`
	PublishConfig PublishConfig          `json:"publish_config"`
}

type PublishConfig struct {
	SelectedWorkflows []*SelectedWorkflow `json:"selected_workflows,omitempty"`
}

func (p *PublishConfig) ToVO() *publishAPI.ConnectorPublishConfig {
	config := &publishAPI.ConnectorPublishConfig{
		SelectedWorkflows: make([]*publishAPI.SelectedWorkflow, 0, len(p.SelectedWorkflows)),
	}

	if p == nil {
		return config
	}

	for _, w := range p.SelectedWorkflows {
		config.SelectedWorkflows = append(config.SelectedWorkflows, &publishAPI.SelectedWorkflow{
			WorkflowID:   w.WorkflowID,
			WorkflowName: w.WorkflowName,
		})
	}

	return config
}

type SelectedWorkflow struct {
	WorkflowID   int64  `json:"workflow_id"`
	WorkflowName string `json:"workflow_name"`
}
