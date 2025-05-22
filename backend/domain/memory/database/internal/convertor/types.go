package convertor

import (
	"fmt"
	"strconv"
	"time"

	entity2 "code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/rdb/entity"
)

const (
	TimeFormat = "2006-01-02 15:04:05"
)

func SwitchToDataType(itemType entity2.FieldItemType) entity.DataType {
	switch itemType {
	case entity2.FieldItemType_Text:
		return entity.TypeVarchar
	case entity2.FieldItemType_Number:
		return entity.TypeBigInt
	case entity2.FieldItemType_Date:
		return entity.TypeTimestamp
	case entity2.FieldItemType_Float:
		return entity.TypeDouble
	case entity2.FieldItemType_Boolean:
		return entity.TypeBoolean
	default:
		// 默认使用 VARCHAR
		return entity.TypeVarchar
	}
}

// ConvertValueByType converts a string value to the specified type.
func ConvertValueByType(value string, fieldType entity2.FieldItemType) (interface{}, error) {
	if value == "" {
		return nil, nil
	}

	switch fieldType {
	case entity2.FieldItemType_Number:
		intVal, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			return 0, fmt.Errorf("cannot convert %s to number", value)
		}

		return intVal, nil

	case entity2.FieldItemType_Float:
		if floatVal, err := strconv.ParseFloat(value, 64); err == nil {
			return floatVal, nil
		}

		return 0.0, fmt.Errorf("cannot convert %s to float", value)

	case entity2.FieldItemType_Boolean:
		if boolVal, err := strconv.ParseBool(value); err == nil {
			return boolVal, nil
		}

		// if err, try 0/1
		if value == "0" {
			return false, nil
		}
		if value == "1" {
			return true, nil
		}

		return false, fmt.Errorf("cannot convert %s to boolean", value)

	case entity2.FieldItemType_Date:
		t, err := time.Parse(TimeFormat, value) // database use this format
		if err != nil {
			return "", fmt.Errorf("cannot convert %s to date", value)
		}

		return t.UTC(), nil

	case entity2.FieldItemType_Text:
		return value, nil

	default:
		return value, nil
	}
}

// ConvertDBValueToString converts a database value to a string.
func ConvertDBValueToString(value interface{}, fieldType entity2.FieldItemType) string {
	switch fieldType {
	case entity2.FieldItemType_Text:
		if byteArray, ok := value.([]uint8); ok {
			return string(byteArray)
		}

	case entity2.FieldItemType_Number:
		switch v := value.(type) {
		case int64:
			return strconv.FormatInt(v, 10)
		case []uint8:
			return string(v)
		}

	case entity2.FieldItemType_Float:
		switch v := value.(type) {
		case float64:
			return strconv.FormatFloat(v, 'f', -1, 64)
		case []uint8:
			return string(v)
		}

	case entity2.FieldItemType_Boolean:
		switch v := value.(type) {
		case bool:
			return strconv.FormatBool(v)
		case int64:
			return strconv.FormatBool(v != 0)
		case []uint8:
			boolStr := string(v)
			if boolStr == "1" || boolStr == "true" {
				return "true"
			}
			return "false"
		}

	case entity2.FieldItemType_Date:
		switch v := value.(type) {
		case time.Time:
			return v.Format(TimeFormat)
		case []uint8:
			return string(v)
		}
	}

	return fmt.Sprintf("%v", value)
}

// ConvertSystemFieldToString converts a system field value to a string.
func ConvertSystemFieldToString(fieldName string, value interface{}) string {
	switch fieldName {
	case entity.DefaultIDColName:
		if intVal, ok := value.(int64); ok {
			return strconv.FormatInt(intVal, 10)
		}
	case entity.DefaultUidColName, entity.DefaultCidColName:
		if byteArray, ok := value.([]uint8); ok {
			return string(byteArray)
		}
	case entity.DefaultCreateTimeColName:
		switch v := value.(type) {
		case time.Time:
			return v.Format(TimeFormat)
		case []uint8:
			// 尝试解析字符串表示的时间
			return string(v)
		}
	}

	return fmt.Sprintf("%v", value)
}

func ConvertLogicOperator(logic entity2.Logic) entity.LogicalOperator {
	switch logic {
	case entity2.Logic_And:
		return entity.AND
	case entity2.Logic_Or:
		return entity.OR
	default:
		return entity.AND // 默认使用AND
	}
}

func ConvertOperator(op entity2.Operation) entity.Operator {
	switch op {
	case entity2.Operation_EQUAL:
		return entity.OperatorEqual
	case entity2.Operation_NOT_EQUAL:
		return entity.OperatorNotEqual
	case entity2.Operation_GREATER_THAN:
		return entity.OperatorGreater
	case entity2.Operation_GREATER_EQUAL:
		return entity.OperatorGreaterEqual
	case entity2.Operation_LESS_THAN:
		return entity.OperatorLess
	case entity2.Operation_LESS_EQUAL:
		return entity.OperatorLessEqual
	case entity2.Operation_IN:
		return entity.OperatorIn
	case entity2.Operation_NOT_IN:
		return entity.OperatorNotIn
	case entity2.Operation_LIKE:
		return entity.OperatorLike
	case entity2.Operation_NOT_LIKE:
		return entity.OperatorNotLike
	case entity2.Operation_IS_NULL:
		return entity.OperatorIsNull
	case entity2.Operation_IS_NOT_NULL:
		return entity.OperatorIsNotNull
	default:
		return entity.OperatorEqual
	}
}
