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

import (
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
)

type RetrievalStrategy = knowledge.RetrievalStrategy

// ParsingStrategy for document parse before indexing
type ParsingStrategy struct {
	ParsingType ParsingType `json:"parsing_type"` // parse type
	// Doc
	ExtractImage bool  `json:"extract_image"` // Extract image elements
	ExtractTable bool  `json:"extract_table"` // Extract table elements
	ImageOCR     bool  `json:"image_ocr"`     // Image ocr
	FilterPages  []int `json:"filter_pages"`  // filter pages

	// Sheet
	SheetID       int64 `json:"sheet_id"`        // xlsx sheet id
	HeaderLine    int   `json:"header_line"`     // header row
	DataStartLine int   `json:"data_start_line"` // Data start row
	RowsCount     int   `json:"rows_count"`      // number of rows read

	// Image
	CaptionType *parser.ImageAnnotationType `json:"caption_type"`
}
type ParsingType int64

const (
	ParsingType_FastParsing     ParsingType = 0
	ParsingType_AccurateParsing ParsingType = 1
)

// ChunkingStrategy for document chunk before indexing
type ChunkingStrategy struct {
	ChunkType parser.ChunkType `json:"chunk_type"`
	// custom chunk config
	ChunkSize       int64  `json:"chunk_size"` // maximum segmentation length
	Separator       string `json:"separator"`  // segmentation identifier
	Overlap         int64  `json:"overlap"`    // segmented overlap
	TrimSpace       bool   `json:"trim_space"`
	TrimURLAndEmail bool   `json:"trim_url_and_email"`

	// segmentation by hierarchy
	MaxDepth  int64 `json:"max_depth"`  // Maximum level when segmented by level
	SaveTitle bool  `json:"save_title"` // Preserve Hierarchical Titles
}
