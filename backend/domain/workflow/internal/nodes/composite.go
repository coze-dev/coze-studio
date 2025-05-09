package nodes

import "github.com/cloudwego/eino/compose"

type CompositeOptions struct {
	optsForInner []compose.Option
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
