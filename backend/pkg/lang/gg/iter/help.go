package iter

// emptyIter returns nil whenever its Next method is called.
// It can be as a default abnormal behavior when implements Iter.
// For example, in RangeWithStep, if the internal does not exist, it will return emptyIter,
// so the returned Iter works normally in silence in the subsequent iterator chain.
type emptyIter[T any] struct{}

func (i emptyIter[T]) Next(_ int) []T {
	return nil
}
