package physicaltable

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/api/model/table"
	entity2 "code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/internal/convertor"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func CreatePhysicalTable(ctx context.Context, db rdb.RDB, columns []*entity.Column) (*rdb.CreateTableResponse, error) {
	table := &entity.Table{
		Columns: columns,
	}
	// get indexes
	indexes := make([]*entity.Index, 0)
	indexes = append(indexes, &entity.Index{
		Name:    "PRIMARY",
		Type:    entity.PrimaryKey,
		Columns: []string{entity.DefaultIDColName},
	})
	indexes = append(indexes, &entity.Index{
		Name:    "idx_uid",
		Type:    entity.NormalKey,
		Columns: []string{entity.DefaultUidColName, entity.DefaultCidColName},
	})
	table.Indexes = indexes

	physicalTableRes, err := db.CreateTable(ctx, &rdb.CreateTableRequest{Table: table})
	if err != nil {
		return nil, err
	}

	return physicalTableRes, nil
}

func CreateFieldInfo(ctx context.Context, generator idgen.IDGenerator, fieldItems []*entity2.FieldItem) ([]*entity2.FieldItem, []*entity.Column, error) {
	columns := make([]*entity.Column, len(fieldItems))

	fieldID := int64(1)
	for i, field := range fieldItems {
		field.AlterID = fieldID
		field.PhysicalName = GetFieldPhysicsName(fieldID)

		columns[i] = &entity.Column{
			Name:     GetFieldPhysicsName(fieldID),
			DataType: convertor.SwitchToDataType(field.Type),
			NotNull:  field.MustRequired,
			Comment:  &field.Desc,
		}

		fieldID++ // field is incremented begin from 1
	}

	columns = append(columns, GetDefaultColumns()...)

	return fieldItems, columns, nil
}

func IsDefaultColumn(colName string) bool {
	defaultCols := getDefaultColumns()

	for _, defaultCol := range defaultCols {
		if colName == defaultCol.Name {
			return true
		}
	}
	return false
}

func GetDefaultColumns() []*entity.Column {
	return getDefaultColumns()
}

