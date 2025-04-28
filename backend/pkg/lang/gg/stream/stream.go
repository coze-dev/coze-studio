// Package stream provides a Stream type and its variants for stream processing.
//
// Please refer to README.md for details.
//
// Experimental: This package is experimental and may change in the future.
package stream

import (
	"context"

	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/collection/tuple"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/optional"
)

// Stream is a wrapper of [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Iter] with method
// chaining support.
//
// Stream has various variants like [Comparable], [Bool], [String] and etc.
// See README.md for more details.
type Stream[T any] struct {
	iter.Iter[T]
}

// FromIter wraps an [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Iter] to [Stream].
func FromIter[T any](i iter.Iter[T]) Stream[T] {
	return Stream[T]{i}
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.FromSlice].
func FromSlice[T any](s []T) Stream[T] {
	return FromIter(iter.FromSlice(s))
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.StealSlice].
func StealSlice[T any](s []T) Stream[T] {
	return FromIter(iter.StealSlice(s))
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.FromMapValues].
func FromMapValues[I comparable, T any](m map[I]T) Stream[T] {
	return FromIter(iter.FromMapValues(m))
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.FromChan].
func FromChan[T any](ctx context.Context, ch <-chan T) Stream[T] {
	return FromIter(iter.FromChan(ctx, ch))
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Repeat].
func Repeat[T any](v T) Stream[T] {
	return FromIter(iter.Repeat(v))
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.MapInplace].
func (s Stream[T]) Map(f func(T) T) Stream[T] {
	return FromIter(iter.MapInplace(f, s.Iter))
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Map].
func (s Stream[T]) MapToAny(f func(T) any) Stream[any] {
	return FromIter(iter.Map(f, s.Iter))
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.FlatMap].
func (s Stream[T]) FlatMap(f func(T) []T) Stream[T] {
	return FromIter(iter.FlatMap(f, s.Iter))
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.FlatMap].
func (s Stream[T]) FlatMapToAny(f func(T) []any) Stream[any] {
	return FromIter(iter.FlatMap(f, s.Iter))
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Fold].
func (s Stream[T]) Fold(f func(T, T) T, init T) T {
	return iter.Fold(f, init, s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Fold].
func (s Stream[T]) FoldToAnyWith(f func(any, T) any, init any) any {
	return iter.Fold(f, init, s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Reduce].
func (s Stream[T]) Reduce(f func(T, T) T) optional.O[T] {
	return iter.Reduce(f, s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Filter].
func (s Stream[T]) Filter(f func(T) bool) Stream[T] {
	return Stream[T]{iter.Filter(f, s.Iter)}
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.ForEach].
func (s Stream[T]) ForEach(f func(T)) {
	iter.ForEach(f, s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.ForEachIndexed].
func (s Stream[T]) ForEachIndexed(f func(int, T)) {
	iter.ForEachIndexed(f, s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Head].
func (s Stream[T]) Head() optional.O[T] {
	return iter.Head(s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Reverse].
func (s Stream[T]) Reverse() Stream[T] {
	return Stream[T]{iter.Reverse(s.Iter)}
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Take].
func (s Stream[T]) Take(n int) Stream[T] {
	return Stream[T]{iter.Take(n, s.Iter)}
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Drop].
func (s Stream[T]) Drop(n int) Stream[T] {
	return Stream[T]{iter.Drop(n, s.Iter)}
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.All].
func (s Stream[T]) All(f func(T) bool) bool {
	return iter.All(f, s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Any].
func (s Stream[T]) Any(f func(T) bool) bool {
	return iter.Any(f, s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Concat].
//
// BUG: This function is marked as "//go:noinline" bacause a community bug is
// triggered in [Tango Beast Mode], see https://code.byted.org/lang/go/issues/255
//
// [Tango Beast Mode]: https://bytedance.feishu.cn/wiki/wikcnoMjJbw3D9bV8aU8sDsJBNc
//
//go:noinline
func (s Stream[T]) Concat(ss ...Stream[T]) Stream[T] {
	is := iter.ToSlice(
		iter.TypeAssert[iter.Iter[T]](
			iter.Prepend(s,
				iter.FromSlice(ss))))
	return Stream[T]{iter.Concat(is...)}
}

// Iter[T] -> Peeker[T].
//
// BUG: This function is marked as "//go:noinline" bacause a community bug is
// triggered in [Tango Beast Mode], see https://code.byted.org/lang/go/issues/300
//
// [Tango Beast Mode]: https://bytedance.feishu.cn/wiki/wikcnoMjJbw3D9bV8aU8sDsJBNc
//
//go:noinline
func (s Stream[T]) toPeeker() iter.Peeker[T] {
	p, ok := s.Iter.(iter.Peeker[T])
	if !ok {
		p = iter.ToPeeker(s.Iter)
		s.Iter = p
	}
	return p
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Zip].
func (s Stream[T]) Zip(f func(T, T) T, another Stream[T]) Stream[T] {
	return Stream[T]{iter.Zip(f, s.toPeeker(), another.toPeeker())}
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Intersperse].
func (s Stream[T]) Intersperse(sep T) Stream[T] {
	return Stream[T]{iter.Intersperse(sep, s.Iter)}
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Append].
func (s Stream[T]) Append(tail T) Stream[T] {
	return Stream[T]{iter.Append(tail, s.Iter)}
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Prepend].
func (s Stream[T]) Prepend(head T) Stream[T] {
	return Stream[T]{iter.Prepend(head, s.Iter)}
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.ToSlice].
func (s Stream[T]) ToSlice() []T {
	return iter.ToSlice(s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.ToChan].
func (s Stream[T]) ToChan(ctx context.Context) <-chan T {
	return iter.ToChan(ctx, s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.ToBufferedChan].
func (s Stream[T]) ToBufferedChan(ctx context.Context, size int) <-chan T {
	return iter.ToBufferedChan(ctx, size, s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Find].
func (s Stream[T]) Find(f func(T) bool) optional.O[T] {
	return iter.Find(f, s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Count].
func (s Stream[T]) Count() int {
	return iter.Count(s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.TakeWhile].
func (s Stream[T]) TakeWhile(f func(T) bool) Stream[T] {
	return Stream[T]{iter.TakeWhile(f, s.toPeeker())}
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.DropWhile].
func (s Stream[T]) DropWhile(f func(T) bool) Stream[T] {
	return Stream[T]{iter.DropWhile(f, s.Iter)}
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.SortBy].
func (s Stream[T]) SortBy(less func(T, T) bool) Stream[T] {
	return Stream[T]{iter.SortBy(less, s.Iter)}
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.At].
func (s Stream[T]) At(idx int) optional.O[T] {
	return iter.At(idx, s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.UniqBy].
func (s Stream[T]) UniqBy(f func(T) any) Stream[T] {
	// 💡 NOTE: Please keep the implementation same to iter.UniqBy.
	met := make(map[any]struct{})
	return s.Filter(func(v T) bool {
		k := f(v)
		if _, ok := met[k]; ok {
			return false
		}
		met[k] = struct{}{}
		return true
	})
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Chunk].
//
// FIXME: Returning a Stream[[]T] causes instantiation cycle of type parameters.
func (s Stream[T]) Chunk(n int) [][]T {
	return iter.ToSlice((iter.Chunk(n, s.Iter)))
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.GroupBy].
func (s Stream[T]) GroupBy(f func(T) any) map[any][]T {
	// 💡 NOTE: Please keep the implementation same to iter.GroupBy.
	m := make(map[any][]T)
	for _, v := range s.Iter.Next(iter.ALL) {
		k := f(v)
		if vs, ok := m[k]; ok {
			m[k] = append(vs, v)
		} else {
			m[k] = []T{v}
		}
	}
	return m
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Divide].
//
// FIXME: Returning a Stream[[]T] causes instantiation cycle of type parameters.
func (s Stream[T]) Divide(n int) [][]T {
	return iter.ToSlice((iter.Divide(n, s.Iter)))
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Shuffle].
func (s Stream[T]) Shuffle() Stream[T] {
	return FromIter(iter.Shuffle(s.Iter))
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.MaxBy].
func (s Stream[T]) MaxBy(less func(T, T) bool) optional.O[T] {
	return iter.MaxBy(less, s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.MinBy].
func (s Stream[T]) MinBy(less func(T, T) bool) optional.O[T] {
	return iter.MinBy(less, s.Iter)
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.MinMaxBy].
func (s Stream[T]) MinMaxBy(less func(T, T) bool) optional.O[tuple.T2[T, T]] {
	return iter.MinMaxBy(less, s.Iter)
}
