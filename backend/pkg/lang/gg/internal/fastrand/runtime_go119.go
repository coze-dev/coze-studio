//go:build go1.19
// +build go1.19

package fastrand

import (
	_ "unsafe"
)

//go:linkname runtimefastrand runtime.fastrand
func runtimefastrand() uint32

//go:linkname runtimefastrand64 runtime.fastrand64
func runtimefastrand64() uint64

//go:linkname runtimefastrandu runtime.fastrandu
func runtimefastrandu() uint
