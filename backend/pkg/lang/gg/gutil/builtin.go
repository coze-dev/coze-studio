package gutil

import "code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/constraints"

// Add adds given values a and b and returns the sum.
// For string, Add is concatenation.
//
// Deprecated: use [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue.Add] please.
func Add[T constraints.Number | constraints.Complex | ~string](a, b T) T {
	return a + b
}
