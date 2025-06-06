package events

import "code.byted.org/flow/opencoze/backend/domain/knowledge/entity"

func NewIndexDocumentsEvent(knowledgeID int64, documents []*entity.Document) *entity.Event {
	return &entity.Event{
		Type:        entity.EventTypeIndexDocuments,
		KnowledgeID: knowledgeID,
		Documents:   documents,
	}
}

func NewIndexDocumentEvent(knowledgeID int64, document *entity.Document) *entity.Event {
	return &entity.Event{
		Type:        entity.EventTypeIndexDocument,
		KnowledgeID: knowledgeID,
		Document:    document,
	}
}

func NewIndexSliceEvent(slice *entity.Slice) *entity.Event {
	return &entity.Event{
		Type:  entity.EventTypeIndexSlice,
		Slice: slice,
	}
}

func NewDeleteKnowledgeDataEvent(knowledgeID int64, sliceIDs []int64) *entity.Event {
	return &entity.Event{
		Type:        entity.EventTypeDeleteKnowledgeData,
		KnowledgeID: knowledgeID,
		SliceIDs:    sliceIDs,
	}
}

func NewDocumentReviewEvent(document *entity.Document, review *entity.Review) *entity.Event {
	return &entity.Event{
		Type:           entity.EventTypeDocumentReview,
		Document:       document,
		DocumentReview: review,
	}
}
