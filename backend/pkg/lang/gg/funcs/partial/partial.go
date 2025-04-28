// Package partial implements partial application of functions by generic type and code generation.
//
// Experimental: This package is experimental and may change in the future.
//
// Please refer to README.md for details.
package partial

// Func is a function with 0 argument and 1 return value (nullary function).
type Func[R any] func() R

// Func1 is a function with 1 argument and 1 return value (unary function),
// which supports partial application.
type Func1[T1, R any] func(T1) R

// Make1 casts function f with 1 argument and 1 return value to Func1.
func Make1[T1, R any](f Func1[T1, R]) Func1[T1, R] {
	return f
}

// Partial binds the first argument (from left to right) of Func1 f to value t1,
// producing Func of smaller arity.
func (f Func1[T1, R]) Partial(t1 T1) Func[R] {
	return func() R {
		return f(t1)
	}
}

// PartialR binds the first argument (from right to left) of Func1 f to value t1,
// producing Func of smaller arity.
func (f Func1[T1, R]) PartialR(t1 T1) Func[R] {
	return func() R {
		return f(t1)
	}
}
