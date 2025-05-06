package convert

import (
	"fmt"
	"reflect"
	"strconv"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	dbEntity "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
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
		case entity.TableColumnTypeString:
			if col.Indexing {
				column.DataType = dbEntity.TypeVarchar
				column.Length = ptr.Of(255)
			} else {
				column.DataType = dbEntity.TypeText // todo: index 时用 varchar ?
			}
		case entity.TableColumnTypeInteger:
			column.DataType = dbEntity.TypeInt
		case entity.TableColumnTypeTime:
			column.DataType = dbEntity.TypeTimestamp
		case entity.TableColumnTypeNumber:
			column.DataType = dbEntity.TypeInt // todo: demical?
		case entity.TableColumnTypeBoolean:
			column.DataType = dbEntity.TypeBoolean
		case entity.TableColumnTypeImage:
			column.DataType = dbEntity.TypeText // todo: base64 / uri ?
		default:
			return nil, fmt.Errorf("[DocumentToTableSchema] column type not support, type=%d", col.Type)
		}

		schema.Columns = append(schema.Columns, column)
	}

	return schema, nil
}

func TransformColumnType(src, dst entity.TableColumnType) entity.TableColumnType {
	if src == entity.TableColumnTypeUnknown {
		return dst
	}
	if dst == entity.TableColumnTypeUnknown {
		return src
	}
	if dst == entity.TableColumnTypeString {
		return dst
	}
	if src == dst {
		return dst
	}
	if src == entity.TableColumnTypeInteger && dst == entity.TableColumnTypeNumber {
		return dst
	}
	return entity.TableColumnTypeString
}

const columnPrefix = "c_%d"

func ColumnIDToRDBField(colID int64) string {
	return fmt.Sprintf(columnPrefix, colID)
}

func ParseAnyData(col *entity.TableColumn, data any) (*entity.TableColumnData, error) {
	resp := &entity.TableColumnData{
		ColumnID:   col.ID,
		ColumnName: col.Name,
		Type:       col.Type,
	}
	if data == nil {
		return resp, nil
	}

	switch col.Type {
	case entity.TableColumnTypeString:
		switch v := data.(type) {
		case string:
			resp.ValString = ptr.Of(v)
		case []byte:
			resp.ValString = ptr.Of(string(v))
		default:
			return nil, fmt.Errorf("[AssertDataType] type assertion failed")
		}
	case entity.TableColumnTypeInteger:
		switch data.(type) {
		case int, int8, int16, int32, int64:
			resp.ValInteger = ptr.Of(reflect.ValueOf(data).Int())
		case uint, uint8, uint16, uint32, uint64, uintptr:
			resp.ValInteger = ptr.Of(int64(reflect.ValueOf(data).Uint()))
		default:
			return nil, fmt.Errorf("[AssertDataType] type assertion failed")
		}
	case entity.TableColumnTypeTime:
		t, ok := data.(time.Time)
		if !ok {
			return nil, fmt.Errorf("[AssertDataType] type assertion failed")
		}
		resp.ValTime = &t
	case entity.TableColumnTypeNumber:
		switch data.(type) {
		case float32, float64:
			resp.ValNumber = ptr.Of(reflect.ValueOf(data).Float())
		default:
			return nil, fmt.Errorf("[AssertDataType] type assertion failed")
		}
	case entity.TableColumnTypeBoolean:
		b, ok := data.(bool)
		if !ok {
			return nil, fmt.Errorf("[AssertDataType] type assertion failed")
		}
		resp.ValBoolean = &b
	case entity.TableColumnTypeImage:
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
