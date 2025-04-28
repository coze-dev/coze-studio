package optional

import (
	"encoding/json"
	"fmt"
	"reflect"

	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/collection/tuple"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/gutil"
)

// O represents a generic optional value: Every O is a value T([OK]),
// or nothing([Nil]).
type O[T any] struct {
	val T
	ok  bool
}

// Of creates a optional value with type T from tuple (T, bool).
//
// Of is used to wrap result of "func () (T, bool)", see README.md for more detail.
//
// 💡 NOTE: If the given bool is false, the value of T MUST be zero value of T,
// Otherwise this will be an undefined behavior.
func Of[T any](v T, ok bool) O[T] {
	return O[T]{v, ok}
}

// Of2 is a variant of function [Of], creates a optional value from tuple (T1, T2, bool).
func Of2[T1, T2 any](v1 T1, v2 T2, ok bool) O[tuple.T2[T1, T2]] {
	return O[tuple.T2[T1, T2]]{tuple.Make2(v1, v2), ok}
}

// Of3 is a variant of function [Of], creates a optional value from tuple (T1, T2, T3, bool).
func Of3[T1, T2, T3 any](v1 T1, v2 T2, v3 T3, ok bool) O[tuple.T3[T1, T2, T3]] {
	return O[tuple.T3[T1, T2, T3]]{tuple.Make3(v1, v2, v3), ok}
}

// OfPtr is a variant of function [Of], creates a optional value from pointer v.
//
// If v != nil, returns value that the pointer points to, else returns nothing.
func OfPtr[T any](v *T) O[T] {
	if v == nil {
		return Nil[T]()
	}
	return OK(*v)
}

// OK creates an optional value O containing value v.
func OK[T any](v T) O[T] {
	return O[T]{v, true}
}

// Ok is alias of [OK].
//
// Deprecated: use function [OK] instead.
func Ok[T any](v T) O[T] {
	return OK(v)
}

// Nil creates an optional value O containing nothing.
func Nil[T any]() O[T] {
	return O[T]{}
}

// Must returns internal value of O. ❌PANIC❌ when the O contains nothing.
//
// ⚠️ WARNING: This method may ❌PANIC❌!
func (o O[T]) Must() T {
	if !o.ok {
		panic(fmt.Errorf("no valid value in optional.O[%s]", o.typ()))
	}
	return o.val
}

// Value returns internal value of O.
func (o O[T]) Value() T {
	return o.val
}

// ValueOr returns internal value of O.
// Custom value v is returned when O contains nothing.
func (o O[T]) ValueOr(v T) T {
	return gutil.IfThen(o.ok, o.val, v)
}

// ValueOrZero returns internal value of O.
// Zero value is returned when O contains nothing.
//
// 💡 HINT: Refer to function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue.Zero]
// for explanation of zero value.
func (o O[T]) ValueOrZero() T {
	return gutil.IfThen(o.ok, o.val, gutil.Zero[T]())
}

// Ptr returns a pointer that points to the internal value of optional value O[T].
// Nil is returned when it contains nothing.
//
// 💡 NOTE: DON'T NOT modify the internal value through the pointer,
// it won't work as you expect because the optional value is proposed to used as value,
// when you call method on it, it is copied.
func (o O[T]) Ptr() *T {
	if !o.ok {
		return nil
	}
	return &o.val
}

// Ok is alias of [O.IsOK].
//
// Deprecated: use method [O.IsOK] instead.
func (o O[T]) Ok() bool {
	return o.IsOK()
}

// Get returns the optional value in (value, ok) form.
func (o O[T]) Get() (T, bool) {
	return o.val, o.ok
}

// IsOK returns true when O contains value, otherwise false.
func (o O[T]) IsOK() bool {
	return o.ok
}

// IsNil returns true when O contains nothing, otherwise false.
func (o O[T]) IsNil() bool {
	return !o.ok
}

// IfOK calls function f when O contains value, otherwise do nothing.
func (o O[T]) IfOK(f func(T)) {
	if o.ok {
		f(o.val)
	}
}

// IfOk is alias of [O.IfOK].
//
// Deprecated: use method [IfOK] instead.
func (o O[T]) IfOk(f func(T)) {
	if o.ok {
		f(o.val)
	}
}

// IfNil calls function f when O contains nil, otherwise do nothing.
func (o O[T]) IfNil(f func()) {
	if !o.ok {
		f()
	}
}

// typ returns the string representation of type of optional value.
func (o O[T]) typ() string {
	typ := reflect.TypeOf(gutil.Zero[T]())
	if typ == nil {
		return "any"
	}
	return typ.String()
}

// String implements [fmt.Stringer].
func (o O[T]) String() string {
	if !o.ok {
		return fmt.Sprintf("optional.Nil[%s]()", o.typ())
	}
	return fmt.Sprintf("optional.OK[%s](%v)", o.typ(), o.val)
}

// MarshalJSON implements [encoding/json.Marshaler].
//
// Experimental: This API is experimental and may change in the future.
func (o O[T]) MarshalJSON() ([]byte, error) {
	if !o.ok {
		return []byte("null"), nil
	}
	return json.Marshal(o.val)
}

// UnmarshalJSON implements [encoding/json.Unmarshaler].
//
// Experimental: This API is experimental and may change in the future.
func (o *O[T]) UnmarshalJSON(data []byte) error {
	// Unmarshalers implement UnmarshalJSON([]byte("null")) as a no-op.
	if string(data) == "null" {
		return nil
	}
	if err := json.Unmarshal(data, &o.val); err != nil {
		return err
	}
	o.ok = true
	return nil
}

// Map applies function f to value of optional value O[F] if it contains value.
// Otherwise, Nil[T]() is returned.
func Map[F, T any](o O[F], f func(F) T) O[T] {
	if !o.ok {
		return Nil[T]()
	}
	return Ok(f(o.val))
}

// Then calls function f and returns its result if O[F] contains value.
// Otherwise, Nil[T]() is returned.
//
// 💡 HINT: This function is similar to the Rust's std::option::Option.and_then
func Then[F, T any](o O[F], f func(F) O[T]) O[T] {
	if !o.ok {
		return Nil[T]()
	}
	return f(o.val)
}
