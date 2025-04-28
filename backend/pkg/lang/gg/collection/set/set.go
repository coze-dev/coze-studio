package set

import (
	"encoding/json"
	"fmt"
	"strings"

	. "code.byted.org/flow/opencoze/backend/pkg/lang/gg/gutil"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/heapsort"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/jsonbuilder"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter"
)

const (
	initSize = 32
)

// Set is a set for comparable type.
//
// 💡 NOTE: Set is not concurrent-safe.
//
//	If you need a high-performance, scalable, concurrent-safe set,
//	use [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/collection/skipset].
type Set[T comparable] struct {
	m map[T]struct{} // Internal map for storing members.
}

// New creates a new set with initial members.
func New[T comparable](members ...T) *Set[T] {
	s := &Set[T]{}

	s.m = make(map[T]struct{}, IfThen(len(members) == 0, initSize, len(members)))
	for _, v := range members {
		s.m[v] = struct{}{}
	}

	return s
}

// NewWith creates a new set with [Option].
func NewWith[T comparable](opts ...Option[T]) *Set[T] {
	s := &Set[T]{}

	// Apply all construction options.
	for _, opt := range opts {
		opt(s)
	}

	// If no Option create the internal storage, create it here.
	if s.m == nil {
		s.m = make(map[T]struct{}, initSize)
	}

	return s
}

// Len returns the number of elements of set s.
// The complexity is O(1).
func (s *Set[T]) Len() int {
	return len(s.m)
}

// Add adds element v to set.
// If element is already member of set, return false.
func (s *Set[T]) Add(v T) bool {
	if _, ok := s.m[v]; ok {
		return false
	}
	s.m[v] = struct{}{}
	return true
}

// AddN is a variant of [set.Set.Add], adds multiple elements to set.
// It will not tell you which elements have been successfully added.
func (s *Set[T]) AddN(vs ...T) {
	for i := range vs {
		s.m[vs[i]] = struct{}{}
	}
}

// Remove removes element v from set.
// If element is not member of set, return false.
func (s *Set[T]) Remove(v T) bool {
	_, ok := s.m[v]
	if ok {
		delete(s.m, v)
	}
	return ok
}

// RemoveN is a variant of [set.Set.Remove], removes multiple elements from set.
// It will not tell you which elements have been successfully removed.
func (s *Set[T]) RemoveN(vs ...T) {
	for i := range vs {
		delete(s.m, vs[i])
	}
}

// Contains returns true if element v is member of set.
func (s *Set[T]) Contains(v T) bool {
	_, ok := s.m[v]
	return ok
}

// ContainsAny returns true if one of elements is member of set.
//
// 💡 NOTE: If no element given, ContainsAny always return false.
func (s *Set[T]) ContainsAny(vs ...T) bool {
	for _, v := range vs {
		if _, ok := s.m[v]; ok {
			return true
		}
	}
	return false
}

// ContainsAll returns true if all elements are member of set.
//
// 💡 NOTE: If no element given, ContainsAll always return true.
func (s *Set[T]) ContainsAll(vs ...T) bool {
	for _, v := range vs {
		if _, ok := s.m[v]; !ok {
			return false
		}
	}
	return true
}

// Iter creates an iterator of set.
//
// 💡 NOTE: The iteration order over sets is not specified and is not guaranteed
// to be the same from one iteration to the next.
func (s *Set[T]) Iter() iter.Iter[T] {
	return iter.FromMapKeys(s.m)
}

// Range calls f sequentially for each member in the set.
// If f returns false, range stops the iteration.
//
// 💡 NOTE: The iteration order over sets is not specified and is not guaranteed
// to be the same from one iteration to the next.
func (s *Set[T]) Range(f func(T) bool) {
	for v := range s.m {
		if !f(v) {
			return
		}
	}
}

// Union returns the unions of sets as a new set.
func (s *Set[T]) Union(other *Set[T]) *Set[T] {
	res := New[T]()
	for v := range s.m {
		res.m[v] = struct{}{}
	}
	for v := range other.m {
		res.m[v] = struct{}{}
	}
	return res
}

