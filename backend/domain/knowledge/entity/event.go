package entity

type Event struct {
	Type EventType

	Document    *Document
	SliceIDs    []int64
	KnowledgeID int64
}

type EventType string

// 文档 event
// 切分 + 写入向量库操作事务性由实现自行保证
const (
	EventTypeIndexDocument       EventType = "index_document"
	EventTypeIndexSlice          EventType = "index_slice"
	EventTypeDeleteDocument      EventType = "delete_document"
	EventTypeDeleteKnowledgeData EventType = "delete_knowledge_data"
)
