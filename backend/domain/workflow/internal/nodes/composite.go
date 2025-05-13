package nodes

import (
	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type CompositeOptions struct {
	optsForInner    []compose.Option
	toResumeIndexes map[int]compose.StateModifier
}

type CompositeOption func(*CompositeOptions)

func WithOptsForInner(opts ...compose.Option) CompositeOption {
	return func(o *CompositeOptions) {
		o.optsForInner = append(o.optsForInner, opts...)
	}
}

func (c *CompositeOptions) GetOptsForInner() []compose.Option {
	return c.optsForInner
}

func WithResumeIndex(i int, m compose.StateModifier) CompositeOption {
	return func(o *CompositeOptions) {
		if o.toResumeIndexes == nil {
			o.toResumeIndexes = map[int]compose.StateModifier{}
		}

		o.toResumeIndexes[i] = m
	}
}

func (c *CompositeOptions) GetResumeIndexes() map[int]compose.StateModifier {
	return c.toResumeIndexes
}

type CompositeState struct {
	Index2Done          map[int]bool                   `json:"index_2_done,omitempty"`
	Index2InterruptInfo map[int]*compose.InterruptInfo `json:"index_2_interrupt_info,omitempty"`
	FullOutput          map[string]any                 `json:"full_output,omitempty"`
}

func (c *CompositeState) String() string {
	s, _ := sonic.MarshalIndent(c, "", "  ")
	return string(s)
}

type CompositeAware interface {
	SaveCompositeState(key vo.NodeKey, state *CompositeState) error
	GetCompositeState(key vo.NodeKey) (*CompositeState, bool, error)
	InterruptEventStore
}
