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

package parser

import (
	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/sets"
)

type Manager interface {
	GetParser(config *Config) (Parser, error)
}

type Config struct {
	FileExtension    FileExtension
	ParsingStrategy  *ParsingStrategy
	ChunkingStrategy *ChunkingStrategy
}

// ParsingStrategy for document parse before indexing
type ParsingStrategy struct {
	// Doc
	ExtractImage bool  `json:"extract_image"` // Extract image elements
	ExtractTable bool  `json:"extract_table"` // Extract table elements
	ImageOCR     bool  `json:"image_ocr"`     // Image ocr
	FilterPages  []int `json:"filter_pages"`  // Page filter, first page = 1

	// Sheet
	SheetID             *int               `json:"sheet_id"`        // xlsx sheet id
	HeaderLine          int                `json:"header_line"`     // header row
	DataStartLine       int                `json:"data_start_line"` // Data start row
	RowsCount           int                `json:"rows_count"`      // number of rows read
	IsAppend            bool               `json:"-"`               // row insertion
	Columns             []*document.Column `json:"-"`               // Sheet Alignment Header
	IgnoreColumnTypeErr bool               `json:"-"`               // Ignore the problem that the column type and value are not aligned when true, when the value is empty

	// Image
	ImageAnnotationType ImageAnnotationType `json:"image_annotation_type"` // Image content labeling type
}

type ChunkingStrategy struct {
	ChunkType ChunkType `json:"chunk_type"`

	// custom config
	ChunkSize       int64  `json:"chunk_size"` // maximum segmentation length
	Separator       string `json:"separator"`  // segmentation identifier
	Overlap         int64  `json:"overlap"`    // segmented overlap ratio
	TrimSpace       bool   `json:"trim_space"`
	TrimURLAndEmail bool   `json:"trim_url_and_email"`

	// leveled config
	MaxDepth  int64 `json:"max_depth"`  // Maximum level when segmented by level
	SaveTitle bool  `json:"save_title"` // Preserve Hierarchical Titles
}

type ChunkType int64

const (
	ChunkTypeDefault ChunkType = 0 // Automatic sharding
	ChunkTypeCustom  ChunkType = 1 // Custom rule sharding
	ChunkTypeLeveled ChunkType = 2 // Hierarchical sharding
)

type ImageAnnotationType int64

const (
	ImageAnnotationTypeModel  ImageAnnotationType = 0 // automatic model annotation
	ImageAnnotationTypeManual ImageAnnotationType = 1 // manual annotation
)

type FileExtension string

const (
	// document
	FileExtensionPDF      FileExtension = "pdf"
	FileExtensionTXT      FileExtension = "txt"
	FileExtensionDoc      FileExtension = "doc"
	FileExtensionDocx     FileExtension = "docx"
	FileExtensionMarkdown FileExtension = "md"

	// sheet
	FileExtensionCSV      FileExtension = "csv"
	FileExtensionXLSX     FileExtension = "xlsx"
	FileExtensionJSON     FileExtension = "json"
	FileExtensionJsonMaps FileExtension = "json_maps" // json of []map[string]string

	// image
	FileExtensionJPG  FileExtension = "jpg"
	FileExtensionJPEG FileExtension = "jpeg"
	FileExtensionPNG  FileExtension = "png"
)

func ValidateFileExtension(fileSuffix string) (ext FileExtension, support bool) {
	fileExtension := FileExtension(fileSuffix)
	_, ok := fileExtensionSet[fileExtension]
	if !ok {
		return "", false
	}
	return fileExtension, true
}

var fileExtensionSet = sets.Set[FileExtension]{
	FileExtensionPDF:      {},
	FileExtensionTXT:      {},
	FileExtensionDoc:      {},
	FileExtensionDocx:     {},
	FileExtensionMarkdown: {},
	FileExtensionCSV:      {},
	FileExtensionJSON:     {},
	FileExtensionJsonMaps: {},
	FileExtensionJPG:      {},
	FileExtensionJPEG:     {},
	FileExtensionPNG:      {},
}
