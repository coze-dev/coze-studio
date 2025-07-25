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
