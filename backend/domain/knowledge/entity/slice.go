package entity

import (
	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type Slice struct {
	common.Info

	KnowledgeID  int64
	DocumentID   int64
	DocumentName string
	RawContent   []*SliceContent
	SliceStatus  SliceStatus
	ByteCount    int64 // 切片 bytes
	CharCount    int64 // 切片字符数
	Sequence     int64 // 切片位置序号

	Extra map[string]string
}

func (s *Slice) GetSliceContent() string {
	if len(s.RawContent) == 0 {
		return ""
	}
	if s.RawContent[0].Type == SliceContentTypeTable {
		var contentMap map[string]string
		for _, column := range s.RawContent[0].Table.Columns {
			contentMap[column.ColumnName] = column.GetStringValue()
		}
		byteData, err := sonic.Marshal(contentMap)
		if err != nil {
			return ""
		}
		return string(byteData)
	}
	data := ""
	for i := range s.RawContent {
		item := s.RawContent[i]
		if item == nil {
			continue
		}
		if item.Type == SliceContentTypeTable {
			var contentMap map[string]string
			for _, column := range s.RawContent[0].Table.Columns {
				contentMap[column.ColumnName] = column.GetStringValue()
			}
			byteData, err := sonic.Marshal(contentMap)
			if err != nil {
				return ""
			}
			data += string(byteData)
		}
		// todo image的处理
		if item.Type == SliceContentTypeText {
			data += ptr.From(item.Text)
		}
	}
	return data
}

func (s *Slice) GetString() string {
	panic("impl me")
}

type SliceStatus int64

const (
	SliceStatusInit        SliceStatus = 0 // 初始化
	SliceStatusFinishStore SliceStatus = 1 // searchStore存储完成
	SliceStatusFailed      SliceStatus = 9 // 失败
)

type SliceContent struct {
	Type SliceContentType

	Text  *string
	Image *SliceImage
	Table *SliceTable
}

type SliceImage struct {
	Base64  []byte
	URI     string
	OCR     bool // 是否使用 ocr 提取了文本
	OCRText *string
}

type SliceTable struct { // table slice 为一行数据
	Columns []*document.ColumnData
}
