package ternary

func IFElse[T any](ok bool, newValue, oldValue T) T {
	if ok {
		return newValue
	}
	return oldValue
}
