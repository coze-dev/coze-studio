package milvus

import (
	"fmt"

	"github.com/milvus-io/milvus/client/v2/entity"

	"code.byted.org/flow/opencoze/backend/infra/contract/document/searchstore"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

func denseFieldName(name string) string {
	return fmt.Sprintf("dense_%s", name)
}

func denseIndexName(name string) string {
	return fmt.Sprintf("index_dense_%s", name)
}

func sparseFieldName(name string) string {
	return fmt.Sprintf("sparse_%s", name)
}

func sparseIndexName(name string) string {
	return fmt.Sprintf("index_sparse_%s", name)
}

func convertFieldType(typ searchstore.FieldType) (entity.FieldType, error) {
	switch typ {
	case searchstore.FieldTypeInt64:
		return entity.FieldTypeInt64, nil
	case searchstore.FieldTypeText:
		return entity.FieldTypeVarChar, nil
	case searchstore.FieldTypeDenseVector:
		return entity.FieldTypeFloatVector, nil
	case searchstore.FieldTypeSparseVector:
		return entity.FieldTypeSparseVector, nil
	default:
		return entity.FieldTypeNone, fmt.Errorf("[convertFieldType] unknown field type: %v", typ)
	}
}

func convertDense(dense [][]float64) [][]float32 {
	return slices.Transform(dense, func(a []float64) []float32 {
		r := make([]float32, len(a))
		for i := 0; i < len(a); i++ {
			r[i] = float32(a[i])
		}
		return r
	})
}

func convertMilvusDenseVector(dense [][]float64) []entity.Vector {
	return slices.Transform(dense, func(a []float64) entity.Vector {
		r := make([]float32, len(a))
		for i := 0; i < len(a); i++ {
			r[i] = float32(a[i])
		}
		return entity.FloatVector(r)
	})
}

func convertSparse(sparse []map[int]float64) ([]entity.SparseEmbedding, error) {
	r := make([]entity.SparseEmbedding, 0, len(sparse))
	for _, s := range sparse {
		ks := make([]uint32, 0, len(s))
		vs := make([]float32, 0, len(s))
		for k, v := range s {
			ks = append(ks, uint32(k))
			vs = append(vs, float32(v))
		}

		se, err := entity.NewSliceSparseEmbedding(ks, vs)
		if err != nil {
			return nil, err
		}

		r = append(r, se)
	}

	return r, nil
}

func convertMilvusSparseVector(sparse []map[int]float64) ([]entity.Vector, error) {
	r := make([]entity.Vector, 0, len(sparse))
	for _, s := range sparse {
		ks := make([]uint32, 0, len(s))
		vs := make([]float32, 0, len(s))
		for k, v := range s {
			ks = append(ks, uint32(k))
			vs = append(vs, float32(v))
		}

		se, err := entity.NewSliceSparseEmbedding(ks, vs)
		if err != nil {
			return nil, err
		}

		r = append(r, se)
	}

	return r, nil
}
