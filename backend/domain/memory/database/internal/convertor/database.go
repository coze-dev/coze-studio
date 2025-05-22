package convertor

import (
	"fmt"

	entity2 "code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/rdb/entity"
)

func ConvertResultSet(resultSet *entity.ResultSet, physicalToFieldName map[string]string, physicalToFieldType map[string]entity2.FieldItemType) []map[string]string {
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
