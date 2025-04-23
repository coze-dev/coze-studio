package elasticsearch

import "github.com/elastic/go-elasticsearch/v8/typedapi/types"

const (
	fieldDocumentID  = "document_id"
	fieldKnowledgeID = "knowledge_id"
	fieldCreatorID   = "creator_id"
	fieldTextContent = "text_content"

	fieldPrefixTableColumn = "table_column_"

	indexPrefix = "coze_index_"

	metaKeyCompactTable = "compact_table"
)

type indexDesc struct {
	Properties         map[string]types.Property
	EnableCompactTable bool
}
