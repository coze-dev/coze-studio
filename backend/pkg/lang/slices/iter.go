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
