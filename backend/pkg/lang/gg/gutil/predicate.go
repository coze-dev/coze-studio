package gutil

import (
	"unsafe"

	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/constraints"
)

// IsType returns whether the given value v is of type T.
//
// When given a untyped nil (nil literal), false is returned.
// The function can deal with typed nil (such as (*int)(nil), nil interface
// with type) correctly.
//
//	IsType[int](0)
//	IsType[uint](0)
//	IsType[*int](nil)
//	IsType[*int]((*int)(nil))
//	IsType[fmt.String]((*net.IP)(nil))
//
// Returns:
//
//	true
//	false
//	false
//	true
//	true
//
// Deprecated: rarely used.
func IsType[T any](v any) bool {
	_, ok := (interface{})(v).(T)
	return ok
}

type xface struct {
	x    uintptr
	data unsafe.Pointer
}

// Deprecated: use [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue.IsNil] please.
func IsNil(v any) bool {
	return (*xface)(unsafe.Pointer(&v)).data == nil
}

// Deprecated: use [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue.IsNotNil] please.
func IsNotNil(v any) bool {
	return !IsNil(v)
}

// Deprecated: use [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue.IsZero] please.
func IsZero[T comparable](v T) bool {
	return v == Zero[T]()
}

func IsNotZero[T comparable](v T) bool {
	return v != Zero[T]()
}

// Deprecated: rarely used
func IsTrue[T ~bool](v T) bool {
	return bool(v)
}

// Deprecated: rarely used
func IsFalse[T ~bool](v T) bool {
	return !bool(v)
}

// Deprecated: use [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue.Equal] please.
func Equal[T comparable](a, b T) bool {
	return a == b
}

// Deprecated: rarely used.
func NotEqual[T comparable](a, b T) bool {
	return a != b
}

// Deprecated: use [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue.Less] please.
func Less[T constraints.Ordered](a, b T) bool {
	return a < b
}

// Deprecated: rarely used
func LessEqual[T constraints.Ordered](a, b T) bool {
	return a <= b
}

// Deprecated: use [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue.Greater] please.
func Greater[T constraints.Ordered](a, b T) bool {
	return a > b
}

// Deprecated: rarely used
func GreaterEqual[T constraints.Ordered](a, b T) bool {
	return a >= b
}