// Diff returns the difference of sets as a new set.
func (s *Set[T]) Diff(other *Set[T]) *Set[T] {
	res := New[T]()
	for v := range s.m {
		if _, ok := other.m[v]; !ok {
			res.m[v] = struct{}{}
		}
	}
	return res
}

// Intersect returns the intersection of sets as a new set.
func (s *Set[T]) Intersect(other *Set[T]) *Set[T] {
	res := New[T]()
	for v := range s.m {
		if _, ok := other.m[v]; ok {
			res.m[v] = struct{}{}
		}
	}
	return res
}

// Update is alias of [Set.UnionInplace].
func (s *Set[T]) Update(other *Set[T]) {
	s.UnionInplace(other)
}

// UnionInplace updates set s with union itself and set other.
func (s *Set[T]) UnionInplace(other *Set[T]) {
	for v := range other.m {
		s.m[v] = struct{}{}
	}
}

// DiffInplace removes all elements of set other from set s.
func (s *Set[T]) DiffInplace(other *Set[T]) {
	for v := range s.m {
		if _, ok := other.m[v]; ok {
			delete(s.m, v)
		}
	}
}

// IntersectInplace updates set s with the intersection of itself and set other.
func (s *Set[T]) IntersectInplace(other *Set[T]) {
	for v := range s.m {
		if _, ok := other.m[v]; !ok {
			delete(s.m, v)
		}
	}
}

// Equal returns whether set s and other are equal.
func (s *Set[T]) Equal(other *Set[T]) bool {
	if len(s.m) != len(other.m) {
		return false
	}
	for v := range s.m {
		_, ok := other.m[v]
		if !ok {
			return false
		}
	}
	return true
}

// IsSubset returns whether another set contains this set.
func (s *Set[T]) IsSubset(other *Set[T]) bool {
	if len(s.m) > len(other.m) {
		return false
	}
	for v := range s.m {
		_, ok := other.m[v]
		if !ok {
			return false
		}
	}
	return true
}

// IsSuperset returns whether this set contains another set.
func (s *Set[T]) IsSuperset(other *Set[T]) bool {
	if len(s.m) < len(other.m) {
		return false
	}
	for v := range other.m {
		_, ok := s.m[v]
		if !ok {
			return false
		}
	}
	return true
}

func (s *Set[T]) String() string {
	members := make([]string, 0, len(s.m))
	for m := range s.m {
		members = append(members, fmt.Sprintf("%v", m))
	}
	heapsort.Sort(members)
	return fmt.Sprintf("set[%s]", strings.Join(members, " "))
}

// ToSlice collects all members to slice.
//
// 💡 NOTE: The order of returned slice is not specified and is not guaranteed
// to be the same from another ToSlice call.
func (s *Set[T]) ToSlice() []T {
	members := make([]T, 0, len(s.m))
	for m := range s.m {
		members = append(members, m)
	}
	return members
}

// MarshalJSON implements [encoding/json.Marshaler].
//
// NOTE: The returned bytes is null or JSON array. Elements of array are
// sorted lexicographically.
//
// Experimental: This API is experimental and may change in the future.
func (s *Set[T]) MarshalJSON() ([]byte, error) {
	if s == nil {
		return []byte("null"), nil
	}
	b := jsonbuilder.NewArray()
	for m := range s.m {
		if err := b.Append(m); err != nil {
			return nil, err
		}
	}
	b.Sort()
	return b.Build()
}

// UnmarshalJSON implements [encoding/json.Unmarshaler].
//
// Experimental: This API is experimental and may change in the future.
func (s *Set[T]) UnmarshalJSON(data []byte) error {
	// Unmarshalers implement UnmarshalJSON([]byte("null")) as a no-op.
	if string(data) == "null" {
		return nil
	}

	var members []T
	if err := json.Unmarshal(data, &members); err != nil {
		return err
	}
	// Always override original members.
	*s = *New(members...)
	return nil
}

// Clone returns a copy of the set.
//
// 💡 NOTE: Members are copied using assignment (=).
func (s *Set[T]) Clone() *Set[T] {
	ns := New[T]()
	for m := range s.m {
		ns.m[m] = struct{}{}
	}
	return ns
}
