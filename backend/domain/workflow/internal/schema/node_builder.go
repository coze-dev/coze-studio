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

package schema

import (
	"context"

	"github.com/cloudwego/eino/compose"
)

type BuildOptions struct {
	WS    *WorkflowSchema
	Inner compose.Runnable[map[string]any, map[string]any]
}

func GetBuildOptions(opts ...BuildOption) *BuildOptions {
	bo := &BuildOptions{}
	for _, o := range opts {
		o(bo)
	}
	return bo
}

type BuildOption func(options *BuildOptions)

func WithWorkflowSchema(ws *WorkflowSchema) BuildOption {
	return func(options *BuildOptions) {
		options.WS = ws
	}
}

func WithInnerWorkflow(inner compose.Runnable[map[string]any, map[string]any]) BuildOption {
	return func(options *BuildOptions) {
		options.Inner = inner
	}
}

// NodeBuilder takes a NodeSchema and several BuildOption to build an executable node instance.
// The result 'executable' MUST implement at least one of the execute interfaces:
// - nodes.InvokableNode
// - nodes.StreamableNode
// - nodes.CollectableNode
// - nodes.TransformableNode
// - nodes.InvokableNodeWOpt
// - nodes.StreamableNodeWOpt
// - nodes.CollectableNodeWOpt
// - nodes.TransformableNodeWOpt
// NOTE: the 'normal' version does not take NodeOption, while the 'WOpt' versions take NodeOption.
// NOTE: a node should either implement the 'normal' versions, or the 'WOpt' versions, not mix them up.
type NodeBuilder interface {
	Build(ctx context.Context, ns *NodeSchema, opts ...BuildOption) (
		executable any, err error)
}

// BranchBuilder builds the extractor function that maps node output to port index.
type BranchBuilder interface {
	BuildBranch(ctx context.Context) (extractor func(ctx context.Context,
		nodeOutput map[string]any) (int64, bool /*if is default branch*/, error), hasBranch bool)
}
