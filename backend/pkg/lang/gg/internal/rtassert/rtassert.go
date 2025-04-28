// Package rtassert provides runtime assertion.
package rtassert

import (
	"fmt"

	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/constraints"
)

func MustNotNeg[T constraints.Number](n T) {
	if n < 0 {
		panic(fmt.Errorf("number must not be negative: %v", n))
	}
}
