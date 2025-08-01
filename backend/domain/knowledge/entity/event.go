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

// Document event
// Split + write vector library operation transactionality is guaranteed by the implementation itself
const (
	EventTypeIndexDocuments EventType = "index_documents"

	// EventTypeIndexDocument document information has been written to orm, the logic needs to parse + split + search data warehousing
	// Event requires: Event.Document
	EventTypeIndexDocument EventType = "index_document"

	// EventTypeIndexSlice slice information has been written to orm, and only search data is written in the logic
	// Event requires: Event.Slice
	EventTypeIndexSlice EventType = "index_slice"

	// EventTypeDeleteKnowledgeData remove knowledge
	// Event requires: Event.KnowledgeID, Event.SliceIDs
	EventTypeDeleteKnowledgeData EventType = "delete_knowledge_data"

	EventTypeDocumentReview EventType = "document_review"
)
