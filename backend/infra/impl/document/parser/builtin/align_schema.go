package builtin

import (
	"fmt"

	"code.byted.org/flow/opencoze/backend/infra/contract/document"
)

func alignTableSchema(a, b []*document.Column) error {
	// TODO: 非 indexing 列允许 schema 未对齐？
	if len(a) != len(b) {
		return fmt.Errorf("[alignTableSchema] length not same")
	}

	rev := make(map[string]struct{}, len(a))
	for i := range a {
		rev[a[i].Name] = struct{}{}
	}

	for _, colB := range b {
		if _, found := rev[colB.Name]; !found {
			return fmt.Errorf("[alignTableSchema] col name not found, name=%s", colB.Name)
		}
	}

	return nil
}

func alignTableSliceValue(schema []*document.Column, row []*document.ColumnData) (err error) {
	for i, col := range row {
		var newCol *document.ColumnData
		newCol, err = assertValAs(schema[i].Type, col.GetStringValue())
		if err != nil {
			return err
		}

		newCol.ColumnID = col.ColumnID
		newCol.ColumnName = col.ColumnName
		row[i] = newCol
	}

	return nil
}
