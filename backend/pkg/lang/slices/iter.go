package slices

func ConvertSliceNoError[A, B any](src []A, fn func(A) B) []B {
	if src == nil {
		return nil
	}

	resp := make([]B, 0, len(src))
	for i := range src {
		resp[i] = fn(src[i])
	}

	return resp
}
