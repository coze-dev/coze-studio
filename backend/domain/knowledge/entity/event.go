package entity

type Event struct {
	Type EventType

	Documents      []*Document
	Document       *Document
	Slice          *Slice
	SliceIDs       []int64
	KnowledgeID    int64
	DocumentReview *Review
}

type EventType string

// 文档 event
// 切分 + 写入向量库操作事务性由实现自行保证
const (
	EventTypeIndexDocuments EventType = "index_documents"

	// EventTypeIndexDocument 文档信息已写入 orm，逻辑中需要解析+切分+搜索数据入库
	// Event requires: Event.Document
	EventTypeIndexDocument EventType = "index_document"

	// EventTypeIndexSlice 切片信息已写入 orm，逻辑中仅写入搜索数据
	// Event requires: Event.Slice
	EventTypeIndexSlice EventType = "index_slice"

	// EventTypeDeleteKnowledgeData 删除 knowledge
	// Event requires: Event.KnowledgeID, Event.SliceIDs
	EventTypeDeleteKnowledgeData EventType = "delete_knowledge_data"

	EventTypeDocumentReview EventType = "document_review"
)
