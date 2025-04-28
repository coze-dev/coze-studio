package builtin

import (
	"context"
	"io"

	"github.com/xuri/excelize/v2"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

func parseXLSX(ctx context.Context, reader io.Reader, ps *entity.ParsingStrategy, doc *entity.Document) (
	tableSchema []*entity.TableColumn, slices []*entity.Slice, err error) {

	f, err := excelize.OpenReader(reader)
	if err != nil {
		return nil, nil, err
	}

	rows, err := f.Rows(f.GetSheetName(int(ps.SheetID)))
	if err != nil {
		return nil, nil, err
	}

	iter := &xlsxIterator{rows}

	return parseByRowIterator(ctx, iter, ps, doc)
}

type xlsxIterator struct {
	rows *excelize.Rows
}

func (x *xlsxIterator) NextRow() (row []string, end bool, err error) {
	end = x.rows.Next()
	if end {
		return nil, end, nil
	}

	row, err = x.rows.Columns()
	if err != nil {
		return nil, false, err
	}

	return row, false, nil
}
