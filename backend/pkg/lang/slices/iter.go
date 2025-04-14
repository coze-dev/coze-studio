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
