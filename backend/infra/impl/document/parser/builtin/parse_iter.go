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
	"encoding/json"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	contract "github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
)

type rowIterator interface {
	NextRow() (row []string, end bool, err error)
}

func parseByRowIterator(iter rowIterator, config *contract.Config, opts ...parser.Option) (
	docs []*schema.Document, err error) {

	ps := config.ParsingStrategy
	options := parser.GetCommonOptions(&parser.Options{}, opts...)
	i := 0
	columnsProvides := ps.IsAppend || len(ps.Columns) > 0
	rev := make(map[int]*document.Column)

	var (
		expColumns []*document.Column
		expData    [][]*document.ColumnData
	)

	for {
		row, end, err := iter.NextRow()
		if err != nil {
			return nil, err
		}
		if end {
			break
		}
		if i == ps.HeaderLine {
			if columnsProvides {
				expColumns = ps.Columns
			} else {
				for j, col := range row {
					expColumns = append(expColumns, &document.Column{
						Name:     col,
						Type:     document.TableColumnTypeUnknown,
						Sequence: j,
					})
				}
			}

			for j := range expColumns {
				tc := expColumns[j]
				rev[tc.Sequence] = tc
			}
		}

		if i >= ps.DataStartLine {
			var rowData []*document.ColumnData
			for j := range row {
				colSchema, found := rev[j]
				if !found { // column clipping
					continue
				}

				val := row[j]

				if columnsProvides {
					var data *document.ColumnData
					if config.ParsingStrategy.IgnoreColumnTypeErr {
						data = assertValAsForce(colSchema.Type, val, colSchema.Nullable)
					} else {
						data, err = assertValAs(colSchema.Type, val)
						if err != nil {
							return nil, err
						}
					}
					data.ColumnID = colSchema.ID
					data.ColumnName = colSchema.Name
					rowData = append(rowData, data)
				} else {
					exp := assertVal(val)
					colSchema.Type = transformColumnType(colSchema.Type, exp.Type)
					rowData = append(rowData, &document.ColumnData{
						ColumnID:   colSchema.ID,
						ColumnName: colSchema.Name,
						Type:       document.TableColumnTypeUnknown,
						ValString:  &val,
					})
				}
			}
			if rowData != nil {
				expData = append(expData, rowData)
			}
		}

		i++
		if ps.RowsCount != 0 && len(docs) == ps.RowsCount {
			break
		}
	}

	if !columnsProvides {
		// align data type when columns are provided
		for _, col := range expColumns {
			if col.Type == document.TableColumnTypeUnknown {
				col.Type = document.TableColumnTypeString
			}
		}
		for _, row := range expData {
			if err = alignTableSliceValue(expColumns, row); err != nil {
				return nil, err
			}
		}
	}

	if len(expData) == 0 {
		// return a special document with columns only if there is no data
		doc := &schema.Document{
			MetaData: map[string]any{
				document.MetaDataKeyColumns:     expColumns,
				document.MetaDataKeyColumnsOnly: struct{}{},
			},
		}
		for k, v := range options.ExtraMeta {
			doc.MetaData[k] = v
		}
		return []*schema.Document{doc}, nil
	}

	for j := range expData {
		contentMapping := make(map[string]string)
		for _, col := range expData[j] {
			contentMapping[col.ColumnName] = col.GetStringValue()
		}
		b, err := json.Marshal(contentMapping)
		if err != nil {
			return nil, err
		}
		doc := &schema.Document{
			Content: string(b), // set for tables in text
			MetaData: map[string]any{
				document.MetaDataKeyColumns:    expColumns,
				document.MetaDataKeyColumnData: expData[j],
			},
		}
		for k, v := range options.ExtraMeta {
			doc.MetaData[k] = v
		}
		docs = append(docs, doc)
	}

	return docs, nil
}
