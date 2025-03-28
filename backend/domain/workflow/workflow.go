package workflow

import (
	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/selector"
)

type workflow = compose.Workflow[map[string]any, map[string]any]

type Workflow struct {
	*workflow
}

func NewWorkflow(opts ...compose.NewGraphOption) *Workflow {
	wf := compose.NewWorkflow[map[string]any, map[string]any](opts...)
	return &Workflow{wf}
}

func (w *Workflow) AddSelectorNode(key string, selector *selector.Selector) *Workflow {
	passthrough := w.AddPassthroughNode(key)

	for fromNodeKey, fieldMappings := range selector.DependenciesWithInput() {
		passthrough.AddInput(fromNodeKey, fieldMappings...)
	}

	for fromNodeKey, fieldMappings := range selector.NoDirectDependencies() {
		passthrough.AddInputWithOptions(fromNodeKey, fieldMappings, compose.WithNoDirectDependency())
	}

	for _, fromNodeKey := range selector.OnlyDependencies() {
		passthrough.AddDependency(fromNodeKey)
	}

	_ = w.AddBranch(key, selector.Branch())

	return w
}
