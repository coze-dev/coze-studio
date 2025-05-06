package builtin

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
)

func TestParseXLSX(t *testing.T) {
	ctx := context.Background()
	b, err := os.ReadFile("./test_data/test_xlsx.xlsx")
	assert.NoError(t, err)
	r2 := bytes.NewReader(b)

	ts, slices, err := parseXLSX(ctx, r2, &entity.ParsingStrategy{
		SheetID:       0,
		HeaderLine:    0,
		DataStartLine: 1,
		RowsCount:     10,
	}, &entity.Document{
		Info: common.Info{
			ID:   123,
			Name: "doc_name",
		},
		KnowledgeID: 456,
		TableInfo: entity.TableInfo{
			Columns: []*entity.TableColumn{
				{
					ID:       0,
					Name:     "col_string_indexing",
					Type:     entity.TableColumnTypeString,
					Indexing: true,
					Sequence: 0,
				},
				{
					ID:       0,
					Name:     "col_string",
					Type:     entity.TableColumnTypeString,
					Indexing: false,
					Sequence: 1,
				},
				{
					ID:       0,
					Name:     "col_int",
					Type:     entity.TableColumnTypeInteger,
					Indexing: true,
					Sequence: 2,
				},
				{
					ID:       0,
					Name:     "col_number",
					Type:     entity.TableColumnTypeNumber,
					Indexing: false,
					Sequence: 3,
				},
				{
					ID:       0,
					Name:     "col_bool",
					Type:     entity.TableColumnTypeBoolean,
					Indexing: false,
					Sequence: 4,
				},
				{
					ID:       0,
					Name:     "col_time",
					Type:     entity.TableColumnTypeTime,
					Indexing: false,
					Sequence: 5,
				},
			},
		},
	})
	assert.NoError(t, err)
	for _, col := range ts {
		fmt.Println(col.Name, col.Type)
	}
	for _, row := range slices {
		content := row.RawContent[0]
		for _, col := range content.Table.Columns {
			fmt.Println(col.ColumnID, col.ColumnName, col.GetStringValue())
		}
	}
}
