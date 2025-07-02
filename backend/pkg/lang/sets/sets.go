package sets

type Set[T comparable] map[T]struct{}

func FromSlice[T comparable](s []T) Set[T] {
	set := make(Set[T], len(s))
	for _, elem := range s {
		cpElem := elem
		set[cpElem] = struct{}{}
	}
	return set
}

func (s Set[T]) ToSlice() []T {
	sl := make([]T, 0, len(s))
	for elem := range s {
		cpElem := elem
		sl = append(sl, cpElem)
	}
	return sl
}

func (s Set[T]) Contains(elem T) bool {
	_, ok := s[elem]
	return ok
}
