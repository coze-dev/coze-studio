package iter

import (
	"context"

	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/collection/tuple"
)

// ToSlice collects elements of iterator to a slice.
//
// If the iterator is empty, empty slice []T{} is returned.
func ToSlice[T any](i Iter[T]) []T {
	all := i.Next(ALL)
	if all == nil {
		return []T{} // Always returns a slice
	} else {
		return all
	}
}

// ToMap collects elements of iterator i to a map,
// both map keys and values are produced by mapping function f.
//
// If the iterator is empty, empty map map[K]V{} is returned.
func ToMap[K comparable, V, T any](f func(T) (K, V), i Iter[T]) map[K]V {
	s := i.Next(ALL)
	m := make(map[K]V, len(s)/2)
	for _, e := range s {
		k, v := f(e)
		m[k] = v
	}
	return m
}

// ToMapValues collects elements of iterator to values of map,
// the map keys are produced by mapping function f.
//
// If the iterator is empty, empty map map[K]T{} is returned.
func ToMapValues[K comparable, T any](f func(T) K, i Iter[T]) map[K]T {
	s := i.Next(ALL)
	m := make(map[K]T, len(s)/2)
	for _, e := range s {
		m[f(e)] = e
	}
	return m
}

// KVToMap collects elements of iterator to a map.
//
// If the iterator is empty, empty map map[K]V{} is returned.
func KVToMap[K comparable, V any](i Iter[tuple.T2[K, V]]) map[K]V {
	return ToMap(func(v tuple.T2[K, V]) (K, V) { return v.Values() }, i)
}

// ToChan collects elements of iterator to a chan.
// The returned channel will be closed when iterator is exhausted.
func ToChan[T any](ctx context.Context, i Iter[T]) <-chan T {
	ch := make(chan T)
	go func() {
		for {
			s := i.Next(1)
			if len(s) == 0 {
				close(ch)
				return
			}
			select {
			case ch <- s[0]:
			case <-ctx.Done():
				close(ch)
				return
			}
		}
	}()
	return ch
}

// ToBufferedChan collects elements of iterator to  a buffered chan with given size.
//
// The returned channel will be closed when iterator is exhausted.
func ToBufferedChan[T any](ctx context.Context, size int, i Iter[T]) <-chan T {
	ch := make(chan T, size)
	go func() {
		for {
			s := i.Next(size)
			empty := len(s) != size
			for _, v := range s {
				select {
				case ch <- v:
				case <-ctx.Done():
					close(ch)
					return
				}
			}
			if empty {
				close(ch)
				return
			}
		}
	}()
	return ch
}
