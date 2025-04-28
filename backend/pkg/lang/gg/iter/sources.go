package iter

import (
	"context"
	"math"

	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/collection/tuple"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/constraints"
)

var (
	_ Iter[int]                   = &sliceIter[int]{}
	_ Iter[tuple.T2[string, int]] = &mapKeyValueIter[string, int]{}
	_ Iter[string]                = &mapKeyIter[string, int]{}
	_ Iter[int]                   = &mapValueIter[string, int]{}
	_ Iter[int]                   = &chanIter[int]{}
	_ Iter[int]                   = &rangeIter[int]{}
	_ Iter[int]                   = &repeatIter[int]{}
)

type sliceIter[T any] struct {
	s []T
}

func (i *sliceIter[T]) Next(n int) []T {
	if n == ALL || n > len(i.s) {
		n = len(i.s)
	}
	next := make([]T, n)
	copy(next, i.s[:n])
	i.s = i.s[n:]
	return next
}

// FromSlice constructs an Iter from slice s, in order from left to right.
// An empty Iter (without element) is returned if the given slice is empty
// or nil.
func FromSlice[T any](s []T) Iter[T] {
	return &sliceIter[T]{s}
}

type stealSliceIter[T any] struct {
	s []T
}

func (i *stealSliceIter[T]) Next(n int) []T {
	if n == ALL || n > len(i.s) {
		n = len(i.s)
	}
	next := i.s[:n]
	i.s = i.s[n:]
	return next
}

func StealSlice[T any](s []T) Iter[T] {
	return &stealSliceIter[T]{s}
}

type mapKeyValueIter[K comparable, V any] struct {
	i *unsafeMapIter[K, V]
}

func (i *mapKeyValueIter[K, V]) Next(n int) []tuple.T2[K, V] {
	keys, values := i.i.Next(n, true, true)
	// len(keys) must equal to len(value)
	if len(keys) == 0 {
		return nil
	}
	next := make([]tuple.T2[K, V], len(keys))
	for i := 0; i < len(next); i++ {
		next[i] = tuple.Make2(keys[i], values[i])
	}
	return next
}

// FromMap constructs an Iter of (key, value) pair from map m.
//
// 💡 NOTE: Function follows the same iteration semantics as a range statement.
// See https://go.dev/blog/maps#iteration-order for details.
func FromMap[K comparable, V any](m map[K]V) Iter[tuple.T2[K, V]] {
	return &mapKeyValueIter[K, V]{newUnsafeMapIter(m)}
}

type mapKeyIter[K comparable, V any] struct {
	i *unsafeMapIter[K, V]
}

func (i *mapKeyIter[K, V]) Next(n int) []K {
	next, _ := i.i.Next(n, true, false)
	return next
}

// FromMapKeys constructs an Iter of map's key from map m.
//
// 💡 NOTE: Function follows the same iteration semantics as a range statement.
// See https://go.dev/blog/maps#iteration-order for details.
func FromMapKeys[K comparable, V any](m map[K]V) Iter[K] {
	return &mapKeyIter[K, V]{newUnsafeMapIter(m)}
}

type mapValueIter[K comparable, V any] struct {
	i *unsafeMapIter[K, V]
}

func (i *mapValueIter[K, V]) Next(n int) []V {
	_, next := i.i.Next(n, false, true)
	return next
}

// FromMapValues constructs an Iter of map's value from map m.
//
// 💡 NOTE: Function follows the same iteration semantics as a range statement.
// See https://go.dev/blog/maps#iteration-order for details.
func FromMapValues[K comparable, V any](m map[K]V) Iter[V] {
	return &mapValueIter[K, V]{newUnsafeMapIter(m)}
}

type chanIter[T any] struct {
	ctx context.Context
	ch  <-chan T
}

func (i *chanIter[T]) Next(n int) (r []T) {
	if n == 0 {
		return
	}

	if n == ALL {
		for {
			select {
			case <-i.ctx.Done():
				return
			case v, ok := <-i.ch:
				if !ok {
					return
				}
				r = append(r, v)
			}
		}
	}

	r = make([]T, 0, n)
	for j := 0; j < n; j++ {
		select {
		case <-i.ctx.Done():
			return
		case v, ok := <-i.ch:
			if !ok {
				return
			}
			r = append(r, v)
		}
	}
	return
}

// FromChan constructs an Iter from channel ch.
// Elements in Iter are exhausted when the context is done or given channel is closed.
// FIXME: better doc
func FromChan[T any](ctx context.Context, ch <-chan T) Iter[T] {
	return &chanIter[T]{ctx, ch}
}

type rangeIter[T constraints.Number] struct {
	cur  T
	stop T
	step T
}

func (i *rangeIter[T]) Next(n int) (r []T) {
	intervalLen := math.Abs(float64(i.stop - i.cur))
	step := math.Abs(float64(i.step))
	l := int(math.Ceil(intervalLen / step))

	if n == 0 || l == 0 {
		return
	}

	if n == ALL || n > l {
		n = l
	}

	j := 0
	r = make([]T, n)
	for j < n {
		r[j] = i.cur
		i.cur += i.step
		j++
	}
	return
}

// Range is a variant of RangeWithStep, with predefined step 1.
func Range[T constraints.Number](start, stop T) Iter[T] {
	return RangeWithStep(start, stop, 1)
}

// RangeWithStep constructs an Iter of number from start (inclusive) to stop (exclusive)
// by step.
// If the interval does not exist, RangeWithStep returns an emptyIter.
func RangeWithStep[T constraints.Number](start, stop, step T) Iter[T] {
	if step == 0 || (step > 0 && start >= stop) || (step < 0 && start <= stop) {
		return emptyIter[T]{}
	}
	return &rangeIter[T]{start, stop, step}
}

type repeatIter[T any] struct {
	v T
}

func (i *repeatIter[T]) Next(n int) (r []T) {
	if n == ALL {
		panic("infinite elements")
	}
	r = make([]T, 0, n)
	for j := 0; j < n; j++ {
		r = append(r, i.v)
	}
	return
}

// Repeat constructs an infinite Iter, with v the value of every element.
func Repeat[T any](v T) Iter[T] {
	return &repeatIter[T]{v}
}
