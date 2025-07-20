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

package compose

import (
	"context"

	"github.com/cloudwego/eino/compose"

	workflow2 "github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
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
