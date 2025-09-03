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

package nodes

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/compose"
	einoschema "github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

// InvokableNode is a basic workflow node that can Invoke.
// Invoke accepts non-streaming input and returns non-streaming output.
// It does not accept any options.
// Most nodes implement this, such as NodeTypePlugin.
type InvokableNode interface {
	Invoke(ctx context.Context, input map[string]any) (
		output map[string]any, err error)
}

// InvokableNodeWOpt is a workflow node that can Invoke.
// Invoke accepts non-streaming input and returns non-streaming output.
// It can accept NodeOption.
// e.g. NodeTypeLLM, NodeTypeSubWorkflow implement this.
type InvokableNodeWOpt interface {
	Invoke(ctx context.Context, in map[string]any, opts ...NodeOption) (
		map[string]any, error)
}

// StreamableNode is a workflow node that can Stream.
// Stream accepts non-streaming input and returns streaming output.
// It does not accept and options
// Currently NO Node implement this.
// A potential example would be streamable plugin for NodeTypePlugin.
type StreamableNode interface {
	Stream(ctx context.Context, in map[string]any) (
		*einoschema.StreamReader[map[string]any], error)
}

// StreamableNodeWOpt is a workflow node that can Stream.
// Stream accepts non-streaming input and returns streaming output.
// It can accept NodeOption.
// e.g. NodeTypeLLM implement this.
type StreamableNodeWOpt interface {
	Stream(ctx context.Context, in map[string]any, opts ...NodeOption) (
		*einoschema.StreamReader[map[string]any], error)
}

// CollectableNode is a workflow node that can Collect.
// Collect accepts streaming input and returns non-streaming output.
// It does not accept and options
// Currently NO Node implement this.
// A potential example would be a new condition node that makes decisions
// based on streaming input.
type CollectableNode interface {
	Collect(ctx context.Context, in *einoschema.StreamReader[map[string]any]) (
		map[string]any, error)
}

// CollectableNodeWOpt is a workflow node that can Collect.
// Collect accepts streaming input and returns non-streaming output.
// It accepts NodeOption.
// Currently NO Node implement this.
// A potential example would be a new batch node that accepts streaming input,
// process them, and finally returns non-stream aggregation of results.
type CollectableNodeWOpt interface {
	Collect(ctx context.Context, in *einoschema.StreamReader[map[string]any], opts ...NodeOption) (
		map[string]any, error)
}

// TransformableNode is a workflow node that can Transform.
// Transform accepts streaming input and returns streaming output.
// It does not accept and options
// e.g.
// NodeTypeVariableAggregator implements TransformableNode.
type TransformableNode interface {
	Transform(ctx context.Context, in *einoschema.StreamReader[map[string]any]) (
		*einoschema.StreamReader[map[string]any], error)
}

// TransformableNodeWOpt is a workflow node that can Transform.
// Transform accepts streaming input and returns streaming output.
// It accepts NodeOption.
// Currently NO Node implement this.
// A potential example would be an audio processing node that
// transforms input audio clips, but within the node is a graph
// composed by Eino, and the audio processing node needs to carry
// options for this inner graph.
type TransformableNodeWOpt interface {
	Transform(ctx context.Context, in *einoschema.StreamReader[map[string]any], opts ...NodeOption) (
		*einoschema.StreamReader[map[string]any], error)
}

// CallbackInputConverted converts node input to a form better suited for UI.
// The converted input will be displayed on canvas when test run,
// and will be returned when querying the node's input through OpenAPI.
type CallbackInputConverted interface {
	ToCallbackInput(ctx context.Context, in map[string]any) (*StructuredCallbackInput, error)
}

// CallbackOutputConverted converts node input to a form better suited for UI.
// The converted output will be displayed on canvas when test run,
// and will be returned when querying the node's output through OpenAPI.
type CallbackOutputConverted interface {
	ToCallbackOutput(ctx context.Context, out map[string]any) (*StructuredCallbackOutput, error)
}

type Initializer interface {
	Init(ctx context.Context) (context.Context, error)
}

type AdaptOptions struct {
	Canvas *vo.Canvas
}

type AdaptOption func(*AdaptOptions)

func WithCanvas(canvas *vo.Canvas) AdaptOption {
	return func(opts *AdaptOptions) {
		opts.Canvas = canvas
	}
}

func GetAdaptOptions(opts ...AdaptOption) *AdaptOptions {
	options := &AdaptOptions{}
	for _, opt := range opts {
		opt(options)
	}
	return options
}

// NodeAdaptor provides conversion from frontend Node to backend NodeSchema.
type NodeAdaptor interface {
	Adapt(ctx context.Context, n *vo.Node, opts ...AdaptOption) (
		*schema.NodeSchema, error)
}

// BranchAdaptor provides validation and conversion from frontend port to backend port.
type BranchAdaptor interface {
	ExpectPorts(ctx context.Context, n *vo.Node) []string
}

var (
	nodeAdaptors   = map[entity.NodeType]func() NodeAdaptor{}
	branchAdaptors = map[entity.NodeType]func() BranchAdaptor{}
)

func RegisterNodeAdaptor(et entity.NodeType, f func() NodeAdaptor) {
	nodeAdaptors[et] = f
}

func GetNodeAdaptor(et entity.NodeType) (NodeAdaptor, bool) {
	na, ok := nodeAdaptors[et]
	if !ok {
		panic(fmt.Sprintf("node type %s not registered", et))
	}
	return na(), ok
}

func RegisterBranchAdaptor(et entity.NodeType, f func() BranchAdaptor) {
	branchAdaptors[et] = f
}

func GetBranchAdaptor(et entity.NodeType) (BranchAdaptor, bool) {
	na, ok := branchAdaptors[et]
	if !ok {
		return nil, false
	}
	return na(), ok
}

type StreamGenerator interface {
	FieldStreamType(path compose.FieldPath, ns *schema.NodeSchema,
		sc *schema.WorkflowSchema) (schema.FieldStreamType, error)
}
