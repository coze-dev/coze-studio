package maps

func ToAnyValue[K comparable, V any](m map[K]V) map[K]any {
	n := make(map[K]any, len(m))
	for k, v := range m {
		n[k] = v
	}

	return n
}
