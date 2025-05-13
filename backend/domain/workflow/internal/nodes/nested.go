package nodes

import (
	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
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
