package iter

import (
	"sort"
	"strings"
	"unsafe"

	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/collection/tuple"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/constraints"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/fastrand"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/heapsort"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/rtassert"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/optional"
)

type mapIter[T1, T2 any] struct {
	f func(T1) T2
	i Iter[T1]
}

func (i *mapIter[T1, T2]) Next(n int) []T2 {
	vs := i.i.Next(n)
	if len(vs) == 0 {
		return nil
	}
	next := make([]T2, len(vs))
	for j := range next {
		next[j] = i.f(vs[j])
	}
	return next
}

// Map applies function f to each element of iterator i with Type T1.
// Results of f are returned as a new Iter with Type T2.
func Map[T1, T2 any](f func(T1) T2, i Iter[T1]) Iter[T2] {
	return &mapIter[T1, T2]{f, i}
}

type filterMapIter[T1, T2 any] struct {
	f func(T1) (T2, bool)
	i Iter[T1]
}

func (i *filterMapIter[T1, T2]) Next(n int) []T2 {
	vs := i.i.Next(n)
	if len(vs) == 0 {
		return nil
	}
	next := make([]T2, 0, len(vs)/2)
	for _, v := range vs {
		tmp, ok := i.f(v)
		if ok {
			next = append(next, tmp)
		}
	}
	return next
}

// FilterMap applies function f to each element of iterator i with Type T1.
// If f return false, the element i will be removed
// Results of f are returned as a new Iter with Type T2.
func FilterMap[T1, T2 any](f func(T1) (T2, bool), i Iter[T1]) Iter[T2] {
	return &filterMapIter[T1, T2]{f, i}
}

type mapInplaceIter[T any] struct {
	f func(T) T
	i Iter[T]
}

func (i *mapInplaceIter[T]) Next(n int) []T {
	next := i.i.Next(n)
	for j := range next {
		next[j] = i.f(next[j])
	}
	return next
}

// MapInplace is a closed [Map] operation, applies function f to each element.
// Results of f are returned as a new iterator with same type.
//
// 💡 HINT: MapInplace can reuse the underlying buffer of iterator,
// so it is more efficient than [Map].
func MapInplace[T any](f func(T) T, i Iter[T]) Iter[T] {
	return &mapInplaceIter[T]{f, i}
}

type flatMapIter[T1, T2 any] struct {
	f func(T1) []T2
	i Iter[T1]
	s []T2 // Buffer of function f's results.
}

func (i *flatMapIter[T1, T2]) Next(n int) []T2 {
	// Fastpath.
	if n == ALL {
		elems := i.i.Next(n)

		// Collect results of f.
		elemss := make([][]T2, 0, len(elems)+1)
		nNext := 0
		if len(i.s) != 0 {
			elemss = append(elemss, i.s)
			nNext += len(i.s)
		}
		for _, e := range elems {
			v := i.f(e)
			if len(v) == 0 {
				continue
			}
			elemss = append(elemss, v)
			nNext += len(v)
		}
		if len(elemss) == 0 {
			// Nothing to flatten.
			return nil
		}
		if len(elemss) == 1 {
			// No need to flatten.
			return elemss[0]
		}

		// Flatten the matrix.
		next := make([]T2, nNext)
		ptr := 0
		for _, s := range elemss {
			copy(next[ptr:], s)
			ptr += len(s)
		}

		return next
	}

	for len(i.s) < n {
		tmp := i.i.Next(1)
		// All element are consumed.
		if len(tmp) == 0 {
			n = len(i.s)
			break
		}
		extend(&i.s, i.f(tmp[0]))
	}
	next := i.s[:n]
	i.s = i.s[n:]
	return next
}

// FlatMap applies function f to each element of iterator i with Type T1.
// Results of f are flatten and returned as a new Iter with Type T2.
func FlatMap[T1, T2 any](f func(T1) []T2, i Iter[T1]) Iter[T2] {
	return &flatMapIter[T1, T2]{f, i, nil}
}

// filterIter filter elements in place.
type filterIter[T any] struct {
	f func(T) bool
	i Iter[T]
}

