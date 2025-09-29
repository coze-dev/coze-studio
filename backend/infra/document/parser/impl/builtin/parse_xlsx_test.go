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
	"os"
	"testing"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/infra/document"
	contract "github.com/coze-dev/coze-studio/backend/infra/document/parser"
)

func TestParseXLSX(t *testing.T) {
	ctx := context.Background()
	b, err := os.ReadFile("./test_data/test_xlsx.xlsx")
	assert.NoError(t, err)
	reader := bytes.NewReader(b)
	config := &contract.Config{
		FileExtension: contract.FileExtensionXLSX,
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
					Nullable: true,
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

	pfn := ParseXLSX(config)
	docs, err := pfn(ctx, reader, parser.WithExtraMeta(map[string]any{
		"document_id":  int64(123),
		"knowledge_id": int64(456),
	}))
	assert.NoError(t, err)
	for i, doc := range docs {
		assertSheet(t, i, doc)
	}
}

func TestParseXLSXConvertColumnType(t *testing.T) {
	ctx := context.Background()
	b, err := os.ReadFile("./test_data/test_xlsx.xlsx")
	assert.NoError(t, err)
	reader := bytes.NewReader(b)
	config := &contract.Config{
		FileExtension: contract.FileExtensionXLSX,
		ParsingStrategy: &contract.ParsingStrategy{
			HeaderLine:          0,
			DataStartLine:       1,
			RowsCount:           10,
			IgnoreColumnTypeErr: true,
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
					Type:     document.TableColumnTypeInteger, // string -> int: null
					Nullable: true,
					Sequence: 1,
				},
				{
					ID:       0,
					Name:     "col_int",
					Type:     document.TableColumnTypeString, // int -> string: strconv
					Nullable: false,
					Sequence: 2,
				},
				{
					ID:       0,
					Name:     "col_number",
					Type:     document.TableColumnTypeString, // float -> string: strconv
					Nullable: true,
					Sequence: 3,
				},
				//{
				//	ID:       0,
				//	Name:     "col_bool",
				//	Type:     document.TableColumnTypeBoolean, // trim
				//	Nullable: true,
				//	Sequence: 4,
				//},
				//{
				//	ID:       0,
				//	Name:     "col_time",
				//	Type:     document.TableColumnTypeTime, // trim
				//	Nullable: true,
				//	Sequence: 5,
				//},
			},
		},
		ChunkingStrategy: nil,
	}

	pfn := ParseXLSX(config)
	docs, err := pfn(ctx, reader, parser.WithExtraMeta(map[string]any{
		"document_id":  int64(123),
		"knowledge_id": int64(456),
	}))
	assert.NoError(t, err)
	for i, doc := range docs {
		assertSheet(t, i, doc)
	}
}
