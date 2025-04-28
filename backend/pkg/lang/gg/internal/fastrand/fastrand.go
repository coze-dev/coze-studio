// Package fastrand is the fastest pseudorandom number generator in Go(multiple-cores).
package fastrand

import (
	"math/bits"
	"unsafe"
)

// Uint32 returns a pseudo-random 32-bit value as a uint32.
var Uint32 = runtimefastrand

// Uint64 returns a pseudo-random 64-bit value as a uint64.
var Uint64 = runtimefastrand64

// Int returns a non-negative pseudo-random int.
func Int() int {
	// EQ
	u := uint(Int63())
	return int(u << 1 >> 1) // clear sign bit if int == int32
}

// Int31 returns a non-negative pseudo-random 31-bit integer as an int32.
func Int31() int32 { return int32(Uint32() & (1<<31 - 1)) }

// Int63 returns a non-negative pseudo-random 63-bit integer as an int64.
func Int63() int64 {
	// EQ
	return int64(Uint64() & (1<<63 - 1))
}

// Int63n returns, as an int64, a non-negative pseudo-random number in [0,n).
// It panics if n <= 0.
func Int63n(n int64) int64 {
	// EQ
	if n <= 0 {
		panic("invalid argument to Int63n")
	}
	if n&(n-1) == 0 { // n is power of two, can mask
		return Int63() & (n - 1)
	}
	max := int64((1 << 63) - 1 - (1<<63)%uint64(n))
	v := Int63()
	for v > max {
		v = Int63()
	}
	return v % n
}

// Int31n returns, as an int32, a non-negative pseudo-random number in [0,n).
// It panics if n <= 0.
// For implementation details, see:
// https://lemire.me/blog/2016/06/27/a-fast-alternative-to-the-modulo-reduction
func Int31n(n int32) int32 {
	// EQ
	if n <= 0 {
		panic("invalid argument to Int31n")
	}
	v := Uint32()
	prod := uint64(v) * uint64(n)
	low := uint32(prod)
	if low < uint32(n) {
		thresh := uint32(-n) % uint32(n)
		for low < thresh {
			v = Uint32()
			prod = uint64(v) * uint64(n)
			low = uint32(prod)
		}
	}
	return int32(prod >> 32)
}

// Intn returns, as an int, a non-negative pseudo-random number in [0,n).
// It panics if n <= 0.
func Intn(n int) int {
	// EQ
	if n <= 0 {
		panic("invalid argument to Intn")
	}
	if n <= 1<<31-1 {
		return int(Int31n(int32(n)))
	}
	return int(Int63n(int64(n)))
}

func Float64() float64 {
	// EQ
	return float64(Int63n(1<<53)) / (1 << 53)
}

func Float32() float32 {
	// EQ
	return float32(Int31n(1<<24)) / (1 << 24)
}

// Uint returns a pseudo-random 32-bit or 64-bit value.
var Uint = runtimefastrandu

// Uintn returns a pseudo-random number in [0,n).
func Uintn(n uint) uint {
	return Uint() % n
}

// Uint32n returns a pseudo-random number in [0,n).
//
//go:nosplit
func Uint32n(n uint32) uint32 {
	// This is similar to Uint32() % n, but faster.
	// See https://lemire.me/blog/2016/06/27/a-fast-alternative-to-the-modulo-reduction/
	return uint32(uint64(Uint32()) * uint64(n) >> 32)
}

// Uint64n returns a pseudo-random number in [0,n).
func Uint64n(n uint64) uint64 {
	return Uint64() % n
}

// wyrand: https://github.com/wangyi-fudan/wyhash
type wyrand uint64

func _wymix(a, b uint64) uint64 {
	hi, lo := bits.Mul64(a, b)
	return hi ^ lo
}

func (r *wyrand) Uint64() uint64 {
	*r += wyrand(0xa0761d6478bd642f)
	return _wymix(uint64(*r), uint64(*r^wyrand(0xe7037ed1a0b428db)))
}

func (r *wyrand) Uint64n(n uint64) uint64 {
	return r.Uint64() % n
}

func (r *wyrand) Uint32() uint32 {
	return uint32(Uint64())
}

func (r *wyrand) Uint32n(n int) uint32 {
	// This is similar to Uint32() % n, but faster.
	// See https://lemire.me/blog/2016/06/27/a-fast-alternative-to-the-modulo-reduction/
	return uint32(uint64(r.Uint32()) * uint64(n) >> 32)
}

// Read generates len(p) random bytes and writes them into p.
// It always returns len(p) and a nil error.
// It is safe for concurrent use.
func Read(p []byte) (int, error) {
	l := len(p)
	if l == 0 {
		return 0, nil
	}

	r := wyrand(Uint32())

	if l >= 8 {
		var i int
		uint64p := *(*[]uint64)(unsafe.Pointer(&p))
		for l >= 8 {
			uint64p[i] = r.Uint64()
			i++
			l -= 8
		}
	}

	if l > 0 {
		for l > 0 {
			p[len(p)-l] = byte(r.Uint64() >> (l * 8))
			l--
		}
	}

	return len(p), nil
}

// Shuffle pseudo-randomizes the order of elements.
// n is the number of elements. Shuffle panics if n < 0.
// swap swaps the elements with indexes i and j.
func Shuffle(n int, swap func(i, j int)) {
	if n < 0 {
		panic("invalid argument to Shuffle")
	}
	// Fisher-Yates shuffle: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
	// Shuffle really ought not be called with n that doesn't fit in 32 bits.
	// Not only will it take a very long time, but with 2³¹! possible permutations,
	// there's no way that any PRNG can have a big enough internal state to
	// generate even a minuscule percentage of the possible permutations.
	// Nevertheless, the right API signature accepts an int n, so handle it as best we can.
	i := n - 1
	for ; i > 1<<31-1-1; i-- {
		j := int(Int63n(int64(i + 1)))
		swap(i, j)
	}
	for ; i > 0; i-- {
		j := int(Int31n(int32(i + 1)))
		swap(i, j)
	}
}

// Shuffle2 pseudo-randomizes the order of elements.
func Shuffle2[T any](s []T) {
	n := len(s)
	// Fisher-Yates shuffle: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
	// Shuffle really ought not be called with n that doesn't fit in 32 bits.
	// Not only will it take a very long time, but with 2³¹! possible permutations,
	// there's no way that any PRNG can have a big enough internal state to
	// generate even a minuscule percentage of the possible permutations.
	// Nevertheless, the right API signature accepts an int n, so handle it as best we can.
	i := n - 1
	for ; i > 1<<31-1-1; i-- {
		j := int(Int63n(int64(i + 1)))
		tmp := s[i]
		s[i] = s[j]
		s[j] = tmp
	}
	for ; i > 0; i-- {
		j := int(Int31n(int32(i + 1)))
		tmp := s[i]
		s[i] = s[j]
		s[j] = tmp
	}
}

// Perm returns, as a slice of n ints, a pseudo-random permutation of the integers
// in the half-open interval [0,n).
func Perm(n int) []int {
	m := make([]int, n)
	for i := 1; i < n; i++ {
		j := Intn(i + 1)
		m[i] = m[j]
		m[j] = i
	}
	return m
}
