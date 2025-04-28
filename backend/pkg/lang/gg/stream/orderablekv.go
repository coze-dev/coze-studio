package stream

import (
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/collection/tuple"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/constraints"
	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter"
)

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.FromMap].
func FromOrderableMap[K constraints.Ordered, V any](m map[K]V) OrderableKV[K, V] {
	return OrderableKV[K, V]{FromMap(m)}
}

// See function [pkg/code.byted.org/flow/opencoze/backend/pkg/lang/gg/iter.Sort].
func (s OrderableKV[K, V]) Sort() OrderableKV[K, V] {
	less := func(x, y tuple.T2[K, V]) bool { return x.First < y.First }
	return FromOrderableKVIter(iter.SortBy(less, s.Iter))
}

// Keys returns stream of key.
func (s OrderableKV[K, V]) Keys() Orderable[K] {
	return FromOrderableIter(iter.Map(func(v tuple.T2[K, V]) K {
		return v.First
	}, s.Iter))
}
