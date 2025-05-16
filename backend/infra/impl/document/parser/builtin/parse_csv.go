package builtin

import (
	"context"
	"encoding/csv"
	"errors"
	"io"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"
	"github.com/dimchansky/utfbom"

	contract "code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
)

func parseCSV(config *contract.Config) parseFn {
	return func(ctx context.Context, reader io.Reader, opts ...parser.Option) (docs []*schema.Document, err error) {
		iter := &csvIterator{csv.NewReader(utfbom.SkipOnly(reader))}
		return parseByRowIterator(iter, config, opts...)
	}
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
