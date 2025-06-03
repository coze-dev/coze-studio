package parser

import (
	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/pkg/lang/sets"
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
	ExtractImage bool `json:"extract_image"` // 提取图片元素
	ExtractTable bool `json:"extract_table"` // 提取表格元素
	ImageOCR     bool `json:"image_ocr"`     // 图片 ocr

	// Sheet
	SheetID             *int               `json:"sheet_id"`        // xlsx sheet id
	HeaderLine          int                `json:"header_line"`     // 表头行
	DataStartLine       int                `json:"data_start_line"` // 数据起始行
	RowsCount           int                `json:"rows_count"`      // 读取数据行数
	IsAppend            bool               `json:"-"`               // 行插入
	Columns             []*document.Column `json:"-"`               // sheet 对齐表头
	IgnoreColumnTypeErr bool               `json:"-"`               // true 时忽略 column type 与 value 未对齐的问题，此时 value 为空

	// TODO: Image
}

type ChunkingStrategy struct {
	ChunkType ChunkType `json:"chunk_type"`

	// custom config
	ChunkSize       int64  `json:"chunk_size"` // 分段最大长度
	Separator       string `json:"separator"`  // 分段标识符
	Overlap         int64  `json:"overlap"`    // 分段重叠比例
	TrimSpace       bool   `json:"trim_space"`
	TrimURLAndEmail bool   `json:"trim_url_and_email"`

	// leveled config
	MaxDepth  int64 `json:"max_depth"`  // 按层级分段时的最大层级
	SaveTitle bool  `json:"save_title"` // 保留层级标题
}

type ChunkType int64

const (
	ChunkTypeDefault ChunkType = 0 // 自动分片
	ChunkTypeCustom  ChunkType = 1 // 自定义规则分片
	ChunkTypeLeveled ChunkType = 2 // 层级分片
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
}
