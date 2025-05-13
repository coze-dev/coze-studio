package builtin

import (
	"fmt"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/consts"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
)

func alignTableSchema(a, b []*entity.TableColumn) error {
	for i := len(a) - 1; i >= 0; i-- {
		if a[i].Name == consts.RDBFieldID {
			a = append(a[:i], a[i+1:]...)
		}
	}

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

func alignTableSliceValue(schema []*entity.TableColumn, slices []*entity.Slice) (err error) {
	for _, slice := range slices {
		tbl := slice.RawContent[0].Table
		for i, col := range tbl.Columns {
			var newCol *entity.TableColumnData
			if col.ColumnName == consts.RDBFieldID {
				newCol = &entity.TableColumnData{
					Type: entity.TableColumnTypeInteger,
				}
			} else {
				newCol, err = convert.AssertValAs(schema[i].Type, col.GetStringValue())
			}

			if err != nil {
				return err
			}

			newCol.ColumnID = col.ColumnID
			newCol.ColumnName = col.ColumnName
			tbl.Columns[i] = *newCol
		}
	}

	return nil
}
