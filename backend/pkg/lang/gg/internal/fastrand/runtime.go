//go:build !go1.19
// +build !go1.19

package fastrand

import (
	_ "unsafe"
)

//go:linkname runtimefastrand runtime.fastrand
func runtimefastrand() uint32

func runtimefastrand64() uint64 {
	return (uint64(runtimefastrand()) << 32) | uint64(runtimefastrand())
}

func runtimefastrandu() uint {
	// PtrSize is the size of a pointer in bytes - unsafe.Sizeof(uintptr(0)) but as an ideal constant.
	// It is also the size of the machine's native word size (that is, 4 on 32-bit systems, 8 on 64-bit).
	const PtrSize = 4 << (^uintptr(0) >> 63)
	if PtrSize == 4 {
		return uint(runtimefastrand())
	}
	return uint(runtimefastrand64())
}
