package builtin

import (
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"io"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/parser"
)

func parseCSV(ctx context.Context, reader io.Reader, ps *entity.ParsingStrategy, doc *entity.Document) (result *parser.Result, err error) {
	if ps.HeaderLine >= ps.DataStartLine {
		return nil, fmt.Errorf("[parseCSV] invalid header line and data start line")
	}
	iter := &csvIterator{csv.NewReader(reader)}
	return parseByRowIterator(ctx, iter, ps, doc)
}

type csvIterator struct {
	reader *csv.Reader
}

func (c *csvIterator) NextRow() (row []string, end bool, err error) {
	row, e := c.reader.Read()
	if e != nil {
		if errors.Is(e, io.EOF) {
			return nil, true, nil
		}
		return nil, false, err
	}

	return row, false, nil
}
