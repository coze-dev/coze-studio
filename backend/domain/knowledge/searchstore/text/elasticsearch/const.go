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

type source struct {
	DocumentID  int64  `json:"document_id"`
	KnowledgeID int64  `json:"knowledge_id"`
	CreatorID   int64  `json:"creator_id"`
	TextContent string `json:"text_content"`
}