func (i *filterIter[T]) Next(n int) []T {
	// Read n elements at least.
	next := i.i.Next(n)
	empty := n == ALL || len(next) < n
	n = len(next)

	// Skip elements at the beginning that do not need to be moved.
	j := 0
	for ; j < len(next); j++ {
		if !i.f(next[j]) {
			break
		}
	}

	ptr := j
	if j < len(next) {
		todo := next[j+1:] // Unfiltered elements
		for j < len(next) {
			for k := 0; k < len(todo); k++ {
				if i.f(todo[k]) {
					next[ptr] = todo[k] // Move element
					ptr++
				}
			}

			// If the iterator is empty, or we have get enough(n) elements, leave the read loop
			if empty || ptr == n {
				break
			}
			// We need to return n element total, so read from iterator again.
			todo = i.i.Next(n - ptr)
			empty = len(todo) < n-ptr
		}
	}

	return next[:ptr]
}

// Filter applies predicate f to each element of iterator i,
// returns those elements that satisfy the predicate f as a new Iter.
func Filter[T any](f func(T) bool, i Iter[T]) Iter[T] {
	return &filterIter[T]{f, i}
}

// ForEach applies function f to each element of iterator i.
func ForEach[T any](f func(v T), i Iter[T]) {
	for _, v := range i.Next(ALL) {
		f(v)
	}
}

// ForEachIndexed applies function f to each element of iterator i.
// The argument i of function f represents the zero-based index of that element
// of iterator.
func ForEachIndexed[T any](f func(i int, v T), i Iter[T]) {
	for i, v := range i.Next(ALL) {
		f(i, v)
	}
}

// Fold applies function f cumulatively to each element of iterator i,
// so as to fold the Iter to a single value.
//
// An init element is needed as the initial value of accumulation.
func Fold[T1, T2 any](f func(T1, T2) T1, init T1, i Iter[T2]) T1 {
	res := init
	for _, v := range i.Next(ALL) {
		res = f(res, v)
	}
	return res
}

// Reduce is a variant of [Fold], use first element of iterator as the initial
// value of accumulation.
func Reduce[T any](f func(T, T) T, i Iter[T]) (r optional.O[T]) {
	vs := i.Next(1)
	if len(vs) == 0 {
		return
	}
	return optional.OK(Fold(f, vs[0], i))
}

// Head extracts the first element of iterator i.
func Head[T any](i Iter[T]) (r optional.O[T]) {
	vs := i.Next(1)
	if len(vs) == 0 {
		return
	}
	return optional.OK(vs[0])
}

// At returns the possible element at given 0-based index idx.
//
// ⚠️ WARNING: Panic when index < 0.
func At[T any](idx int, i Iter[T]) (r optional.O[T]) {
	rtassert.MustNotNeg(idx)
	// FIXME: O(n) space complexity
	next := i.Next(idx + 1)
	if len(next) <= idx {
		return
	}
	return optional.OK(next[idx])
}

// TODO: init, tail

type takeIter[T any] struct {
	i Iter[T]
	n int
}

func (i *takeIter[T]) Next(n int) []T {
	if n == 0 || i.n == 0 {
		return nil
	}
	if n == ALL || n > i.n {
		n = i.n
		i.n = 0
	} else {
		i.n -= n
	}
	return i.i.Next(n)
}

// Take returns the first n elements of iterator, or iterator itself if n > len(s).
//
// ⚠️ WARNING: Panic when n < 0.
func Take[T any](n int, i Iter[T]) Iter[T] {
	rtassert.MustNotNeg(n)
	return &takeIter[T]{i, n}
}

type dropIter[T any] struct {
	i Iter[T]
	n int
}

func (i *dropIter[T]) Next(n int) []T {
	if i.n != 0 {
		// Drop elements.
		_ = i.i.Next(i.n)
		i.n = 0
	}
	return i.i.Next(n)
}

// Drop drops the first n elements of iterator, returns the remaining part of
// slice, or empty iterator if n > len(s).
//
// ⚠️ WARNING: Panic when n < 0.
func Drop[T any](n int, i Iter[T]) Iter[T] {
	rtassert.MustNotNeg(n)
	return &dropIter[T]{i, n}
}

type reverseIter[T any] struct {
	i   Iter[T]
	s   []T // Reversed slice
	end int // Index of s, points to the last unreversed element
}

