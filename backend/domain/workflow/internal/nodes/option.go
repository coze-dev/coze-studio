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
	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

type NodeOptions struct {
	Nested *NestedWorkflowOptions
}

type NestedWorkflowOptions struct {
	optsForNested   []compose.Option
	toResumeIndexes map[int]compose.StateModifier
	optsForIndexed  map[int][]compose.Option
}

type NodeOption struct {
	apply func(opts *NodeOptions)

	implSpecificOptFn any
}

type NestedWorkflowOption func(*NestedWorkflowOptions)

func WithOptsForNested(opts ...compose.Option) NodeOption {
	return NodeOption{
		apply: func(options *NodeOptions) {
			if options.Nested == nil {
				options.Nested = &NestedWorkflowOptions{}
			}
			options.Nested.optsForNested = append(options.Nested.optsForNested, opts...)
		},
	}
}

func (c *NodeOptions) GetOptsForNested() []compose.Option {
	if c.Nested == nil {
		return nil
	}
	return c.Nested.optsForNested
}

func WithResumeIndex(i int, m compose.StateModifier) NodeOption {
	return NodeOption{
		apply: func(options *NodeOptions) {
			if options.Nested == nil {
				options.Nested = &NestedWorkflowOptions{}
			}
			if options.Nested.toResumeIndexes == nil {
				options.Nested.toResumeIndexes = map[int]compose.StateModifier{}
			}

			options.Nested.toResumeIndexes[i] = m
		},
	}
}

func (c *NodeOptions) GetResumeIndexes() map[int]compose.StateModifier {
	if c.Nested == nil {
		return nil
	}
	return c.Nested.toResumeIndexes
}

func WithOptsForIndexed(index int, opts ...compose.Option) NodeOption {
	return NodeOption{
		apply: func(options *NodeOptions) {
			if options.Nested == nil {
				options.Nested = &NestedWorkflowOptions{}
			}
			if options.Nested.optsForIndexed == nil {
				options.Nested.optsForIndexed = map[int][]compose.Option{}
			}
			options.Nested.optsForIndexed[index] = opts
		},
	}
}

func (c *NodeOptions) GetOptsForIndexed(index int) []compose.Option {
	if c.Nested == nil {
		return nil
	}
	return c.Nested.optsForIndexed[index]
}

// WrapImplSpecificOptFn is the option to wrap the implementation specific option function.
func WrapImplSpecificOptFn[T any](optFn func(*T)) NodeOption {
	return NodeOption{
		implSpecificOptFn: optFn,
	}
}

// GetCommonOptions extract model Options from Option list, optionally providing a base Options with default values.
func GetCommonOptions(base *NodeOptions, opts ...NodeOption) *NodeOptions {
	if base == nil {
		base = &NodeOptions{}
	}

	for i := range opts {
		opt := opts[i]
		if opt.apply != nil {
			opt.apply(base)
		}
	}

	return base
}

// GetImplSpecificOptions extract the implementation specific options from Option list, optionally providing a base options with default values.
// e.g.
//
//	myOption := &MyOption{
//		Field1: "default_value",
//	}
//
//	myOption := model.GetImplSpecificOptions(myOption, opts...)
func GetImplSpecificOptions[T any](base *T, opts ...NodeOption) *T {
	if base == nil {
		base = new(T)
	}

	for i := range opts {
		opt := opts[i]
		if opt.implSpecificOptFn != nil {
			optFn, ok := opt.implSpecificOptFn.(func(*T))
			if ok {
				optFn(base)
			}
		}
	}

	return base
}

type NestedWorkflowState struct {
	Index2Done          map[int]bool                   `json:"index_2_done,omitempty"`
	Index2InterruptInfo map[int]*compose.InterruptInfo `json:"index_2_interrupt_info,omitempty"`
	FullOutput          map[string]any                 `json:"full_output,omitempty"`
	IntermediateVars    map[string]any                 `json:"intermediate_vars,omitempty"`
}

func (c *NestedWorkflowState) String() string {
	s, _ := sonic.MarshalIndent(c, "", "  ")
	return string(s)
}

type NestedWorkflowAware interface {
	SaveNestedWorkflowState(key vo.NodeKey, state *NestedWorkflowState) error
	GetNestedWorkflowState(key vo.NodeKey) (*NestedWorkflowState, bool, error)
	InterruptEventStore
}
