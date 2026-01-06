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

package builtin

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"os"
	"testing"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/infra/document"
	contract "github.com/coze-dev/coze-studio/backend/infra/document/parser"
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
	p1 := ParseCSV(c1)
	docs, err := p1(ctx, r1, parser.WithExtraMeta(map[string]any{
		"document_id":  int64(123),
		"knowledge_id": int64(456),
	}))
	assert.NoError(t, err)
	for i, doc := range docs {
		assertSheet(t, i, doc)
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
	p2 := ParseCSV(c2)
	docs, err = p2(ctx, r2, parser.WithExtraMeta(map[string]any{
		"document_id":  int64(123),
		"knowledge_id": int64(456),
	}))
	assert.NoError(t, err)
	for i, doc := range docs {
		assertSheet(t, i, doc)
	}
}

func TestParseCSVBadCases(t *testing.T) {
	t.Run("test nil row", func(t *testing.T) {
		ctx := context.Background()
		f, err := os.Open("test_data/test_csv_badcase_1.csv")
		assert.NoError(t, err)
		b, err := io.ReadAll(f)
		assert.NoError(t, err)

		pfn := ParseCSV(&contract.Config{
			FileExtension: "csv",
			ParsingStrategy: &contract.ParsingStrategy{
				ExtractImage:        true,
				ExtractTable:        true,
				ImageOCR:            false,
				SheetID:             nil,
				HeaderLine:          0,
				DataStartLine:       1,
				RowsCount:           0,
				IsAppend:            false,
				Columns:             nil,
				IgnoreColumnTypeErr: true,
				ImageAnnotationType: 0,
			},
		})

		resp, err := pfn(ctx, bytes.NewReader(b))
		assert.NoError(t, err)
		assert.True(t, len(resp) > 0)
		cols, err := document.GetDocumentColumns(resp[0])
		assert.NoError(t, err)
		cols[5].Nullable = false
		npfn := ParseCSV(&contract.Config{
			FileExtension: "csv",
			ParsingStrategy: &contract.ParsingStrategy{
				ExtractImage:        true,
				ExtractTable:        true,
				ImageOCR:            false,
				SheetID:             nil,
				HeaderLine:          0,
				DataStartLine:       1,
				RowsCount:           0,
				IsAppend:            false,
				Columns:             cols,
				IgnoreColumnTypeErr: true,
				ImageAnnotationType: 0,
			},
		})
		resp, err = npfn(ctx, bytes.NewReader(b))
		assert.NoError(t, err)
		assert.True(t, len(resp) > 0)
		for _, item := range resp {
			data, err := document.GetDocumentColumnData(item)
			assert.NoError(t, err)
			assert.NotNil(t, data[5].GetValue())
		}
	})
}

func assertSheet(t *testing.T, i int, doc *schema.Document) {
	fmt.Printf("sheet[%d]:\n", i)
	assert.NotNil(t, doc.MetaData)
	assert.NotNil(t, doc.MetaData[document.MetaDataKeyColumns])
	cols, ok := doc.MetaData[document.MetaDataKeyColumns].([]*document.Column)
	assert.True(t, ok)
	assert.NotNil(t, doc.MetaData[document.MetaDataKeyColumnData])
	row, ok := doc.MetaData[document.MetaDataKeyColumnData].([]*document.ColumnData)
	assert.True(t, ok)
	assert.Equal(t, int64(123), doc.MetaData["document_id"].(int64))
	assert.Equal(t, int64(456), doc.MetaData["knowledge_id"].(int64))
	for j := range row {
		col := cols[j]
		val := row[j]
		fmt.Printf("row[%d]: %v=%v\n", j, col.Name, val.GetStringValue())
	}
}
