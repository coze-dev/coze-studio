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

// ToBoolPtr 将对象返回指针
func ToBoolPtr(b bool) *bool {
	return &b
}

// ToStringPtr 将对象返回指针
func ToStringPtr(s string) *string {
	return &s
}

// ToIntPtr 将对象返回指针
func ToIntPtr(i int) *int {
	return &i
}

// ToInt8Ptr 将对象返回指针
func ToInt8Ptr(i int8) *int8 {
	return &i
}

// ToInt16Ptr 将对象返回指针
func ToInt16Ptr(i int16) *int16 {
	return &i
}

// ToInt32Ptr 将对象返回指针
func ToInt32Ptr(i int32) *int32 {
	return &i
}

// ToInt64Ptr 将对象返回指针
func ToInt64Ptr(i int64) *int64 {
	return &i
}

// ToUintPtr 将对象返回指针
func ToUintPtr(i uint) *uint {
	return &i
}

// ToUint8Ptr 将对象返回指针
func ToUint8Ptr(i uint8) *uint8 {
	return &i
}

// ToUint16Ptr 将对象返回指针
func ToUint16Ptr(i uint16) *uint16 {
	return &i
}

// ToUint32Ptr 将对象返回指针
func ToUint32Ptr(i uint32) *uint32 {
	return &i
}

// ToUint64Ptr 将对象返回指针
func ToUint64Ptr(i uint64) *uint64 {
	return &i
}

// ToFloat32Ptr 将对象返回指针
func ToFloat32Ptr(f float32) *float32 {
	return &f
}

// ToFloat64Ptr 将对象返回指针
func ToFloat64Ptr(f float64) *float64 {
	return &f
}

// ToTimePtr 将对象返回指针
func ToTimePtr(t time.Time) *time.Time {
	return &t
}
