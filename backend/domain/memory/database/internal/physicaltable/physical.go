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

package physicaltable

import (
	"context"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/database"
	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/api/model/table"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/internal/convertor"
	"github.com/coze-dev/coze-studio/backend/infra/contract/rdb"
	entity3 "github.com/coze-dev/coze-studio/backend/infra/contract/rdb/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func CreatePhysicalTable(ctx context.Context, db rdb.RDB, columns []*entity3.Column) (*rdb.CreateTableResponse, error) {
	table := &entity3.Table{
		Columns: columns,
	}
	// get indexes
	indexes := make([]*entity3.Index, 0)
	indexes = append(indexes, &entity3.Index{
		Name:    "PRIMARY",
		Type:    entity3.PrimaryKey,
		Columns: []string{database.DefaultIDColName},
	})
	indexes = append(indexes, &entity3.Index{
		Name:    "idx_uid",
		Type:    entity3.NormalKey,
		Columns: []string{database.DefaultUidColName, database.DefaultCidColName},
	})
	table.Indexes = indexes

	physicalTableRes, err := db.CreateTable(ctx, &rdb.CreateTableRequest{Table: table})
	if err != nil {
		return nil, err
	}

	return physicalTableRes, nil
}

func CreateFieldInfo(fieldItems []*model.FieldItem) ([]*model.FieldItem, []*entity3.Column) {
	columns := make([]*entity3.Column, len(fieldItems))

	fieldID := int64(1)
	for i, field := range fieldItems {
		field.AlterID = fieldID
		field.PhysicalName = GetFieldPhysicsName(fieldID)

		columns[i] = &entity3.Column{
			Name:     GetFieldPhysicsName(fieldID),
			DataType: convertor.SwitchToDataType(field.Type),
			NotNull:  field.MustRequired,
			Comment:  &field.Desc,
		}

		if field.Type == table.FieldItemType_Text && !field.MustRequired {
			columns[i].DefaultValue = ptr.Of("")
		}

		fieldID++ // field is incremented begin from 1
	}

	columns = append(columns, GetDefaultColumns()...)

	return fieldItems, columns
}

func GetDefaultColumns() []*entity3.Column {
	return getDefaultColumns()
}

func getDefaultColumns() []*entity3.Column {
	return []*entity3.Column{
		{
			Name:          database.DefaultIDColName,
			DataType:      entity3.TypeBigInt,
			NotNull:       true,
			AutoIncrement: true,
		},
		{
			Name:     database.DefaultUidColName,
			DataType: entity3.TypeVarchar,
			NotNull:  true,
		},
		{
			Name:     database.DefaultCidColName,
			DataType: entity3.TypeVarchar,
			NotNull:  true,
		},
		{
			Name:         database.DefaultCreateTimeColName,
			DataType:     entity3.TypeTimestamp,
			NotNull:      true,
			DefaultValue: ptr.Of("CURRENT_TIMESTAMP"),
		},
	}
}

func GetTablePhysicsName(tableID int64) string {
	return fmt.Sprintf("table_%d", tableID)
}

func GetFieldPhysicsName(fieldID int64) string {
	return fmt.Sprintf("f_%d", fieldID)
}

// UpdateFieldInfo handles field information updates.
// 1. If alterID exists, use alterID to update existing fields.
// 2. If alterID does not exist, add new fields.
// 3. Delete fields that have alterIDs not present in the new list.
func UpdateFieldInfo(newFieldItems []*database.FieldItem, existingFieldItems []*database.FieldItem) ([]*database.FieldItem, []*entity3.Column, []string, error) {
	existingFieldMap := make(map[int64]*database.FieldItem)
	maxAlterID := int64(-1)
	for _, field := range existingFieldItems {
		if field.AlterID > 0 {
			existingFieldMap[field.AlterID] = field
			maxAlterID = max(maxAlterID, field.AlterID)
		}
	}

	newFieldIDs := make(map[int64]bool)

	updatedColumns := make([]*entity3.Column, 0, len(newFieldItems))
	updatedFieldItems := make([]*database.FieldItem, 0, len(newFieldItems))

	for _, field := range newFieldItems {
		if field.AlterID > 0 {
			// update field
			newFieldIDs[field.AlterID] = true
			field.PhysicalName = GetFieldPhysicsName(field.AlterID)
			updatedFieldItems = append(updatedFieldItems, field)

			updatedColumns = append(updatedColumns, &entity3.Column{
				Name:     GetFieldPhysicsName(field.AlterID),
				DataType: convertor.SwitchToDataType(field.Type),
				NotNull:  field.MustRequired,
				Comment:  &field.Desc,
			})
		} else {
			fieldID := maxAlterID + 1 // auto increment begin from existing maxAlterID
			maxAlterID++
			field.AlterID = fieldID
			field.PhysicalName = GetFieldPhysicsName(fieldID)
			updatedFieldItems = append(updatedFieldItems, field)

			updatedColumns = append(updatedColumns, &entity3.Column{
				Name:     GetFieldPhysicsName(fieldID),
				DataType: convertor.SwitchToDataType(field.Type),
				NotNull:  field.MustRequired,
				Comment:  &field.Desc,
			})
		}
	}

	droppedColumns := make([]string, 0, len(existingFieldMap))
	// get dropped columns
	for alterID := range existingFieldMap {
		if !newFieldIDs[alterID] {
			droppedColumns = append(droppedColumns, GetFieldPhysicsName(alterID))
		}
	}

	return updatedFieldItems, updatedColumns, droppedColumns, nil
}

