package gvalue

import (
	"sync"
	"unsafe"

	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/constraints"
)

// Zero returns zero value of type.
//
// The zero value is:
//
//   - 0	for numeric types,
//   - false for the boolean type
//   - "" (the empty string) for strings
//   - nil for reference/pointer type
func Zero[T any]() (v T) {
	return
}

// Max returns the maximum value of inputs.
//
// 🚀 EXAMPLE:
//
//	Max(1, 2)            ⏩ 2
//	Max(1, 2, 3)         ⏩ 3
//	Max("2", "10", "11") ⏩ "2"
func Max[T constraints.Ordered](x T, y ...T) T {
	max := x
	for _, v := range y {
		if v > max {
			max = v
		}
	}
	return max
}

// Min returns the minimum value of inputs.
//
// 🚀 EXAMPLE:
//
//	Min(1, 2)            ⏩ 1
//	Min(1, 2, 3)         ⏩ 1
//	Min("2", "10", "11") ⏩ "10"
func Min[T constraints.Ordered](x T, y ...T) T {
	min := x
	for _, v := range y {
		if v < min {
			min = v
		}
	}
	return min
}

// MinMax returns the minimum value and maximum value of inputs.
//
// 🚀 EXAMPLE:
//
//	MinMax(1, 2)            ⏩ 1, 2
//	MinMax(1, 2, 3)         ⏩ 1, 3
//	MinMax("2", "10", "11") ⏩ "10", "2"
func MinMax[T constraints.Ordered](x T, y ...T) (T, T) {
	min, max := x, x
	for _, v := range y {
		if min > v {
			min = v
		} else if max < v {
			max = v
		}
	}
	return min, max
}

// Deprecated: use [Min] please.
func MinN[T constraints.Ordered](x T, y ...T) T {
	return Min(x, y...)
}

// Deprecated: use [Max] please.
func MaxN[T constraints.Ordered](x T, y ...T) T {
	return Max(x, y...)
}

// Deprecated: use [MinMax] please.
func MinMaxN[T constraints.Ordered](x T, y ...T) (T, T) {
	return MinMax(x, y...)
}

// Clamp returns the value if value is within [min, max]; otherwise returns the nearest boundary.
// If min is greater than max, the behavior is undefined.
//
// 🚀 EXAMPLE:
//
//	Clamp(1, 2, 3)         ⏩ 2
//	Clamp(2, 1, 3)         ⏩ 2
//	Clamp(3, 1, 2)         ⏩ 2
//	Clamp("2", "10", "11") ⏩ "11"
func Clamp[T constraints.Ordered](value, min, max T) T {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

type xface struct {
	x    uintptr
	data unsafe.Pointer
}

// IsNil returns whether the given value v is nil.
//
// 💡 NOTE: Typed nil interface (such as fmt.Stringer((*net.IP)(nil))) is nil,
// although fmt.Stringer((*net.IP)(nil)) != nil.
//
// 🚀 EXAMPLE:
//
//	IsNil(nil)                           ⏩ true
//	IsNil(1)                             ⏩ false
//	IsNil((*int)(nil))                   ⏩ true
//	IsNil(fmt.Stringer((*net.IP)(nil)))  ⏩ true
//
// ⚠️ WARNING: This function is implemented using [unsafe].
func IsNil(v any) bool {
	return (*xface)(unsafe.Pointer(&v)).data == nil
}

// IsNotNil is negation of [IsNil].
func IsNotNil(v any) bool {
	return !IsNil(v)
}

// IsZero returns whether the given v is zero value.
//
// 💡 HINT: Refer to function [Zero] for explanation of zero value.
func IsZero[T comparable](v T) bool {
	return v == Zero[T]()
}

// IsNotZero is negation of [IsZero].
func IsNotZero[T comparable](v T) bool {
	return v != Zero[T]()
}

// Equal returns whether the given x and y are equal.
func Equal[T comparable](x, y T) bool {
	return x == y
}

// Add adds given values x and y and returns the sum.
// For string, Add performs concatenation.
func Add[T constraints.Number | constraints.Complex | ~string](x, y T) T {
	return x + y
}

// TypeAssert converts a value from type From to type To by [type assertion].
//
// ⚠️ WARNING: *Type assertion* is not type conversion/casting, it means that:
//
//  1. It may ❌PANIC❌ when type assertion failed
//  2. You can NOT cast int values to int8, can NOT cast int value to string
//  3. You can cast interface value to int if its internal value is an int
//
// 💡 NOTE: The first type parameter is result type (To), which means you can
// omit the original type (From) via type inference.
//
// 💡 HINT: Use [Cast] for type casting.
//
// [type assertion]: https://go.dev/tour/methods/15
func TypeAssert[To, From any](v From) To {
	return any(v).(To)
}

// TryAssert tries to convert a value from type From to type To by [type assertion].
func TryAssert[To, From any](v From) (To, bool) {
	to, ok := any(v).(To)
	return to, ok
}

// Cast does explicit type casting for value v.
// Such as int8 → int, int → float, etc.
//
// ⚠️ WARNING: If the value is outside the range that the To type can represent,
// overflow occurs.
//
// 🚀 EXAMPLE:
//
//	// float64 → int
//	Cast[int](1.2)          ⏩ (int)(1)
//	// int → int64
//	Cast[int64](1000)       ⏩ (int64)(1000)
//	// int64 → int
//	Cast[int](int64(1000))  ⏩ (int)(1000)
//	// int → int8
//	Cast[int8](1000)        ⏩ (int8)(-24) ⚠️ OVERFLOW⚠️
//
// 💡 NOTE: Only numeric types (int, int8, uint, uint8, float...) is supported
// due to the limitation of Go generics.
//
// 💡 NOTE: The first type parameter is result type (To), which means you can
// omit the original type (From) via type inference.
func Cast[To, From constraints.Number](v From) To {
	return To(v)
}

// Less returns true when x is less than y, otherwise false.
func Less[T constraints.Ordered](x, y T) bool {
	return x < y
}

// LessEqual returns true when x is less than or equal to y, otherwise false.
func LessEqual[T constraints.Ordered](x, y T) bool {
	return x <= y
}

// Greater returns true when x is greater than y, otherwise false.
func Greater[T constraints.Ordered](x, y T) bool {
	return x > y
}

// GreaterEqual returns true when x is greater than or equal to y, otherwise false.
func GreaterEqual[T constraints.Ordered](x, y T) bool {
	return x >= y
}

// Between returns true when v is within [min, max], otherwise false.
func Between[T constraints.Ordered](v, min, max T) bool {
	return v >= min && v <= max
}

// Once returns a function as value getter.
// Value is returned by function f, and f is invoked only once when returned
// function is firstly called.
//
// This function can be used to lazily initialize a value, as replacement of
// the packages-level init function. For example:
//
//	var DB *sql.DB
//
//	func init() {
//		// 💡 NOTE: DB is initialized here.
//		DB, _ = sql.Open("mysql", "user:password@/dbname")
//	}
//
//	func main() {
//		DB.Query(...)
//	}
//
// Can be rewritten to:
//
//	var DB = Once(func () *sql.DB {
//		return gresult.Of(sql.Open("mysql", "user:password@/dbname")).Value()
//	})
//
//	func main() {
//		// 💡 NOTE: DB is *LAZILY* initialized here.
//		DB().Query(...)
//	}
//
// 💡 HINT:
//
//   - See also https://github.com/golang/go/issues/56102
func Once[T any](f func() T) func() T {
	var (
		once sync.Once
		v    T
	)
	return func() T {
		once.Do(func() { v = f() })
		return v
	}
}