func (i *reverseIter[T]) Next(n int) []T {
	if n == 0 {
		return nil
	}
	if i.s == nil {
		i.s = i.i.Next(ALL)
		i.end = len(i.s) - 1
	}
	if n == ALL || n > len(i.s) {
		n = len(i.s)
	}
	if i.end > 0 {
		// Reverse i.s[0:min(n,end)]
		for j, k := 0, i.end; j < k && j < n; j, k = j+1, k-1 {
			i.s[j], i.s[k] = i.s[k], i.s[j]
		}
		// Minus 2n:
		// One n for moving pointer forward,
		// One n for rebasing pointer because part of buffer truncated and returned.
		i.end -= 2 * n
	}
	next := i.s[:n]
	i.s = i.s[n:]
	return next
}

// Reverse reverses the elements of iterator i.
func Reverse[T any](i Iter[T]) Iter[T] {
	return &reverseIter[T]{i: i}
}

// Max returns the maximum element of iterator i.
func Max[T constraints.Ordered](i Iter[T]) (r optional.O[T]) {
	vs := i.Next(1)
	if len(vs) == 0 {
		return
	}
	max := vs[0]
	for _, v := range i.Next(ALL) {
		if max < v {
			max = v
		}
	}
	return optional.OK(max)
}

// MaxBy returns the maximum element of iterator i determined by function less.
func MaxBy[T any](less func(T, T) bool, i Iter[T]) (r optional.O[T]) {
	vs := i.Next(1)
	if len(vs) == 0 {
		return
	}
	max := vs[0]
	for _, v := range i.Next(ALL) {
		if less(max, v) {
			max = v
		}
	}
	return optional.OK(max)
}

// Min returns the minimum element of iterator i.
func Min[T constraints.Ordered](i Iter[T]) (r optional.O[T]) {
	vs := i.Next(1)
	if len(vs) == 0 {
		return
	}
	min := vs[0]
	for _, v := range i.Next(ALL) {
		if min > v {
			min = v
		}
	}
	return optional.OK(min)
}

// MinBy returns the minimum element of iterator i determined by function less.
func MinBy[T any](less func(T, T) bool, i Iter[T]) (r optional.O[T]) {
	vs := i.Next(1)
	if len(vs) == 0 {
		return
	}
	min := vs[0]
	for _, v := range i.Next(ALL) {
		if less(v, min) {
			min = v
		}
	}
	return optional.OK(min)
}

// MinMax returns both minimum and maximum elements of iterator i.
//
// 💡 NOTE: The returned min and max elements may be the same object when each
// element of the iterator is equal
//
// 💡 AKA: Bound
func MinMax[T constraints.Ordered](i Iter[T]) (r optional.O[tuple.T2[T, T]]) {
	vs := i.Next(1)
	if len(vs) == 0 {
		return
	}
	min, max := vs[0], vs[0]
	for _, v := range i.Next(ALL) {
		if min > v {
			min = v
		} else if max < v {
			max = v
		}
	}
	return optional.OK(tuple.Make2(min, max))
}

// MinMaxBy returns both minimum and maximum elements of iterator i determined
// by function less.
//
// 💡 AKA: BoundBy
func MinMaxBy[T any](less func(T, T) bool, i Iter[T]) (r optional.O[tuple.T2[T, T]]) {
	vs := i.Next(1)
	if len(vs) == 0 {
		return
	}
	min, max := vs[0], vs[0]
	for _, v := range i.Next(ALL) {
		if less(v, min) {
			min = v
		} else if less(max, v) {
			max = v
		}
	}
	return optional.OK(tuple.Make2(min, max))
}

// All determines whether all elements of the iterator i satisfy the predicate f.
func All[T any](f func(T) bool, i Iter[T]) bool {
	for _, v := range i.Next(ALL) {
		if !f(v) {
			return false
		}
	}
	return true
}

// Any determines whether any (at least one) element of the iterator i
// satisfies the predicate f.
//
// Any supports short-circuit evaluation.
func Any[T any](f func(T) bool, i Iter[T]) bool {
	for _, v := range i.Next(ALL) {
		if f(v) {
			return true
		}
	}
	return false
}

// And determines whether all elements of the iterator i are true.
func And[T ~bool](i Iter[T]) bool {
	for _, v := range i.Next(ALL) {
		if !v {
			return false
		}
	}
	return true
}

// Or determines whether any (at least one) element of the iterator i is true.
//
// Or supports short-circuit evaluation.
func Or[T ~bool](i Iter[T]) bool {
	for _, v := range i.Next(ALL) {
		if v {
			return true
		}
	}
	return false
}

