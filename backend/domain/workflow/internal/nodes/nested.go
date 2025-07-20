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

type NestedWorkflowOptions struct {
	optsForNested   []compose.Option
	toResumeIndexes map[int]compose.StateModifier
	optsForIndexed  map[int][]compose.Option
}

type NestedWorkflowOption func(*NestedWorkflowOptions)

func WithOptsForNested(opts ...compose.Option) NestedWorkflowOption {
	return func(o *NestedWorkflowOptions) {
		o.optsForNested = append(o.optsForNested, opts...)
	}
}

func (c *NestedWorkflowOptions) GetOptsForNested() []compose.Option {
	return c.optsForNested
}

func WithResumeIndex(i int, m compose.StateModifier) NestedWorkflowOption {
	return func(o *NestedWorkflowOptions) {
		if o.toResumeIndexes == nil {
			o.toResumeIndexes = map[int]compose.StateModifier{}
		}

		o.toResumeIndexes[i] = m
	}
}

func (c *NestedWorkflowOptions) GetResumeIndexes() map[int]compose.StateModifier {
	return c.toResumeIndexes
}

func WithOptsForIndexed(index int, opts ...compose.Option) NestedWorkflowOption {
	return func(o *NestedWorkflowOptions) {
		if o.optsForIndexed == nil {
			o.optsForIndexed = map[int][]compose.Option{}
		}
		o.optsForIndexed[index] = opts
	}
}

func (c *NestedWorkflowOptions) GetOptsForIndexed(index int) []compose.Option {
	if c.optsForIndexed == nil {
		return nil
	}
	return c.optsForIndexed[index]
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
