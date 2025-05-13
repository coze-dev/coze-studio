package maps

func ToAnyValue[K comparable, V any](m map[K]V) map[K]any {
	n := make(map[K]any, len(m))
	for k, v := range m {
		n[k] = v
	}

	return n
}

func TransformKey[K1, K2 comparable, V any](m map[K1]V, f func(K1) K2) map[K2]V {
	n := make(map[K2]V, len(m))
	for k1, v := range m {
		n[f(k1)] = v
	}
	return n
}