type concatIter[T any] struct {
	is []Iter[T]
}

func (i *concatIter[T]) Next(n int) []T {
	if n == 0 {
		return nil
	}

	// Fast path: concat all elements.
	if n == ALL {
		total := 0
		vss := make([][]T, len(i.is))
		for j := range i.is {
			vss[j] = i.is[j].Next(ALL)
			total += len(vss[j])
		}
		vs := make([]T, 0, total)
		for j := range vss {
			vs = append(vs, vss[j]...)
		}
		i.is = nil
		return vs
	}

	var next []T
	for len(i.is) != 0 && n > 0 {
		elems := i.is[0].Next(n)
		extend(&next, elems)
		if len(elems) != n {
			// Iterator i.is[0] is exhausted.
			i.is = i.is[1:]
		}
		n -= len(elems)
	}
	return next
}

// Concat concats all the elements of iterators.
func Concat[T any](is ...Iter[T]) Iter[T] {
	return &concatIter[T]{is: is}
}

type zipWithIter[T1, T2, T3 any] struct {
	i1 Peeker[T1]
	i2 Peeker[T2]
	f  func(T1, T2) T3
}

func (i *zipWithIter[T1, T2, T3]) Next(n int) []T3 {
	if n == 0 {
		return nil
	}

	// Try peek N elements from two iterators.
	var (
		vs1 []T1
		vs2 []T2
	)
	if n == ALL {
		// Iter may infinite elements,
		j := 0
		lit := 10000 * 10000 // TODO: use MaxInt?
		for j < lit {
			vs1 = i.i1.Peek(j)
			vs2 = i.i2.Peek(j)
			if len(vs1) != j || len(vs2) != j {
				// At least one iterator is empty
				break
			}
			j += 8
		}
		if j >= lit {
			panic("possible infinite elements")
		}
	} else {
		vs1 = i.i1.Peek(n)
		vs2 = i.i2.Peek(n)
	}

	// Mark nNext elements as consumed.
	nNext := gvalue.Min(len(vs1), len(vs2))
	if nNext == 0 {
		return nil
	}
	_ = i.i1.Next(nNext)
	_ = i.i2.Next(nNext)

	// Zip elements with function f.
	next := make([]T3, nNext)
	for j := range next {
		next[j] = i.f(vs1[j], vs2[j])
	}

	return next
}

// Zip applies the function f pairwise on each element of both iterators,
// Results of f are returned as a new iterator.
//
// If one iterator is shorter than the other, excess elements of the longer iterator
// are discarded, even if one of the lists is infinite.
func Zip[T1, T2, T3 any](f func(T1, T2) T3, a Peeker[T1], b Peeker[T2]) Iter[T3] {
	return &zipWithIter[T1, T2, T3]{a, b, f}
}

// TODO: Zip3

type intersperseIter[T any] struct {
	i       Peeker[T]
	sep     T
	needSep bool
}

func (i *intersperseIter[T]) Next(n int) []T {
	if n == 0 {
		return nil
	}

	// Elements that need to be separated.
	var elems []T
	// Total number of elements after adding separator.
	var nNext int
	if n == ALL {
		elems = i.i.Next(ALL)
		if len(elems) != 0 {
			nNext = len(elems)*2 - 1
		}
	} else if !i.needSep || n != 1 {
		// No need to read any element. when n == 1 && i.needSep.

		tmp := n
		if i.needSep {
			tmp--
		}
		// Calc number of elements to read.
		nElems := tmp/2 + tmp%2
		elems = i.i.Next(nElems)
		if len(elems) != 0 {
			nNext = len(elems)*2 - 1
		}
		if nNext < n && hasNext(i.i) {
			// If number of next elements is less than n, and the iterator is
			// not exhausted, add a slot for trailing separator.
			nNext++
		}
	}

	if i.needSep {
		nNext++
	}
	if nNext == 0 {
		return nil
	}
	next := make([]T, nNext)
	for j, k := 0, 0; j < len(next); j++ {
		if i.needSep {
			next[j] = i.sep
		} else {
			next[j] = elems[k]
			k++
		}
		i.needSep = !i.needSep
	}
	return next
}

