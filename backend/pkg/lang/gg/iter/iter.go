// Package iter provides definition of generic iterator Iter and high-order functions.
//
// Please refer to README.md for details.
package iter

const (
	ALL = -1
)

// Iter is a generic iterator interface, which helps us iterating various
// data structure in same way.
//
// An Iter[T] can be wrapped as stream.Stream[T]
// see package [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/stream] for details.
//
// Users can apply various operations ([Map], [Filter], etc.) on custom data
// structures by implementing Iter for them.
// See ExampleIter_impl for details.
type Iter[T any] interface {
	// Next returns next N items of iterator when it is not empty.
	// When iterator is empty, nil is returned.
	// When n = [ALL] or n is greater than number of remaining elements,
	// all remaining are returned.
	//
	// The returned slice is owned by caller. So implementer should return a
	// newly allocated slice if needed.
	//
	// Passing in a negative n (except [ALL]) is undefined behavior.
	Next(n int) []T
}
