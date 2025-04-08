package schema

func getKeyOrZero[T any](key string, m map[string]any) T {
	if v, ok := m[key]; ok {
		return v.(T)
	}

	var zero T
	return zero
}
