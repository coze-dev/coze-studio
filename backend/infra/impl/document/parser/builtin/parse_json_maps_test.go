package builtin

import (
	"bytes"
	"context"
	"testing"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	contract "code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
)

func TestParseTableCustomContent(t *testing.T) {
	ctx := context.Background()
	b := []byte(`[{"col_string_indexing":"hello","col_string":"asd","col_int":"1","col_number":"1","col_bool":"true","col_time":"2006-01-02 15:04:05"},{"col_string_indexing":"bye","col_string":"","col_int":"2","col_number":"2.0","col_bool":"false","col_time":""}]`)
	reader := bytes.NewReader(b)
	config := &contract.Config{
		FileExtension: contract.FileExtensionJsonMaps,
		ParsingStrategy: &contract.ParsingStrategy{
			HeaderLine:    0,
			DataStartLine: 1,
			RowsCount:     10,
			Columns: []*document.Column{
				{
					ID:       0,
					Name:     "col_string_indexing",
					Type:     document.TableColumnTypeString,
					Nullable: false,
					Sequence: 0,
				},
				{
					ID:       0,
					Name:     "col_string",
					Type:     document.TableColumnTypeString,
					Nullable: false,
					Sequence: 1,
				},
				{
					ID:       0,
					Name:     "col_int",
					Type:     document.TableColumnTypeInteger,
					Nullable: false,
					Sequence: 2,
				},
				{
					ID:       0,
					Name:     "col_number",
					Type:     document.TableColumnTypeNumber,
					Nullable: true,
					Sequence: 3,
				},
				{
					ID:       0,
					Name:     "col_bool",
					Type:     document.TableColumnTypeBoolean,
					Nullable: true,
					Sequence: 4,
				},
				{
					ID:       0,
					Name:     "col_time",
					Type:     document.TableColumnTypeTime,
					Nullable: true,
					Sequence: 5,
				},
			},
		},
	}

	pfn := parseJSONMaps(config)
	docs, err := pfn(ctx, reader, parser.WithExtraMeta(map[string]any{
		"document_id":  int64(123),
		"knowledge_id": int64(456),
	}))
	assert.NoError(t, err)
	for _, doc := range docs {
		assertSheet(t, doc)
	}
}