// Intersperse intersperses value sep between the elements of iterator i.
func Intersperse[T any](sep T, i Iter[T]) Iter[T] {
	return &intersperseIter[T]{ToPeeker(i), sep, false}
}

type prependIter[T any] struct {
	i    Iter[T]
	head *T
}

func (i *prependIter[T]) Next(n int) []T {
	if n == 0 {
		return nil
	}
	if i.head != nil {
		if n != ALL {
			n--
		}
		v := *i.head
		i.head = nil
		return append([]T{v}, i.i.Next(n)...)
	}
	return i.i.Next(n)
}

// Prepend prepends value head to iterator i.
func Prepend[T any](head T, i Iter[T]) Iter[T] {
	return &prependIter[T]{i, &head}
}

type appendIter[T any] struct {
	i    Iter[T]
	tail *T
}

func (i *appendIter[T]) Next(n int) []T {
	vs := i.i.Next(n)
	if i.tail != nil && (n == ALL || len(vs) != n) {
		v := *i.tail
		i.tail = nil
		vs = append(vs, v)
	}
	return vs
}

// Append appends value tail to iterator i.
func Append[T any](tail T, i Iter[T]) Iter[T] {
	return &appendIter[T]{i, &tail}
}

// type cycleIter[T any] struct {
// 	i   Iter[T]
// 	idx int
// 	s   []T
// }
//
// func (i *cycleIter[T]) Next(n int) []T {
// 	if n == 0 {
// 		return nil
// 	}
// 	if n == ALL {
// 		panic("infinite elements")
// 	}
// 	var next []T
// 	var ptr int
// 	if i.idx != -1 {
// 		next = i.i.Next(n)
// 		i.s = append(i.s, next...)
// 		if len(next) == n { // Not empty
// 			return next
// 		}
// 		i.idx = 0
//
// 		// Copy to new buf.
// 		tmp := make([]T, n)
// 		copy(tmp, next)
// 		next = tmp
// 		ptr = len(tmp)
// 	} else {
// 		next = make([]T, n)
// 	}
//
// 	// Copy complete cycle sections
// 	if i.idx != 0 {
// 		copy(next[ptr:], i.s[i.idx:])
// 	}
// 	for n-ptr >= len(i.s) {
// 		copy(next[ptr:], i.s)
// 		ptr += len(i.s)
// 	}
// 	if n-ptr != 0 {
// 		copy(next[ptr:], i.s[n-ptr:])
// 	}
//
// 	return next
// }
//
// // Cycle ties a finite iterator i into a circular one.
// func Cycle[T any](i Iter[T]) Iter[T] {
// 	return &cycleIter[T]{i, 0, nil}
// }

// Join joins all elements in iterator i into a string with value sep as separator.
func Join[T ~string](sep T, i Iter[T]) T {
	ts := i.Next(ALL)
	ss := *(*[]string)(unsafe.Pointer(&ts))
	return T(strings.Join(ss, string(sep)))
}

// Cast does explicit type casting for elements of iterator i.
// Such as int8 → int, int → float, etc.
//
// ⚠️ WARNING: If the value is outside the range that the To type can represent,
// overflow occurs.
//
// 💡 HINT: See [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue.Cast] for more details.
func Cast[To, From constraints.Number](i Iter[From]) Iter[To] {
	return Map(gvalue.Cast[To, From], i)
}

// TypeAssert converts a iterator from type From to type To by type assertion.
//
// ⚠️ WARNING: Type assertion is not type conversion/casting.
// See [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue.TypeAssert] for more details.
//
// 🚀 EXAMPLE:
//
//	ToSlice(TypeAssert[int](FromSlice([]any{1, 2, 3}))) ⏩ []int{1, 2, 3}
//
// BUG: Can not inline due to https://code.byted.org/flow/opencoze/backend/pkg/lang/gg/issues/14
//
//go:noinline
func TypeAssert[To, From any](i Iter[From]) Iter[To] {
	return Map(gvalue.TypeAssert[To, From], i)
}

// Count returns the count of elements of iterator.
func Count[T any](i Iter[T]) int {
	return len(i.Next(ALL))
}

// Find returns the possible first element of iterator that satisfies predicate f.
func Find[T any](f func(T) bool, i Iter[T]) (r optional.O[T]) {
	for _, v := range i.Next(ALL) {
		if f(v) {
			return optional.OK(v)
		}
	}
	return
}

