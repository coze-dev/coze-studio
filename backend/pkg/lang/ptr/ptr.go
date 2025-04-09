package ptr

func Of[T any](t T) *T {
	return &t
}

func From[T any](p *T) T {
	if p != nil {
		return *p
	}
	var t T
	return t
}

func FromOrDefault[T any](p *T, def T) T {
	if p != nil {
		return *p
	}
	return def
}
