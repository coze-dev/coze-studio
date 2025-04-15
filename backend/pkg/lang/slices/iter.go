package slices

func Transform[A, B any](src []A, fn func(A) B) []B {
	if src == nil {
		return nil
	}

	resp := make([]B, 0, len(src))
	for i := range src {
		resp[i] = fn(src[i])
	}

	return resp
}

func Chunk[T any](s []T, size int) [][]T {
	resp := make([][]T, 0)
	for l := 0; l < len(s); l += size {
		r := min(l+size, len(s))
		resp = append(resp, s[l:r])
	}
	return resp
}

func Fill[T any](val T, size int) []T {
	slice := make([]T, size)
	for i := 0; i < size; i++ {
		slice[i] = val
	}
	return slice
}
