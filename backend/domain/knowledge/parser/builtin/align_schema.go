package builtin

import (
	"fmt"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
)

func alignTableSchema(a, b []*entity.TableColumn) error {
	if len(a) != len(b) {
		return fmt.Errorf("[alignTableSchema] length not same")
	}

	for i := range a {
		colA := a[i]
		colB := b[i]
		if colA.Name != colB.Name {
			return fmt.Errorf("[alignTableSchema] col name invalid, expect=%s, got=%s", colA.Name, colB.Name)
		}
	}

	return nil
}

func alignTableSliceValue(schema []*entity.TableColumn, slices []*entity.Slice) error {
	for _, slice := range slices {
		tbl := slice.RawContent[0].Table
		for i, col := range tbl.Columns {
			newCol, err := convert.AssertValAs(schema[i].Type, *col.ValString)
			if err != nil {
				return err
			}

			tbl.Columns[i] = *newCol
		}
	}

	return nil
}
