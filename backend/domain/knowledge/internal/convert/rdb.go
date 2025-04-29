package convert

import (
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	rdbEntity "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
)

func ConvertColumnType(columnType entity.TableColumnType) rdbEntity.DataType {
	switch columnType {
	case entity.TableColumnTypeBoolean:
		return rdbEntity.TypeBoolean
	case entity.TableColumnTypeInteger:
		return rdbEntity.TypeInt
	case entity.TableColumnTypeNumber:
		return rdbEntity.TypeFloat
	case entity.TableColumnTypeString, entity.TableColumnTypeImage:
		return rdbEntity.TypeText
	case entity.TableColumnTypeTime:
		return rdbEntity.TypeTimestamp
	default:
		return rdbEntity.TypeText
	}
}
