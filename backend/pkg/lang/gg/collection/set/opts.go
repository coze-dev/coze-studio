package set

// Option is option for constructing a set.
//
// See also: https://golang.cafe/blog/golang-functional-options-pattern.html
type Option[T comparable] func(*Set[T])

// Members is an [Option] for specifying initial members for Set.
func Members[T comparable](members ...T) Option[T] {
	return func(s *Set[T]) {
		// The internal map may already be created via previous Option.
		if s.m == nil {
			s.m = make(map[T]struct{}, len(members))
		}
		for _, v := range members {
			s.m[v] = struct{}{}
		}
	}
}

// Selector is an [Option], for selecting initial members from slice using function selector.
func Selector[F any, T comparable](slice []F, selector func(F) T) Option[T] {
	return func(s *Set[T]) {
		// The internal map may already be created via previous Option.
		if s.m == nil {
			s.m = make(map[T]struct{}, len(slice))
		}
		for _, v := range slice {
			s.m[selector(v)] = struct{}{}
		}
	}
}

// TODO: Mutex, InternalMap
