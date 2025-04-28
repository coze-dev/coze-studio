// Package gutil provides generics utility types and functions.
//
// Deprecated: gutil used to place poorly categorized functions, for now,
// use package [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue] please.
package gutil

import (
	"fmt"

	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/constraints"
)

// Deprecated: use [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue.Zero] please.
func Zero[T any]() (v T) {
	return
}

// Deprecated: use [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gptr.Of] please.
func PtrOf[T any](v T) *T {
	return &v
}

// Deprecated: use [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gptr.Indirect] please.
func Indirect[T any](p *T) T {
	if p == nil {
		return Zero[T]()
	}
	return *p
}

// Deprecated: use [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gptr.IndirectOr] please.
func IndirectOr[T any](p *T, v T) T {
	if p == nil {
		return v
	}
	return *p
}

// Deprecated: use [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/choose.If] please.
func IfThen[T any](cond bool, trueVal T, falseVal T) T {
	if cond {
		return trueVal
	} else {
		return falseVal
	}
}

// ErrMustNil panics when the given error is not nil.
//
// ⚠️ WARNING: This method may ❌PANIC❌!
//
// Deprecated: rarely used.
func ErrMustNil(err error) {
	if err != nil {
		panic(fmt.Errorf("unexpected error: %s", err))
	}
}

// Deprecated: use [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue.Max] please.
func Max[T constraints.Ordered](a, b T) T {
	if a > b {
		return a
	} else {
		return b
	}
}

// Deprecated: use [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue.Min] please.
func Min[T constraints.Ordered](a, b T) T {
	if a < b {
		return a
	} else {
		return b
	}
}
