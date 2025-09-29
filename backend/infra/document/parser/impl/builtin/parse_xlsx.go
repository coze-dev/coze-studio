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
	"io"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"
	"github.com/xuri/excelize/v2"

	contract "github.com/coze-dev/coze-studio/backend/infra/document/parser"
)

func ParseXLSX(config *contract.Config) ParseFn {
	return func(ctx context.Context, reader io.Reader, opts ...parser.Option) (docs []*schema.Document, err error) {
		f, err := excelize.OpenReader(reader)
		if err != nil {
			return nil, err
		}

		sheetID := 0
		if config.ParsingStrategy.SheetID != nil {
			sheetID = *config.ParsingStrategy.SheetID
		}

		rows, err := f.Rows(f.GetSheetName(sheetID))
		if err != nil {
			return nil, err
		}

		iter := &xlsxIterator{rows, 0}

		return parseByRowIterator(iter, config, opts...)
	}
}

type xlsxIterator struct {
	rows         *excelize.Rows
	firstRowSize int
}

func (x *xlsxIterator) NextRow() (row []string, end bool, err error) {
	end = !x.rows.Next()
	if end {
		return nil, end, nil
	}

	row, err = x.rows.Columns()
	if err != nil {
		return nil, false, err
	}

	if x.firstRowSize == 0 {
		x.firstRowSize = len(row)
	} else if x.firstRowSize > len(row) {
		row = append(row, make([]string, x.firstRowSize-len(row))...)
	} else if x.firstRowSize < len(row) {
		row = row[:x.firstRowSize]
	}

	return row, false, nil
}
