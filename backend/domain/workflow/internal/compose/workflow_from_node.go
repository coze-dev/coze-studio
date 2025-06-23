package compose

import (
	"context"

	"github.com/cloudwego/eino/compose"

	workflow2 "code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

func NewWorkflowFromNode(ctx context.Context, sc *WorkflowSchema, nodeKey vo.NodeKey, opts ...compose.GraphCompileOption) (
	*Workflow, error) {
	sc.Init()
	ns := sc.GetNode(nodeKey)

	wf := &Workflow{
		workflow:          compose.NewWorkflow[map[string]any, map[string]any](compose.WithGenLocalState(GenState())),
		hierarchy:         sc.Hierarchy,
		connections:       sc.Connections,
		schema:            sc,
		fromNode:          true,
		streamRun:         false, // single node run can only invoke
		requireCheckpoint: sc.requireCheckPoint,
		input:             ns.InputTypes,
		output:            ns.OutputTypes,
		terminatePlan:     vo.ReturnVariables,
	}

	compositeNodes := sc.GetCompositeNodes()
	processedNodeKey := make(map[vo.NodeKey]struct{})
	for i := range compositeNodes {
		cNode := compositeNodes[i]
		if err := wf.AddCompositeNode(ctx, cNode); err != nil {
			return nil, err
		}

		processedNodeKey[cNode.Parent.Key] = struct{}{}
		for _, child := range cNode.Children {
			processedNodeKey[child.Key] = struct{}{}
		}
	}

	// add all nodes other than composite nodes and their children
	for _, ns := range sc.Nodes {
		if _, ok := processedNodeKey[ns.Key]; !ok {
			if err := wf.AddNode(ctx, ns); err != nil {
				return nil, err
			}
		}
	}

	wf.End().AddInput(string(nodeKey))

	var compileOpts []compose.GraphCompileOption
	compileOpts = append(compileOpts, opts...)
	if wf.requireCheckpoint {
		compileOpts = append(compileOpts, compose.WithCheckPointStore(workflow2.GetRepository()))
	}

	r, err := wf.Compile(ctx, compileOpts...)
	if err != nil {
		return nil, err
	}
	wf.Runner = r

	return wf, nil
}