type takeWhileIter[T any] struct {
	i Peeker[T]
	f func(T) bool
}

func (i *takeWhileIter[T]) Next(n int) []T {
	if i.f == nil {
		return nil
	}
	vs := i.i.Peek(n)
	for j := range vs {
		if !i.f(vs[j]) {
			vs = vs[:j]
			i.f = nil
			break
		}
	}
	_ = i.i.Next(len(vs)) // Take elements
	return vs
}

// TakeWhile returns the longest prefix (possibly empty) of iterator i of
// elements that satisfy predicate f.
func TakeWhile[T any](f func(T) bool, i Peeker[T]) Iter[T] {
	return &takeWhileIter[T]{i, f}
}

type dropWhileIter[T any] struct {
	i    Iter[T]
	f    func(T) bool
	done bool
}

func (i *dropWhileIter[T]) Next(n int) []T {
	var init []T // The first few elements of iterator after it is dropped
	for i.f != nil {
		vs := i.i.Next(n)
		if len(vs) == 0 {
			return nil
		}
		for j := range vs {
			if !i.f(vs[j]) {
				i.f = nil
				init = vs[j:]
				break
			}
		}
	}
	if n != ALL && len(init) != n {
		// Read remaining elements.
		init = append(init, i.i.Next(n-len(init))...)
	}
	return init
}

// DropWhile returns the elements when the predicate f fails for the first time
// till the end of the iterator.
//
// In other words, it returns the suffix remaining after TakeWhile(f, i).
func DropWhile[T any](f func(T) bool, i Iter[T]) Iter[T] {
	return &dropWhileIter[T]{i, f, false}
}

// Impl sort.Interface.
type sortable[T any] struct {
	s []T
	f func(T, T) bool
}

func (s *sortable[T]) Len() int {
	return len(s.s)
}

func (s *sortable[T]) Less(i, j int) bool {
	return s.f(s.s[i], s.s[j])
}

func (s *sortable[T]) Swap(i, j int) {
	tmp := s.s[i]
	s.s[i] = s.s[j]
	s.s[j] = tmp
}

// SortBy sorts elements of iterators i with function less, returns a new iterator.
//
// TODO: SortBy is not lazy for now.
func SortBy[T any](less func(T, T) bool, i Iter[T]) Iter[T] {
	s := ToSlice(i)
	sort.Sort(&sortable[T]{s, less})
	return StealSlice(s)
}

// StableSortBy is variant of [SortBy], it keeps the original order of equal elements
// when sorting.
//
// TODO: StableSortBy is not lazy for now.
func StableSortBy[T any](less func(T, T) bool, i Iter[T]) Iter[T] {
	s := ToSlice(i)
	sort.Stable(&sortable[T]{s, less})
	return StealSlice(s)
}

// Sort sorts elements of iterators i, returns a new iterator.
//
// TODO: Sort is not lazy for now.
func Sort[T constraints.Ordered](i Iter[T]) Iter[T] {
	s := ToSlice(i)
	heapsort.Sort(s)
	return StealSlice(s)
}

// Contains returns whether the element occur in iterator.
func Contains[T comparable](v T, i Iter[T]) bool {
	for _, vv := range i.Next(ALL) {
		if v == vv {
			return true
		}
	}
	return false
}

// ContainsAny returns whether the any one of given elements occur in iterator.
func ContainsAny[T comparable](vs []T, i Iter[T]) bool {
	m := make(map[T]struct{}, len(vs))
	for _, v := range vs {
		m[v] = struct{}{}
	}
	for _, v := range i.Next(ALL) {
		if _, ok := m[v]; ok {
			return true
		}
	}
	return false
}

// ContainsAll returns whether the all of given elements occur in iterator.
func ContainsAll[T comparable](vs []T, i Iter[T]) bool {
	m := make(map[T]struct{}, len(vs))
	for _, v := range vs {
		m[v] = struct{}{}
	}
	for _, v := range i.Next(ALL) {
		delete(m, v)
		if len(m) == 0 {
			return true
		}
	}
	return len(m) == 0
}

const uniqRate = 80 // 80%, a

