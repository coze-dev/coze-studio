package entity

import (
	"time"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
)

type Slice struct {
	common.Info

	KnowledgeID  int64
	DocumentID   int64
	DocumentName string
	PlainText    string
	RawContent   []*SliceContent

	ByteCount int64 // 切片 bytes
	CharCount int64 // 切片字符数
	Sequence  int64 // 切片位置序号

	Extra map[string]string
}

type SliceContent struct {
	Type SliceContentType

	Text  *string
	Image *SliceImage
	Table *SliceTable
}

type SliceImage struct {
	ImageData []byte // TODO: base64 / uri
	OCR       bool   // 是否使用 ocr 提取了文本
	OCRText   string
}

type SliceTable struct { // table slice 为一行数据
	Columns []TableColumnData
}

type TableColumnData struct {
	Type TableColumnType

	ValString  *string
	ValInteger *int64
	ValTime    *time.Time
	ValNumber  *float64
	ValBoolean *bool
	ValImage   *string // base64 / url
}
