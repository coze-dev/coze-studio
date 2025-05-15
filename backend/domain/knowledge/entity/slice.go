package entity

import (
	"strconv"
	"time"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type Slice struct {
	common.Info

	KnowledgeID  int64
	DocumentID   int64
	DocumentName string
	PlainText    string
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
	return ""
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
	Columns []TableColumnData
}

type TableColumnData struct {
	ColumnID   int64
	ColumnName string
	Type       TableColumnType
	ValString  *string
	ValInteger *int64
	ValTime    *time.Time
	ValNumber  *float64
	ValBoolean *bool
	ValImage   *string // base64 / url
}

func (d *TableColumnData) GetValue() interface{} {
	switch d.Type {
	case TableColumnTypeString:
		return d.ValString
	case TableColumnTypeInteger:
		return d.ValInteger
	case TableColumnTypeTime:
		return d.ValTime
	case TableColumnTypeNumber:
		return d.ValNumber
	case TableColumnTypeBoolean:
		return d.ValBoolean
	case TableColumnTypeImage:
		return d.ValImage
	default:
		return nil
	}
}

func (d *TableColumnData) GetStringValue() string {
	switch d.Type {
	case TableColumnTypeString:
		return ptr.From(d.ValString)
	case TableColumnTypeInteger:
		return strconv.FormatInt(ptr.From(d.ValInteger), 10)
	case TableColumnTypeTime:
		return ptr.From(d.ValTime).String()
	case TableColumnTypeNumber:
		return strconv.FormatFloat(ptr.From(d.ValNumber), 'f', 20, 64)
	case TableColumnTypeBoolean:
		return strconv.FormatBool(ptr.From(d.ValBoolean))
	case TableColumnTypeImage:
		return ptr.From(d.ValImage)
	default:
		return ptr.From(d.ValString)
	}
}
