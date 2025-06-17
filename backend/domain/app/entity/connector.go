package entity

import (
	publishAPI "code.byted.org/flow/opencoze/backend/api/model/publish"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

var ConnectorIDWhiteList = []int64{
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
