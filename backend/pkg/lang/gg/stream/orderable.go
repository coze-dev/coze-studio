package stream

import (
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/collection/tuple"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/optional"
)

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Max].
func (s Orderable[T]) Max() optional.O[T] {
	return iter.Max(s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Min].
func (s Orderable[T]) Min() optional.O[T] {
	return iter.Min(s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.MinMax].
func (s Orderable[T]) MinMax() optional.O[tuple.T2[T, T]] {
	return iter.MinMax(s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Sort].
func (s Orderable[T]) Sort() Orderable[T] {
	return FromOrderableIter(iter.Sort(s.Iter))
}
