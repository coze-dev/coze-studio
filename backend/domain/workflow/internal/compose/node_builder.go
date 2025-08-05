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
	"fmt"
	"runtime/debug"

	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/subworkflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type Node struct {
	Lambda *compose.Lambda
}

// New instantiates the actual node type from NodeSchema.
func New(ctx context.Context, s *schema.NodeSchema,
	inner compose.Runnable[map[string]any, map[string]any], // inner workflow for composite node
	sc *schema.WorkflowSchema, // the workflow this NodeSchema is in
	deps *dependencyInfo, // the dependency for this node pre-calculated by workflow engine
) (_ *Node, err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrCreateNodeFail, err, errorx.KV("node_name", s.Name), errorx.KV("cause", err.Error()))
		}
	}()

	var fullSources map[string]*schema.SourceInfo
	if m := entity.NodeMetaByNodeType(s.Type); m != nil && m.InputSourceAware {
		if fullSources, err = GetFullSources(s, sc, deps); err != nil {
			return nil, err
		}
		s.FullSources = fullSources
	}

	// if NodeSchema's Configs implements NodeBuilder, will use it to build the node
	nb, ok := s.Configs.(schema.NodeBuilder)
	if ok {
		opts := []schema.BuildOption{
			schema.WithWorkflowSchema(sc),
			schema.WithInnerWorkflow(inner),
		}

		// build the actual InvokableNode, etc.
		n, err := nb.Build(ctx, s, opts...)
		if err != nil {
			return nil, err
		}

		// wrap InvokableNode, etc. within NodeRunner, converting to eino's Lambda
		return toNode(s, n), nil
	}

	switch s.Type {
	case entity.NodeTypeLambda:
		if s.Lambda == nil {
			return nil, fmt.Errorf("lambda is not defined for NodeTypeLambda")
		}

		return &Node{Lambda: s.Lambda}, nil
	case entity.NodeTypeSubWorkflow:
		subWorkflow, err := buildSubWorkflow(ctx, s, sc.RequireCheckpoint())
		if err != nil {
			return nil, err
		}

		return toNode(s, subWorkflow), nil
	default:
		panic(fmt.Sprintf("node schema's Configs does not implement NodeBuilder. type: %v", s.Type))
	}
}

func buildSubWorkflow(ctx context.Context, s *schema.NodeSchema, requireCheckpoint bool) (*subworkflow.SubWorkflow, error) {
	var opts []WorkflowOption
	opts = append(opts, WithIDAsName(s.Configs.(*subworkflow.Config).WorkflowID))
	if requireCheckpoint {
		opts = append(opts, WithParentRequireCheckpoint())
	}
	if s := execute.GetStaticConfig(); s != nil && s.MaxNodeCountPerWorkflow > 0 {
		opts = append(opts, WithMaxNodeCount(s.MaxNodeCountPerWorkflow))
	}
	wf, err := NewWorkflow(ctx, s.SubWorkflowSchema, opts...)
	if err != nil {
		return nil, err
	}

	return &subworkflow.SubWorkflow{
		Runner: wf.Runner,
	}, nil
}
