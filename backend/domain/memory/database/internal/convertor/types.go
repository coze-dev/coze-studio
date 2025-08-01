/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package convertor

import (
	"fmt"
	"strconv"
	"time"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/api/model/table"
	"github.com/coze-dev/coze-studio/backend/infra/contract/rdb/entity"
)

const (
	TimeFormat = "2006-01-02 15:04:05"
)

func SwitchToDataType(itemType table.FieldItemType) entity.DataType {
	switch itemType {
	case table.FieldItemType_Text:
		return entity.TypeText
	case table.FieldItemType_Number:
		return entity.TypeBigInt
	case table.FieldItemType_Date:
		return entity.TypeTimestamp
	case table.FieldItemType_Float:
		return entity.TypeDouble
	case table.FieldItemType_Boolean:
		return entity.TypeBoolean
	default:
		// VARCHAR is used by default
		return entity.TypeVarchar
	}
}

// ConvertValueByType converts a string value to the specified type.
func ConvertValueByType(value string, fieldType table.FieldItemType) (interface{}, error) {
	if value == "" {
		return nil, nil
	}

	switch fieldType {
	case table.FieldItemType_Number:
		intVal, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			return 0, fmt.Errorf("cannot convert %s to number", value)
		}

		return intVal, nil

	case table.FieldItemType_Float:
		if floatVal, err := strconv.ParseFloat(value, 64); err == nil {
			return floatVal, nil
		}

		return 0.0, fmt.Errorf("cannot convert %s to float", value)

	case table.FieldItemType_Boolean:
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

	case table.FieldItemType_Date:
		t, err := time.Parse(TimeFormat, value) // database use this format
		if err != nil {
			return "", fmt.Errorf("cannot convert %s to date", value)
		}

		return t, nil

	case table.FieldItemType_Text:
		return value, nil

	default:
		return value, nil
	}
}

// ConvertDBValueToString converts a database value to a string.
func ConvertDBValueToString(value interface{}, fieldType table.FieldItemType) string {
	switch fieldType {
	case table.FieldItemType_Text:
		if byteArray, ok := value.([]uint8); ok {
			return string(byteArray)
		}

	case table.FieldItemType_Number:
		switch v := value.(type) {
		case int64:
			return strconv.FormatInt(v, 10)
		case []uint8:
			return string(v)
		}

	case table.FieldItemType_Float:
		switch v := value.(type) {
		case float64:
			return strconv.FormatFloat(v, 'f', -1, 64)
		case []uint8:
			return string(v)
		}

	case table.FieldItemType_Boolean:
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

	case table.FieldItemType_Date:
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
	case database.DefaultIDColName:
		if intVal, ok := value.(int64); ok {
			return strconv.FormatInt(intVal, 10)
		}
	case database.DefaultUidColName, database.DefaultCidColName:
		if byteArray, ok := value.([]uint8); ok {
			return string(byteArray)
		}
	case database.DefaultCreateTimeColName:
		switch v := value.(type) {
		case time.Time:
			return v.Format(TimeFormat)
		case []uint8:
			// Attempt to parse the time represented by a string
			return string(v)
		}
	}

	return fmt.Sprintf("%v", value)
}

func ConvertLogicOperator(logic database.Logic) entity.LogicalOperator {
	switch logic {
	case database.Logic_And:
		return entity.AND
	case database.Logic_Or:
		return entity.OR
	default:
		return entity.AND // Default use AND
	}
}

func ConvertOperator(op database.Operation) entity.Operator {
	switch op {
	case database.Operation_EQUAL:
		return entity.OperatorEqual
	case database.Operation_NOT_EQUAL:
		return entity.OperatorNotEqual
	case database.Operation_GREATER_THAN:
		return entity.OperatorGreater
	case database.Operation_GREATER_EQUAL:
		return entity.OperatorGreaterEqual
	case database.Operation_LESS_THAN:
		return entity.OperatorLess
	case database.Operation_LESS_EQUAL:
		return entity.OperatorLessEqual
	case database.Operation_IN:
		return entity.OperatorIn
	case database.Operation_NOT_IN:
		return entity.OperatorNotIn
	case database.Operation_LIKE:
		return entity.OperatorLike
	case database.Operation_NOT_LIKE:
		return entity.OperatorNotLike
	case database.Operation_IS_NULL:
		return entity.OperatorIsNull
	case database.Operation_IS_NOT_NULL:
		return entity.OperatorIsNotNull
	default:
		return entity.OperatorEqual
	}
}
