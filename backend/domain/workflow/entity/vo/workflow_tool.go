package vo

import "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"

type WorkflowToolConfig struct {
	InputParametersConfig  []*workflow.APIParameter
	OutputParametersConfig []*workflow.APIParameter
}
