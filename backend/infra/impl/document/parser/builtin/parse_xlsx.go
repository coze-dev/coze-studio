package builtin

import (
	"context"
	"io"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"
	"github.com/xuri/excelize/v2"

	contract "code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
)

func parseXLSX(config *contract.Config) parseFn {
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
