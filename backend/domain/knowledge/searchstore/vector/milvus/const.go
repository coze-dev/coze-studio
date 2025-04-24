package milvus

import "github.com/milvus-io/milvus/client/v2/entity"

const (
	collectionPrefix = "opencoze_"
)

const (
	fieldID           = "id"
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

type collectionDesc struct {
	Schema             *entity.Schema
	EnableCompactTable bool
	EnableHybrid       bool
}
