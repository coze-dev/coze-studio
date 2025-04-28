package stream

import (
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/constraints"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter"
)

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Range].
func Range[T constraints.Number](start, stop T) Number[T] {
	return FromNumberIter(iter.Range(start, stop))
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.RangeWithStep].
func RangeWithStep[T constraints.Number](start, stop, step T) Number[T] {
	return FromNumberIter(iter.RangeWithStep(start, stop, step))
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Sum].
func (s Number[T]) Sum() T {
	return iter.Sum(s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Avg].
func (s Number[T]) Avg() float64 {
	return iter.Avg(s.Iter)
}
