package convert

import (
	"fmt"
	"reflect"
	"strconv"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/consts"
	dbEntity "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func DocumentToTableSchema(docID int64, doc *entity.Document) (*dbEntity.Table, error) {
	schema := &dbEntity.Table{
		Name:    strconv.FormatInt(docID, 10),
		Columns: make([]*dbEntity.Column, 0, len(doc.TableInfo.Columns)),
		Indexes: nil,
		Options: nil,
	}

	for _, col := range doc.TableInfo.Columns {
		column := &dbEntity.Column{
			Name:    col.Name,
			Comment: &col.Description,
		}

		switch col.Type {
		case document.TableColumnTypeString:
			if col.Indexing {
				column.DataType = dbEntity.TypeVarchar
				column.Length = ptr.Of(255)
			} else {
				column.DataType = dbEntity.TypeText // todo: index 时用 varchar ?
			}
		case document.TableColumnTypeInteger:
			column.DataType = dbEntity.TypeInt
		case document.TableColumnTypeTime:
			column.DataType = dbEntity.TypeTimestamp
		case document.TableColumnTypeNumber:
			column.DataType = dbEntity.TypeInt // todo: demical?
		case document.TableColumnTypeBoolean:
			column.DataType = dbEntity.TypeBoolean
		case document.TableColumnTypeImage:
			column.DataType = dbEntity.TypeText // todo: base64 / uri ?
		default:
			return nil, fmt.Errorf("[DocumentToTableSchema] column type not support, type=%d", col.Type)
		}

		schema.Columns = append(schema.Columns, column)
	}

	return schema, nil
}

func TransformColumnType(src, dst document.TableColumnType) document.TableColumnType {
	if src == document.TableColumnTypeUnknown {
		return dst
	}
	if dst == document.TableColumnTypeUnknown {
		return src
	}
	if dst == document.TableColumnTypeString {
		return dst
	}
	if src == dst {
		return dst
	}
	if src == document.TableColumnTypeInteger && dst == document.TableColumnTypeNumber {
		return dst
	}
	return document.TableColumnTypeString
}

const columnPrefix = "c_%d"

func ColumnIDToRDBField(colID int64) string {
	return fmt.Sprintf(columnPrefix, colID)
}

func ParseAnyData(col *entity.TableColumn, data any) (*document.ColumnData, error) {
	resp := &document.ColumnData{
		ColumnID:   col.ID,
		ColumnName: col.Name,
		Type:       col.Type,
	}
	if data == nil {
		return resp, nil
	}

	switch col.Type {
	case document.TableColumnTypeString:
		switch v := data.(type) {
		case string:
			resp.ValString = ptr.Of(v)
		case []byte:
			resp.ValString = ptr.Of(string(v))
		default:
			return nil, fmt.Errorf("[AssertDataType] type assertion failed")
		}
	case document.TableColumnTypeInteger:
		switch data.(type) {
		case int, int8, int16, int32, int64:
			resp.ValInteger = ptr.Of(reflect.ValueOf(data).Int())
		case uint, uint8, uint16, uint32, uint64, uintptr:
			resp.ValInteger = ptr.Of(int64(reflect.ValueOf(data).Uint()))
		default:
			return nil, fmt.Errorf("[AssertDataType] type assertion failed")
		}
	case document.TableColumnTypeTime:
		t, ok := data.(time.Time)
		if !ok {
			return nil, fmt.Errorf("[AssertDataType] type assertion failed")
		}
		resp.ValTime = &t
	case document.TableColumnTypeNumber:
		switch data.(type) {
		case float32, float64:
			resp.ValNumber = ptr.Of(reflect.ValueOf(data).Float())
		default:
			return nil, fmt.Errorf("[AssertDataType] type assertion failed")
		}
	case document.TableColumnTypeBoolean:
		switch data.(type) {
		case bool:
			resp.ValBoolean = ptr.Of(data.(bool))
		case int, int8, int16, int32, int64:
			if reflect.ValueOf(data).Int() >= 1 {
				resp.ValBoolean = ptr.Of(true)
			} else {
				resp.ValBoolean = ptr.Of(false)
			}
		case uint, uint8, uint16, uint32, uint64, uintptr:
			resp.ValInteger = ptr.Of(int64(reflect.ValueOf(data).Uint()))
			if reflect.ValueOf(data).Int() >= 1 {
				resp.ValBoolean = ptr.Of(true)
			} else {
				resp.ValBoolean = ptr.Of(false)
			}
		default:
			return nil, fmt.Errorf("[AssertDataType] type assertion failed")
		}
	case document.TableColumnTypeImage:
		switch v := data.(type) {
		case string:
			resp.ValImage = ptr.Of(v)
		case []byte:
			resp.ValImage = ptr.Of(string(v))
		default:
			return nil, fmt.Errorf("[AssertDataType] type assertion failed")
		}
	default:
		return nil, fmt.Errorf("[AssertDataType] column type not support, type=%d", col.Type)
	}

	return resp, nil
}

func FilterColumnsRDBID(cols []*entity.TableColumn) []*entity.TableColumn {
	for i := len(cols) - 1; i >= 0; i-- {
		if cols[i].Name == consts.RDBFieldID {
			cols = append(cols[:i], cols[i+1:]...)
			break
		}
	}
	return cols
}

func ColumnIDMapping(cols []*entity.TableColumn) map[int64]*entity.TableColumn {
	resp := make(map[int64]*entity.TableColumn, len(cols))
	for i := range cols {
		col := cols[i]
		resp[col.ID] = col
	}
	return resp
}