// Uniq returns the distinct elements of iterator.
// The result is a new iterators contains no duplicate elements.
func Uniq[T comparable](i Iter[T]) Iter[T] {
	return newFastpathIter(
		// full
		func() Iter[T] {
			elems := i.Next(ALL)
			met := make(map[T]struct{}, len(elems)*100/uniqRate)
			return Filter(func(v T) bool {
				if _, ok := met[v]; ok {
					return false
				}
				met[v] = struct{}{}
				return true
			}, StealSlice(elems))
		},
		// partial
		func() Iter[T] {
			met := make(map[T]struct{})
			return Filter(func(v T) bool {
				if _, ok := met[v]; ok {
					return false
				}
				met[v] = struct{}{}
				return true
			}, i)
		})
}

// UniqBy distinguishes different elements with key function f,
// returns the distinct elements of iterator.
// The result is a new iterators contains no duplicate elements.
func UniqBy[T any, K comparable](f func(T) K, i Iter[T]) Iter[T] {
	return newFastpathIter(
		// full
		func() Iter[T] {
			elems := i.Next(ALL)
			met := make(map[K]struct{}, len(elems)*100/uniqRate)
			return Filter(func(v T) bool {
				k := f(v)
				if _, ok := met[k]; ok {
					return false
				}
				met[k] = struct{}{}
				return true
			}, StealSlice(elems))
		},
		// partial
		func() Iter[T] {
			met := make(map[K]struct{})
			return Filter(func(v T) bool {
				k := f(v)
				if _, ok := met[k]; ok {
					return false
				}
				met[k] = struct{}{}
				return true
			}, i)
		})
}

// Dup returns the repeated elements of iterator.
// The result is a new iterators contains duplicate elements.
func Dup[T comparable](i Iter[T]) Iter[T] {
	return newFastpathIter(
		// full
		func() Iter[T] {
			elems := i.Next(ALL)
			// key not found: first meet; false: second meet now; true: duplicated
			met := make(map[T]bool, len(elems)*100/uniqRate)
			return Filter(func(v T) bool {
				return dupFilter(met, v)
			}, StealSlice(elems))
		},
		// partial
		func() Iter[T] {
			met := make(map[T]bool)
			return Filter(func(v T) bool {
				return dupFilter(met, v)
			}, i)
		})
}

// DupBy distinguishes repeated elements with key function f,
// returns the duplicate elements of iterator.
// The result is a new iterators contains duplicate elements.
func DupBy[T any, K comparable](f func(T) K, i Iter[T]) Iter[T] {
	return newFastpathIter(
		// full
		func() Iter[T] {
			elems := i.Next(ALL)
			// key not found: first meet; false: second meet now; true: duplicated
			met := make(map[K]bool, len(elems)*100/uniqRate)
			return Filter(func(v T) bool {
				return dupFilter(met, f(v))
			}, StealSlice(elems))
		},
		// partial
		func() Iter[T] {
			met := make(map[K]bool)
			return Filter(func(v T) bool {
				return dupFilter(met, f(v))
			}, i)
		})
}

// dupFilter determine whether the current element is retained based on the met.
func dupFilter[T comparable](met map[T]bool, k T) bool {
	isDup, ok := met[k]
	if ok && !isDup { // second meet
		met[k] = true
		return true
	}
	if !ok {
		met[k] = false
	}
	return false
}

// Sum returns the arithmetic sum of the elements of iterator i.
//
// 💡 NOTE: The returned type is still T, it may overflow for smaller types
// (such as int8, uint8).
func Sum[T constraints.Number](i Iter[T]) T {
	var sum T
	for _, v := range i.Next(ALL) {
		sum += v
	}
	return sum
}

// SumBy applies function f to each element of iterator i,
// returns the arithmetic sum of function result.
func SumBy[T any, N constraints.Number](f func(T) N, i Iter[T]) N {
	var sum N
	for _, v := range i.Next(ALL) {
		sum += f(v)
	}
	return sum
}

// Avg returns the arithmetic mean of elements of iterator i.
func Avg[T constraints.Number](i Iter[T]) float64 {
	next := i.Next(ALL)
	if len(next) == 0 {
		return 0
	}
	var sum float64
	for _, v := range next {
		sum += float64(v)
	}
	return sum / float64(len(next))
}

// AvgBy applies function f to each element of iterator i,
// returns the arithmetic mean of function result.
func AvgBy[T any, N constraints.Number](f func(T) N, i Iter[T]) float64 {
	next := i.Next(ALL)
	if len(next) == 0 {
		return 0
	}
	var sum float64
	for _, v := range next {
		sum += float64(f(v))
	}
	return sum / float64(len(next))
}