func getDefaultColumns() []*entity.Column {
	return []*entity.Column{
		{
			Name:          entity.DefaultIDColName,
			DataType:      entity.TypeBigInt,
			NotNull:       true,
			AutoIncrement: true,
		},
		{
			Name:     entity.DefaultUidColName,
			DataType: entity.TypeVarchar,
			NotNull:  true,
		},
		{
			Name:     entity.DefaultCidColName,
			DataType: entity.TypeVarchar,
			NotNull:  true,
		},
		{
			Name:         entity.DefaultCreateTimeColName,
			DataType:     entity.TypeTimestamp,
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
func UpdateFieldInfo(newFieldItems []*entity2.FieldItem, existingFieldItems []*entity2.FieldItem) ([]*entity2.FieldItem, []*entity.Column, []string, error) {
	existingFieldMap := make(map[int64]*entity2.FieldItem)
	maxAlterID := int64(-1)
	for _, field := range existingFieldItems {
		if field.AlterID > 0 {
			existingFieldMap[field.AlterID] = field
			maxAlterID = max(maxAlterID, field.AlterID)
		}
	}

	newFieldIDs := make(map[int64]bool)

	updatedColumns := make([]*entity.Column, 0, len(newFieldItems))
	updatedFieldItems := make([]*entity2.FieldItem, 0, len(newFieldItems))

	for _, field := range newFieldItems {
		if field.AlterID > 0 {
			// update field
			newFieldIDs[field.AlterID] = true
			updatedFieldItems = append(updatedFieldItems, field)

			updatedColumns = append(updatedColumns, &entity.Column{
				Name:     GetFieldPhysicsName(field.AlterID),
				DataType: convertor.SwitchToDataType(field.Type),
				NotNull:  field.MustRequired,
				Comment:  &field.Desc,
			})
		} else {
			fieldID := maxAlterID + 1 // auto increment begin from existing maxAlterID
			field.AlterID = fieldID
			field.PhysicalName = GetFieldPhysicsName(fieldID)
			updatedFieldItems = append(updatedFieldItems, field)

			updatedColumns = append(updatedColumns, &entity.Column{
				Name:     GetFieldPhysicsName(fieldID),
				DataType: convertor.SwitchToDataType(field.Type),
				NotNull:  field.MustRequired,
				Comment:  &field.Desc,
			})
		}
	}

	droppedColumns := make([]string, 0, len(existingFieldMap))
	// get dropped columns
	for alterID, _ := range existingFieldMap {
		if !newFieldIDs[alterID] {
			droppedColumns = append(droppedColumns, GetFieldPhysicsName(alterID))
		}
	}

	return updatedFieldItems, updatedColumns, droppedColumns, nil
}

// UpdatePhysicalTableWithDrops 更新物理表结构，包括显式指定要删除的列
func UpdatePhysicalTableWithDrops(ctx context.Context, db rdb.RDB, existingTable *entity.Table, newColumns []*entity.Column, droppedColumns []string, tableName string) error {
	// 创建列名到列的映射
	existingColumnMap := make(map[string]*entity.Column)
	for _, col := range existingTable.Columns {
		existingColumnMap[col.Name] = col
	}

	// 收集要添加和修改的列
	var columnsToAdd, columnsToModify []*entity.Column

	// 查找要添加和修改的列
	for _, newCol := range newColumns {
		if _, exists := existingColumnMap[newCol.Name]; exists {
			columnsToModify = append(columnsToModify, newCol)
		} else {
			columnsToAdd = append(columnsToAdd, newCol)
		}
	}

	// 应用变更到物理表
	if len(columnsToAdd) > 0 || len(columnsToModify) > 0 || len(droppedColumns) > 0 {
		// build AlterTableRequest
		alterReq := &rdb.AlterTableRequest{
			TableName:  tableName,
			Operations: getOperation(columnsToAdd, columnsToModify, droppedColumns),
		}

		// 执行表结构变更
		_, err := db.AlterTable(ctx, alterReq)
		if err != nil {
			return err
		}
	}

	return nil
}

// getOperation 将列的添加、修改和删除操作转换为 AlterTableOperation 数组
func getOperation(columnsToAdd, columnsToModify []*entity.Column, droppedColumns []string) []*rdb.AlterTableOperation {
	operations := make([]*rdb.AlterTableOperation, 0)

	// 处理添加列操作
	for _, column := range columnsToAdd {
		operations = append(operations, &rdb.AlterTableOperation{
			Action: entity.AddColumn,
			Column: column,
		})
	}

	// 处理修改列操作
	for _, column := range columnsToModify {
		operations = append(operations, &rdb.AlterTableOperation{
			Action: entity.ModifyColumn,
			Column: column,
		})
	}

	// 处理删除列操作
	for _, columnName := range droppedColumns {
		operations = append(operations, &rdb.AlterTableOperation{
			Action: entity.DropColumn,
			Column: &entity.Column{Name: columnName},
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

func GetCreateTimeField() *entity2.FieldItem {
	return &entity2.FieldItem{
		Name:          entity.DefaultCreateTimeColName,
		Desc:          "create time",
		Type:          entity2.FieldItemType_Date,
		MustRequired:  false,
		IsSystemField: true,
		AlterID:       103,
		PhysicalName:  entity.DefaultCreateTimeColName,
	}
}

func GetUidField() *entity2.FieldItem {
	return &entity2.FieldItem{
		Name:          entity.DefaultUidColName,
		Desc:          "user id",
		Type:          entity2.FieldItemType_Text,
		MustRequired:  false,
		IsSystemField: true,
		AlterID:       101,
		PhysicalName:  entity.DefaultUidColName,
	}
}

func GetConnectIDField() *entity2.FieldItem {
	return &entity2.FieldItem{
		Name:          entity.DefaultCidColName,
		Desc:          "connector id",
		Type:          entity2.FieldItemType_Text,
		MustRequired:  false,
		IsSystemField: true,
		AlterID:       104,
		PhysicalName:  entity.DefaultCidColName,
	}
}

func GetIDField() *entity2.FieldItem {
	return &entity2.FieldItem{
		Name:          entity.DefaultIDColName,
		Desc:          "primary_key",
		Type:          entity2.FieldItemType_Number,
		MustRequired:  false,
		IsSystemField: true,
		AlterID:       102,
		PhysicalName:  entity.DefaultIDColName,
	}
}
