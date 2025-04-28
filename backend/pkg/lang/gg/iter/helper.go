package iter

import (
	"reflect"
	"sync"
	"unsafe"
)

// Peeker is also an iterator interface, which allows users to peek on the
// elements without consuming them.
//
// Peeker is required by some operations like Equal and Zip.
// Use ToPeeker to wrap an Iter as a Peeker.
type Peeker[T any] interface {
	Iter[T]
	// Peek returns the next N element of iterator without consuming it.
	Peek(n int) []T
}

// peeker is the default implementation of Peeker interface.
type peeker[T any] struct {
	Iter[T]
	buf []T
}

// ToPeeker wraps Iter as Peeker.
func ToPeeker[T any](i Iter[T]) Peeker[T] {
	p := &peeker[T]{Iter: i}
	p.buf = i.Next(1)
	return p
}

func (p *peeker[T]) Next(n int) []T {
	next := p.Peek(n)
	if len(next) == len(p.buf) {
		p.buf = nil
	} else {
		p.buf = p.buf[len(next):]
	}
	return next
}

func (p *peeker[T]) Peek(n int) []T {
	if n == 0 {
		return nil
	}
	if n == ALL {
		p.buf = append(p.buf, p.Iter.Next(ALL)...)
		return p.buf
	}
	if n > len(p.buf) {
		p.buf = append(p.buf, p.Iter.Next(n-len(p.buf))...)
		return p.buf
	}
	return p.buf[:n]
}

func hasNext[T any](p Peeker[T]) bool {
	return len(p.Peek(1)) != 0
}

// Copied from  https://cs.opensource.google/go/go/+/master:src/reflect/value.go
//
// value is the reflection interface to a Go value.
type reflectValue struct {
	// typ holds the type of the value represented by a Value.
	typ unsafe.Pointer

	// Pointer-valued data or, if flagIndir is set, pointer to data.
	// Valid when either flagIndir is set or typ.pointers() is true.
	ptr unsafe.Pointer

	// Omit other fields...
}

// Copied from https://cs.opensource.google/go/go/+/master:src/reflect/value.go
//
// hiter's structure matches runtime.hiter's structure.
// Having a clone here allows us to embed a map iterator
// inside type MapIter so that MapIters can be re-used
// without doing any allocations.
type hiter struct {
	key         unsafe.Pointer
	elem        unsafe.Pointer
	t           unsafe.Pointer
	h           unsafe.Pointer
	buckets     unsafe.Pointer
	bptr        unsafe.Pointer
	overflow    *[]unsafe.Pointer
	oldoverflow *[]unsafe.Pointer
	startBucket uintptr
	offset      uint8
	wrapped     bool
	B           uint8
	i           uint8
	bucket      uintptr
	checkBucket uintptr
}

func (h *hiter) initialized() bool {
	return h.t != nil
}

//go:noescape
//go:linkname mapiternext reflect.mapiternext
func mapiternext(it *hiter)

//go:noescape
//go:linkname mapiterinit reflect.mapiterinit
func mapiterinit(rtype unsafe.Pointer, m unsafe.Pointer, it *hiter)

type unsafeMapIter[K comparable, V any] struct {
	m     map[K]V
	hiter hiter
}

func newUnsafeMapIter[K comparable, V any](m map[K]V) *unsafeMapIter[K, V] {
	return &unsafeMapIter[K, V]{m: m}
}

func (i *unsafeMapIter[K, V]) Next(n int, needKey, needValue bool) ([]K, []V) {
	if n == 0 {
		return nil, nil
	}
	if len(i.m) == 0 {
		return nil, nil
	}

	// Fast path: Get all elements of map.
	if !i.hiter.initialized() && (n >= len(i.m) || n == ALL) {
		m := i.m
		i.m = nil
		if needKey && needValue {
			keys := make([]K, 0, len(m))
			vals := make([]V, 0, len(m))
			for k, v := range m {
				keys = append(keys, k)
				vals = append(vals, v)
			}
			return keys, vals
		} else if needKey {
			keys := make([]K, 0, len(m))
			for k := range m {
				keys = append(keys, k)
			}
			return keys, nil
		} else if needValue {
			vals := make([]V, 0, len(m))
			for _, v := range m {
				vals = append(vals, v)
			}
			return nil, vals
		}
	}

	// Init internal map iterator.
	if !i.hiter.initialized() {
		rv := reflect.ValueOf(i.m)
		v := (*reflectValue)(unsafe.Pointer(&rv))
		mapiterinit(v.typ, v.ptr, &i.hiter)
	}

	var (
		keys []K
		vals []V
	)
	if n != ALL {
		if needKey {
			keys = make([]K, 0, n)
		}
		if needValue {
			vals = make([]V, 0, n)
		}
	}

	for n == ALL || n > 0 {
		if i.hiter.key == nil {
			// Iterator exhausted.
			break
		}
		if needKey {
			keys = append(keys, *(*K)(i.hiter.key))
		}
		if needValue {
			vals = append(vals, *(*V)(i.hiter.elem))
		}
		if n != ALL {
			n--
		}
		mapiternext(&i.hiter)
	}

	return keys, vals
}

// fastpathIter provides a fast path for full evaluation.
//
// For some operations, full evaluation algorithm is simpler and more efficient
// than partial evaluation algorithm, this iterator provides a mechanism to use
// different iterator implementation when user acquire a full evaluation or a
// partial evaluation.
//
// fastpathIter implements [Iter].
type fastpathIter[T any] struct {
	Iter[T]
	once    sync.Once
	full    func() Iter[T]
	partial func() Iter[T]
}

func newFastpathIter[T any](full, partial func() Iter[T]) *fastpathIter[T] {
	return &fastpathIter[T]{
		full:    full,
		partial: partial,
	}
}

func (i *fastpathIter[T]) Next(n int) []T {
	if n == 0 {
		return nil
	}
	i.once.Do(func() {
		if n == ALL {
			i.Iter = i.full() // fast path
		} else {
			i.Iter = i.partial() // slow path
		}
	})
	return i.Iter.Next(n)
}
