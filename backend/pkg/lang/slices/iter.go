package slices

func Transform[A, B any](src []A, fn func(A) B) []B {
	if src == nil {
		return nil
	}

	dst := make([]B, 0, len(src))
	for _, a := range src {
		dst = append(dst, fn(a))
	}

	return dst
}

func Fill[T any](val T, size int) []T {
	slice := make([]T, size)
	for i := 0; i < size; i++ {
		slice[i] = val
	}
	return slice
}

func SplitSlice[T any](s []T, chunkSize int) [][]T {
	sliceLen := len(s)
	chunks := make([][]T, 0, sliceLen/chunkSize)

	for start := 0; start < sliceLen; start += chunkSize {
		end := start + chunkSize
		if end > sliceLen {
			end = sliceLen
		}

		chunks = append(chunks, s[start:end])
	}

	return chunks
}

func ToMap[E any, K comparable, V any](src []E, fn func(e E) (K, V)) map[K]V {
	if src == nil {
		return nil
	}

	dst := make(map[K]V, len(src))
	for _, e := range src {
		k, v := fn(e)
		dst[k] = v
	}

	return dst
}