// extend extends slice s with elements elems, if slice s is empty, just use
// the given elems as new slice.
func extend[T any](s *[]T, elems []T) {
	// Nothing to do
	if len(elems) == 0 {
		return
	}
	if len(*s) == 0 {
		*s = elems
		return
	}
	*s = append(*s, elems...)
}

// GroupBy groups adjacent elements according to key returned by function f.
func GroupBy[K comparable, T any](f func(T) K, i Iter[T]) map[K][]T {
	m := make(map[K][]T)
	for _, v := range i.Next(ALL) {
		k := f(v)
		m[k] = append(m[k], v)
	}
	return m
}

// Remove removes all element v from the iterator i, returns a new iterator.
func Remove[T comparable](v T, i Iter[T]) Iter[T] {
	return Filter(func(x T) bool { return v != x }, i)
}

// Remove removes the first N element v from the iterator i, returns a new iterator.
func RemoveN[T comparable](v T, n int, i Iter[T]) Iter[T] {
	return Filter(func(x T) bool {
		if n <= 0 {
			return true
		}
		if v != x {
			return true
		}
		n--
		return false
	}, i)
}

type chunkIter[T any] struct {
	n int
	i Iter[T]
}

func (i *chunkIter[T]) Next(n int) [][]T {
	var next [][]T
	for n == ALL || n != 0 {
		v := i.i.Next(i.n)
		if len(v) == 0 {
			break
		}
		next = append(next, v)
		if len(v) != i.n {
			break
		}
		n--
	}
	return next
}

// Chunk splits a list into length-n chunks and returns chunks by a new iterator.
//
// The last chunk will be shorter if n does not evenly divide the length of the iterator.
//
// 💡 HINT: If you want to splits list into n chunks, use function [Divide].
func Chunk[T any](n int, i Iter[T]) Iter[[]T] {
	return &chunkIter[T]{n, i}
}

// Divide splits a list into exactly n chunks and returns chunks by a new iterator.
//
// The length of chunks will be different if n does not evenly divide the length
// of the iterator.
//
// 💡 HINT: If you want to splits list into length-n chunks, use function [Chunk].
func Divide[T any](n int, i Iter[T]) Iter[[]T] {
	elems := i.Next(ALL)
	k := len(elems) / n // Every chunk have at least k elements
	m := len(elems) % n // Thf first m chunks have a extra elements
	next := make([][]T, n)
	for i := 0; i < n; i++ {
		next[i] = elems[i*k+gvalue.Min(i, m) : (i+1)*k+gvalue.Min(i+1, m)]
	}
	return StealSlice(next)
}

// Shuffle pseudo-randomizes the order of elements of iterator i and returns a new iterator.
func Shuffle[T any](i Iter[T]) Iter[T] {
	next := i.Next(ALL)
	fastrand.Shuffle2(next)
	return StealSlice(next)
}

// compactIter compact elements in place.
type compactIter[T comparable] struct {
	i    Iter[T]
	zero T
}

func (i *compactIter[T]) Next(n int) []T {
	// Read n elements at least.
	next := i.i.Next(n)
	empty := n == ALL || len(next) < n
	n = len(next)

	// Skip elements at the beginning that do not need to be moved.
	j := 0
	for ; j < len(next); j++ {
		if next[j] == i.zero {
			break
		}
	}

	ptr := j
	if j < len(next) {
		todo := next[j+1:] // Uncompacted elements
		for j < len(next) {
			for k := 0; k < len(todo); k++ {
				if todo[k] != i.zero {
					next[ptr] = todo[k] // Move element
					ptr++
				}
			}

			// If the iterator is empty, or we have get enough(n) elements, leave the read loop
			if empty || ptr == n {
				break
			}
			// We need to return n element total, so read from iterator again.
			todo = i.i.Next(n - ptr)
			empty = len(todo) < n-ptr
		}
	}
	return next[:ptr]
}

// Compact removes all zero value from given iterator i, returns a new iterator.
//
// 💡 HINT: See [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/gvalue.Zero] for details of zero value.
func Compact[T comparable](i Iter[T]) Iter[T] {
	return &compactIter[T]{i: i}
}
