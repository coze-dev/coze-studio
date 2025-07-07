package nodes

import "code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"

type StructuredCallbackOutput struct {
	Output    map[string]any
	RawOutput map[string]any
	Extra     map[string]any // node specific extra info, will go into node execution's extra.ResponseExtra
	Error     vo.WorkflowError
}