// UpdatePhysicalTableWithDrops update the physical table structure, including explicitly specifying columns to drop
func UpdatePhysicalTableWithDrops(ctx context.Context, db rdb.RDB, existingTable *entity3.Table, newColumns []*entity3.Column, droppedColumns []string, tableName string) error {
	// Create a column name-to-column mapping
	existingColumnMap := make(map[string]*entity3.Column)
	for _, col := range existingTable.Columns {
		existingColumnMap[col.Name] = col
	}

	// Collect columns to add and modify
	var columnsToAdd, columnsToModify []*entity3.Column

	// Find columns to add and modify
	for _, newCol := range newColumns {
		if _, exists := existingColumnMap[newCol.Name]; exists {
			columnsToModify = append(columnsToModify, newCol)
		} else {
			columnsToAdd = append(columnsToAdd, newCol)
		}
	}

	// Apply changes to physical tables
	if len(columnsToAdd) > 0 || len(columnsToModify) > 0 || len(droppedColumns) > 0 {
		// build AlterTableRequest
		alterReq := &rdb.AlterTableRequest{
			TableName:  tableName,
			Operations: getOperation(columnsToAdd, columnsToModify, droppedColumns),
		}

		// Perform table structure changes
		_, err := db.AlterTable(ctx, alterReq)
		if err != nil {
			return err
		}
	}

	return nil
}

// getOperation converts column add, modify, and delete operations into an AlterTableOperation array
func getOperation(columnsToAdd, columnsToModify []*entity3.Column, droppedColumns []string) []*rdb.AlterTableOperation {
	operations := make([]*rdb.AlterTableOperation, 0)

	// Handle add column operations
	for _, column := range columnsToAdd {
		operations = append(operations, &rdb.AlterTableOperation{
			Action: entity3.AddColumn,
			Column: column,
		})
	}

	// Handle modify column operations
	for _, column := range columnsToModify {
		operations = append(operations, &rdb.AlterTableOperation{
			Action: entity3.ModifyColumn,
			Column: column,
		})
	}

	// Handle delete column operations
	for _, columnName := range droppedColumns {
		operations = append(operations, &rdb.AlterTableOperation{
			Action: entity3.DropColumn,
			Column: &entity3.Column{Name: columnName},
		})
	}

	return operations
}

func GetTemplateTypeMap() map[table.FieldItemType]string {
	return map[table.FieldItemType]string{
		table.FieldItemType_Boolean: "false",
		table.FieldItemType_Number:  "0",
		table.FieldItemType_Date:    "0001-01-01 00:00:00",
		table.FieldItemType_Text:    "",
		table.FieldItemType_Float:   "0",
	}
}

func GetCreateTimeField() *database.FieldItem {
	return &database.FieldItem{
		Name:          database.DefaultCreateTimeColName,
		Desc:          "create time",
		Type:          table.FieldItemType_Date,
		MustRequired:  false,
		IsSystemField: true,
		AlterID:       103,
		PhysicalName:  database.DefaultCreateTimeColName,
	}
}

func GetUidField() *database.FieldItem {
	return &database.FieldItem{
		Name:          database.DefaultUidColName,
		Desc:          "user id",
		Type:          table.FieldItemType_Text,
		MustRequired:  false,
		IsSystemField: true,
		AlterID:       101,
		PhysicalName:  database.DefaultUidColName,
	}
}

func GetConnectIDField() *database.FieldItem {
	return &database.FieldItem{
		Name:          database.DefaultCidColName,
		Desc:          "connector id",
		Type:          table.FieldItemType_Text,
		MustRequired:  false,
		IsSystemField: true,
		AlterID:       104,
		PhysicalName:  database.DefaultCidColName,
	}
}

func GetIDField() *database.FieldItem {
	return &database.FieldItem{
		Name:          database.DefaultIDColName,
		Desc:          "primary_key",
		Type:          table.FieldItemType_Number,
		MustRequired:  false,
		IsSystemField: true,
		AlterID:       102,
		PhysicalName:  database.DefaultIDColName,
	}
}

func GetDisplayCreateTimeField() *database.FieldItem {
	return &database.FieldItem{
		Name:          database.DefaultCreateTimeDisplayColName,
		Desc:          "create time",
		Type:          table.FieldItemType_Date,
		MustRequired:  false,
		IsSystemField: true,
		AlterID:       103,
		PhysicalName:  database.DefaultCreateTimeDisplayColName,
	}
}

func GetDisplayUidField() *database.FieldItem {
	return &database.FieldItem{
		Name:          database.DefaultUidDisplayColName,
		Desc:          "user id",
		Type:          table.FieldItemType_Text,
		MustRequired:  false,
		IsSystemField: true,
		AlterID:       101,
		PhysicalName:  database.DefaultUidDisplayColName,
	}
}

func GetDisplayIDField() *database.FieldItem {
	return &database.FieldItem{
		Name:          database.DefaultIDDisplayColName,
		Desc:          "primary_key",
		Type:          table.FieldItemType_Number,
		MustRequired:  false,
		IsSystemField: true,
		AlterID:       102,
		PhysicalName:  database.DefaultIDDisplayColName,
	}
}
