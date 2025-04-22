package milvus

import (
	"github.com/milvus-io/milvus-sdk-go/v2/entity"
)

const (
	collectionPrefix = "opencoze"
)

const (
	fieldID           = "id"
	fieldMetadata     = "meta_data"
	fieldDocumentID   = "document_id"
	fieldCreatorID    = "creator_id"
	fieldTextContent  = "text_content"
	fieldImageContent = "image_content"

	fieldDenseVector  = "dense_vector"
	indexDenseVector  = "index_dense_vector"
	fieldSparseVector = "sparse_vector"
	indexSparseVector = "index_sparse_vector"

	fieldDenseVectorPrefix  = "dense_vector_"
	indexDenseVectorPrefix  = "index_dense_vector_"
	fieldSparseVectorPrefix = "sparse_vector_"
	indexSparseVectorPrefix = "index_sparse_vector_"

	propertyKeyCompactTable = "compact_table"
	propertyKeyHybrid       = "hybrid"
)

type tableDesc struct {
	Schema             *entity.Schema
	EnableCompactTable bool
	EnableHybrid       bool
}
