package builtin

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	contract "code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
)

func TestParseCSV(t *testing.T) {
	ctx := context.Background()
	b, err := os.ReadFile("./test_data/test_csv.csv")
	assert.NoError(t, err)

	r1 := bytes.NewReader(b)
	c1 := &contract.Config{
		FileExtension: contract.FileExtensionCSV,
		ParsingStrategy: &contract.ParsingStrategy{
			HeaderLine:    0,
			DataStartLine: 1,
			RowsCount:     20,
		},
		ChunkingStrategy: nil,
	}
	p1 := parseCSV(c1)
	docs, err := p1(ctx, r1, parser.WithExtraMeta(map[string]any{
		"document_id":  int64(123),
		"knowledge_id": int64(456),
	}))
	assert.NoError(t, err)
	for _, doc := range docs {
		assertSheet(t, doc)
	}

	// parse
	r2 := bytes.NewReader(b)
	c2 := &contract.Config{
		FileExtension: contract.FileExtensionCSV,
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
		ChunkingStrategy: nil,
	}
	p2 := parseCSV(c2)
	docs, err = p2(ctx, r2, parser.WithExtraMeta(map[string]any{
		"document_id":  int64(123),
		"knowledge_id": int64(456),
	}))
	assert.NoError(t, err)
	for _, doc := range docs {
		assertSheet(t, doc)
	}
}

func assertSheet(t *testing.T, doc *schema.Document) {
	assert.NotNil(t, doc.MetaData)
	assert.NotNil(t, doc.MetaData[document.MetaDataKeyColumns])
	cols, ok := doc.MetaData[document.MetaDataKeyColumns].([]*document.Column)
	assert.True(t, ok)
	assert.NotNil(t, doc.MetaData[document.MetaDataKeyColumnData])
	vals, ok := doc.MetaData[document.MetaDataKeyColumnData].([][]*document.ColumnData)
	assert.True(t, ok)
	assert.Equal(t, int64(123), doc.MetaData["document_id"].(int64))
	assert.Equal(t, int64(456), doc.MetaData["knowledge_id"].(int64))
	for i, row := range vals {
		for j := range row {
			col := cols[j]
			val := row[j]
			fmt.Printf("row[%d][%d]: %v=%v\n", i, j, col.Name, val.GetStringValue())
		}
	}
}
