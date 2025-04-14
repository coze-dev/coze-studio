package vikingdb

const (
	collectionPrefix = "opencoze"
	tableFieldPrefix = "table_content"
	indexName        = "opencoze"
)

const (
	embeddingModelDoubaoLarge  = "doubao-embedding-large"
	embeddingModelDoubaoVision = "doubao-embedding-vision"
	embeddingModelBgeM3        = "bge-m3"
)

// fields of vikingdb
const (
	vikingDBFieldID           = "id"
	vikingDBFieldMetaData     = "meta_data"
	vikingDBFieldDocumentID   = "document_id"
	vikingDBFieldCreatorID    = "creator_id"
	vikingDBFieldTextContent  = "text_content"
	vikingDBFieldImageContent = "image_content"
)

const (
	maxBatchSize = 100
)
