package milvus

import (
	"strconv"

	mentity "github.com/milvus-io/milvus/client/v2/entity"

	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

func convertDense(dense [][]float64) [][]float32 {
	return slices.Transform(dense, func(a []float64) []float32 {
		r := make([]float32, len(a))
		for i := 0; i < len(a); i++ {
			r[i] = float32(a[i])
		}
		return r
	})
}

func convertMilvusDenseVector(dense [][]float64) []mentity.Vector {
	return slices.Transform(dense, func(a []float64) mentity.Vector {
		r := make([]float32, len(a))
		for i := 0; i < len(a); i++ {
			r[i] = float32(a[i])
		}
		return mentity.FloatVector(r)
	})
}

func convertSparse(sparse []map[int]float64) ([]mentity.SparseEmbedding, error) {
	r := make([]mentity.SparseEmbedding, 0, len(sparse))
	for _, s := range sparse {
		ks := make([]uint32, 0, len(s))
		vs := make([]float32, 0, len(s))
		for k, v := range s {
			ks = append(ks, uint32(k))
			vs = append(vs, float32(v))
		}

		se, err := mentity.NewSliceSparseEmbedding(ks, vs)
		if err != nil {
			return nil, err
		}

		r = append(r, se)
	}

	return r, nil
}

func convertMilvusSparseVector(sparse []map[int]float64) ([]mentity.Vector, error) {
	r := make([]mentity.Vector, 0, len(sparse))
	for _, s := range sparse {
		ks := make([]uint32, 0, len(s))
		vs := make([]float32, 0, len(s))
		for k, v := range s {
			ks = append(ks, uint32(k))
			vs = append(vs, float32(v))
		}

		se, err := mentity.NewSliceSparseEmbedding(ks, vs)
		if err != nil {
			return nil, err
		}

		r = append(r, se)
	}

	return r, nil
}

func convertPartition(documentID int64) string {
	return strconv.FormatInt(documentID, 10)
}

func convertPartitions(documentIDs []int64) []string {
	return slices.Transform(documentIDs, func(a int64) string {
		return convertPartition(a)
	})
}
