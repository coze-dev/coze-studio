package heapsort

import (
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/constraints"
)

// siftDown implements the heap property on v[lo:hi].
func siftDown[T constraints.Ordered](v []T, node int) {
	for {
		child := 2*node + 1
		if child >= len(v) {
			break
		}
		if child+1 < len(v) && v[child] < v[child+1] {
			child++
		}
		if v[node] >= v[child] {
			return
		}
		v[node], v[child] = v[child], v[node]
		node = child
	}
}

func Sort[T constraints.Ordered](v []T) {
	// Build heap with greatest element at top.
	for i := (len(v) - 1) / 2; i >= 0; i-- {
		siftDown(v, i)
	}

	// Pop elements into end of v.
	for i := len(v) - 1; i >= 1; i-- {
		v[0], v[i] = v[i], v[0]
		siftDown(v[:i], 0)
	}
}
