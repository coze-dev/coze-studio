package tuple

// S2 is a slice of 2-ary tuple.
type S2[T0, T1 any] []T2[T0, T1]

// Values unpacks elements of tuple to slice.
func (s S2[T0, T1]) Values() ([]T0, []T1) {
	first := make([]T0, len(s))
	second := make([]T1, len(s))
	for i := range s {
		first[i], second[i] = s[i].Values()
	}
	return first, second
}
