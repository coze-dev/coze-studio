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
	ParsingType ParsingType `json:"parsing_type"` // 解析类型
	// Doc
	ExtractImage bool  `json:"extract_image"` // 提取图片元素
	ExtractTable bool  `json:"extract_table"` // 提取表格元素
	ImageOCR     bool  `json:"image_ocr"`     // 图片 ocr
	FilterPages  []int `json:"filter_pages"`  // 过滤页数

	// Sheet
	SheetID       int64 `json:"sheet_id"`        // xlsx sheet id
	HeaderLine    int   `json:"header_line"`     // 表头行
	DataStartLine int   `json:"data_start_line"` // 数据起始行
	RowsCount     int   `json:"rows_count"`      // 读取数据行数

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
	ChunkSize       int64  `json:"chunk_size"` // 分段最大长度
	Separator       string `json:"separator"`  // 分段标识符
	Overlap         int64  `json:"overlap"`    // 分段重叠
	TrimSpace       bool   `json:"trim_space"`
	TrimURLAndEmail bool   `json:"trim_url_and_email"`

	// 按层级分段
	MaxDepth  int64 `json:"max_depth"`  // 按层级分段时的最大层级
	SaveTitle bool  `json:"save_title"` // 保留层级标题
}
