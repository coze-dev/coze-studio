package sqlutil

import (
	"database/sql/driver"
)

func DriverValue[T any](v T) driver.Valuer {
	return value[T]{val: v}
}

type value[T any] struct {
	val T
}

func (i value[T]) Value() (driver.Value, error) {
	return i.val, nil
}
