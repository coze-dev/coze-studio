package choose

import (
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/gslice"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/optional"
)

// If returns onTrue when cond is true, otherwise returns onFalse.
// It is used as replacement of ternary conditional operator (:?) in many other
// programming languages.
//
// ⚠️ WARNING: onTrue and onFalse always be evaluated regardless of the truth
// of cond. Use [IfLazy], [IfLazyL], and [IfLazyR] if you need lazy evaluation.
//
// 🚀 EXAMPLE:
//
//	If(true, 1, 2)                       ⏩ 1
//	If(false, 1, 2)                      ⏩ 2
//	If(p != nil, p.foo, nil)             ⏩ ❌PANIC❌
//	If(true, 1, default())               ⏩ 1 // ⚠️ but func default is always evaluated
func If[T any](cond bool, onTrue, onFalse T) T {
	if cond {
		return onTrue
	} else {
		return onFalse
	}
}

// Lazy is a value type that evaluates only when needed.
type Lazy[T any] func() T

// [IfLazy] is a variant of [If], accepts [Lazy] values.
//
// 🚀 EXAMPLE:
//
//	v1 := func() int {return 1}
//	v2 := func() int {return 2}
//	vp := func () int { panic("") }
//	IfLazy(true, v1, v2)   ⏩ 1
//	IfLazy(false, v1, v2)  ⏩ 2
//	IfLazy(true, v1, vp)   ⏩ 1 // won't panic
//	IfLazy(false, vp, v2)  ⏩ 2 // won't panic
func IfLazy[T any](cond bool, onTrue, onFalse Lazy[T]) T {
	if cond {
		return onTrue()
	} else {
		return onFalse()
	}
}

// IfLazyL is a variant of [If], accepts [Lazy] onTrue value.
func IfLazyL[T any](cond bool, onTrue Lazy[T], onFalse T) T {
	if cond {
		return onTrue()
	} else {
		return onFalse
	}
}

// IfLazyR is a variant of [If], accepts [Lazy] onFalse value.
func IfLazyR[T any](cond bool, onTrue T, onFalse Lazy[T]) T {
	if cond {
		return onTrue
	} else {
		return onFalse()
	}
}

// NotZero returns the first non-zero value, otherwise returns nil.
func NotZero[T comparable](v ...T) optional.O[T] {
	return gslice.Find(v, gvalue.IsNotZero[T])
}
