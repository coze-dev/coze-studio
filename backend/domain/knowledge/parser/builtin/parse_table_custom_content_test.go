package builtin

import (
	"bytes"
	"context"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
)

func TestParseTableCustomContent(t *testing.T) {
	ctx := context.Background()
	b := []byte(`[{"col_string_indexing":"hello","col_string":"asd","col_int":"1","col_number":"1","col_bool":"true","col_time":"2006-01-02 15:04:05"},{"col_string_indexing":"bye","col_string":"","col_int":"2","col_number":"2.0","col_bool":"false","col_time":""}]`)
	reader := bytes.NewReader(b)
	cols, slices, err := parseTableCustomContent(ctx, reader, &entity.ParsingStrategy{
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
	for _, col := range cols {
		fmt.Println(col.Name, col.Type)
	}
	for _, row := range slices {
		content := row.RawContent[0]
		for _, col := range content.Table.Columns {
			fmt.Println(col.ColumnID, col.ColumnName, col.GetStringValue())
		}
	}

}
