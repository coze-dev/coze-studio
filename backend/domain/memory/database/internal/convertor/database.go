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

	"github.com/coze-dev/coze-studio/backend/api/model/data/database/table"
	"github.com/coze-dev/coze-studio/backend/infra/rdb/entity"
)

func ConvertResultSetToString(resultSet *entity.ResultSet, physicalToFieldName map[string]string, physicalToFieldType map[string]table.FieldItemType) []map[string]string {
	records := make([]map[string]string, 0, len(resultSet.Rows))

	for _, row := range resultSet.Rows {
		record := make(map[string]string)

		for physicalName, value := range row {
			if logicalName, exists := physicalToFieldName[physicalName]; exists {
				if value == nil {
					record[logicalName] = ""
				} else {
					fieldType, hasType := physicalToFieldType[physicalName]
					if hasType {
						convertedValue := ConvertDBValueToString(value, fieldType)
						record[logicalName] = convertedValue
					} else {
						record[logicalName] = fmt.Sprintf("%v", value)
					}
				}
			} else {
				if value == nil {
					record[physicalName] = ""
				} else {
					record[physicalName] = ConvertSystemFieldToString(physicalName, value)
				}
			}
		}
		records = append(records, record)
	}

	return records
}

func ConvertResultSet(resultSet *entity.ResultSet, physicalToFieldName map[string]string, physicalToFieldType map[string]table.FieldItemType) []map[string]any {
	records := make([]map[string]any, 0, len(resultSet.Rows))

	for _, row := range resultSet.Rows {
		record := make(map[string]any)

		for physicalName, value := range row {
			if logicalName, exists := physicalToFieldName[physicalName]; exists {
				record[logicalName] = value
			} else {
				record[physicalName] = value
			}
		}
		records = append(records, record)
	}

	return records
}
