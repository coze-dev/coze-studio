package stream

import (
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter"
)

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.And].
func (s Bool[T]) And() bool {
	return iter.And(s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Or].
func (s Bool[T]) Or() bool {
	return iter.Or(s.Iter)
}
