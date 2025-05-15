package singleagent

import (
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/workflow"
)

func NewWorkflow(wfSvr workflow.Service) crossdomain.Workflow {
	return wfSvr
}
