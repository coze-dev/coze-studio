package stream

import (
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter"
)

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Join].
func (s String[T]) Join(sep T) T {
	return iter.Join(sep, s.Iter)
}
