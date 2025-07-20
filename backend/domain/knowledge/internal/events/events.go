/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package events

import "github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"

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

func NewIndexSliceEvent(slice *entity.Slice, document *entity.Document) *entity.Event {
	return &entity.Event{
		Type:     entity.EventTypeIndexSlice,
		Slice:    slice,
		Document: document,
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
