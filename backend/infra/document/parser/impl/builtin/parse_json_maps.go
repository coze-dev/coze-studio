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
	"context"
	"encoding/json"
	"fmt"
	"io"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/infra/document"
	contract "github.com/coze-dev/coze-studio/backend/infra/document/parser"
)

func ParseJSONMaps(config *contract.Config) ParseFn {
	return func(ctx context.Context, reader io.Reader, opts ...parser.Option) (docs []*schema.Document, err error) {
		b, err := io.ReadAll(reader)
		if err != nil {
			return nil, err
		}

		var customContent []map[string]string
		if err = json.Unmarshal(b, &customContent); err != nil {
			return nil, err
		}

		if config.ParsingStrategy == nil {
			config.ParsingStrategy = &contract.ParsingStrategy{
				HeaderLine:    0,
				DataStartLine: 1,
				RowsCount:     0,
			}
		}

		iter := &customContentContainer{
			i:             0,
			colIdx:        nil,
			customContent: customContent,
			curColumns:    config.ParsingStrategy.Columns,
		}

		newConfig := &contract.Config{
			FileExtension: config.FileExtension,
			ParsingStrategy: &contract.ParsingStrategy{
				SheetID:       config.ParsingStrategy.SheetID,
				HeaderLine:    0,
				DataStartLine: 1,
				RowsCount:     0,
				IsAppend:      config.ParsingStrategy.IsAppend,
				Columns:       config.ParsingStrategy.Columns,
			},
			ChunkingStrategy: config.ChunkingStrategy,
		}

		return parseByRowIterator(iter, newConfig, opts...)
	}
}

type customContentContainer struct {
	i             int
	colIdx        map[string]int
	customContent []map[string]string
	curColumns    []*document.Column
}

func (c *customContentContainer) NextRow() (row []string, end bool, err error) {
	if c.i == 0 && c.colIdx == nil {
		if len(c.customContent) == 0 {
			return nil, false, fmt.Errorf("[customContentContainer] data is nil")
		}

		headerRow := c.customContent[0]
		founded := make(map[string]struct{})
		colIdx := make(map[string]int, len(headerRow))

		for _, col := range c.curColumns {
			name := col.Name
			if _, found := headerRow[name]; found {
				founded[name] = struct{}{}
				colIdx[name] = len(colIdx)
				row = append(row, name)
			}
		}
		for name := range headerRow {
			if _, found := founded[name]; !found {
				colIdx[name] = len(colIdx)
				row = append(row, name)
			}
		}

		c.colIdx = colIdx
		return row, false, nil
	}

	if c.i >= len(c.customContent) {
		return nil, true, nil
	}

	content := c.customContent[c.i]
	c.i++
	row = make([]string, len(content))

	for k, v := range content {
		idx, found := c.colIdx[k]
		if !found {
			return nil, false, fmt.Errorf("[customContentContainer] column not found, name=%s", k)
		}

		row[idx] = v
	}

	return row, false, nil
}
