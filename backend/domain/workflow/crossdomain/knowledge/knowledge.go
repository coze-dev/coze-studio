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

package knowledge

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
)

type ParseMode string

const (
	FastParseMode     = "fast_mode"
	AccurateParseMode = "accurate_mode"
)

type ChunkType string

const (
	ChunkTypeDefault ChunkType = "default"
	ChunkTypeCustom  ChunkType = "custom"
	ChunkTypeLeveled ChunkType = "leveled"
)

type ParsingStrategy struct {
	ParseMode    ParseMode
	ExtractImage bool
	ExtractTable bool
	ImageOCR     bool
}
type ChunkingStrategy struct {
	ChunkType ChunkType
	ChunkSize int64
	Separator string
	Overlap   int64
}

type CreateDocumentRequest struct {
	KnowledgeID      int64
	ParsingStrategy  *ParsingStrategy
	ChunkingStrategy *ChunkingStrategy
	FileURL          string
	FileName         string
	FileExtension    parser.FileExtension
}
type CreateDocumentResponse struct {
	DocumentID int64
	FileName   string
	FileURL    string
}

type SearchType string

const (
	SearchTypeSemantic SearchType = "semantic"  // semantics
	SearchTypeFullText SearchType = "full_text" // full text
	SearchTypeHybrid   SearchType = "hybrid"    // mix
)

type RetrievalStrategy struct {
	TopK       *int64
	MinScore   *float64
	SearchType SearchType

	EnableNL2SQL       bool
	EnableQueryRewrite bool
	EnableRerank       bool
	IsPersonalOnly     bool
}

type RetrieveRequest struct {
	Query             string
	KnowledgeIDs      []int64
	RetrievalStrategy *RetrievalStrategy
}

type Slice struct {
	DocumentID string `json:"documentId"`
	Output     string `json:"output"`
}

type RetrieveResponse struct {
	Slices []*Slice
}

var (
	knowledgeOperatorImpl KnowledgeOperator
)

func GetKnowledgeOperator() KnowledgeOperator {
	return knowledgeOperatorImpl
}

func SetKnowledgeOperator(k KnowledgeOperator) {
	knowledgeOperatorImpl = k
}

type KnowledgeDetail struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	IconURL     string `json:"-"`
	FormatType  int64  `json:"-"`
}

type ListKnowledgeDetailRequest struct {
	KnowledgeIDs []int64
}

type ListKnowledgeDetailResponse struct {
	KnowledgeDetails []*KnowledgeDetail
}

type DeleteDocumentRequest struct {
	DocumentID string
}

type DeleteDocumentResponse struct {
	IsSuccess bool
}

//go:generate  mockgen -destination knowledgemock/knowledge_mock.go --package knowledgemock -source knowledge.go
type KnowledgeOperator interface {
	Store(ctx context.Context, document *CreateDocumentRequest) (*CreateDocumentResponse, error)
	Retrieve(context.Context, *RetrieveRequest) (*RetrieveResponse, error)
	Delete(context.Context, *DeleteDocumentRequest) (*DeleteDocumentResponse, error)
	ListKnowledgeDetail(context.Context, *ListKnowledgeDetailRequest) (*ListKnowledgeDetailResponse, error)
}
