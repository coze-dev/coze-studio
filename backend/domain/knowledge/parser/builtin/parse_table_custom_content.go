package builtin

import (
	"context"
	"encoding/json"
	"fmt"
	"io"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

func parseTableCustomContent(ctx context.Context, reader io.Reader, _ *entity.ParsingStrategy, doc *entity.Document) (
	tableSchema []*entity.TableColumn, slices []*entity.Slice, err error) {

	b, err := io.ReadAll(reader)
	if err != nil {
		return nil, nil, err
	}

	var customContent []map[string]string
	if err = json.Unmarshal(b, &customContent); err != nil {
		return nil, nil, err
	}

	iter := &customContentContainer{
		i:             0,
		colIdx:        nil,
		customContent: customContent,
	}

	newPS := &entity.ParsingStrategy{
		HeaderLine:    0,
		DataStartLine: 1,
		RowsCount:     0,
	}

	return parseByRowIterator(ctx, iter, newPS, doc)
}

type customContentContainer struct {
	i             int
	colIdx        map[string]int
	customContent []map[string]string
}

func (c *customContentContainer) NextRow() (row []string, end bool, err error) {
	if c.i == 0 && c.colIdx == nil {
		if len(c.customContent) == 0 {
			return nil, false, fmt.Errorf("[customContentContainer] data is nil")
		}

		colIdx := make(map[string]int, len(c.customContent[0]))
		for key := range c.customContent[0] {
			colIdx[key] = len(colIdx)
			row = append(row, key)
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
