package convert

import (
	rdbEntity "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/document"
)

func ConvertColumnType(columnType document.TableColumnType) rdbEntity.DataType {
	switch columnType {
	case document.TableColumnTypeBoolean:
		return rdbEntity.TypeBoolean
	case document.TableColumnTypeInteger:
		return rdbEntity.TypeBigInt
	case document.TableColumnTypeNumber:
		return rdbEntity.TypeDouble
	case document.TableColumnTypeString, document.TableColumnTypeImage:
		return rdbEntity.TypeText
	case document.TableColumnTypeTime:
		return rdbEntity.TypeTimestamp
	default:
		return rdbEntity.TypeText
	}
}
