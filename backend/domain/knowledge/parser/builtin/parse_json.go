package builtin

import (
	"context"
	"encoding/json"
	"fmt"
	"io"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/parser"
)

func parseJSON(ctx context.Context, reader io.Reader, ps *entity.ParsingStrategy, doc *entity.Document) (result *parser.Result, err error) {
	b, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	var rawSlices []map[string]string
	if err = json.Unmarshal(b, &rawSlices); err != nil {
		return nil, err
	}

	if len(rawSlices) == 0 {
		return nil, fmt.Errorf("[parseJSON] json data is empty")
	}

	var header []string
	if doc.TableColumns != nil {
		for _, col := range doc.TableColumns {
			header = append(header, col.Name)
		}
	} else {
		for k := range rawSlices[0] {
			// init 取首个 json item 中 key 的随机顺序
			header = append(header, k)
		}
	}

	iter := &jsonIterator{
		header: header,
		rows:   rawSlices,
		i:      0,
	}

	return parseByRowIterator(ctx, iter, ps, doc)
}

type jsonIterator struct {
	header []string
	rows   []map[string]string
	i      int
}

func (j *jsonIterator) NextRow() (row []string, end bool, err error) {
	if j.i == 0 {
		j.i++
		return j.header, false, nil
	}

	if j.i == len(j.rows)+1 {
		return nil, true, nil
	}

	raw := j.rows[j.i-1]
	j.i++
	for _, h := range j.header {
		val, found := raw[h]
		if !found {
			return nil, false, fmt.Errorf("[json] val not found, key=%s", h)
		}
		row = append(row, val)
	}

	return row, false, nil
}
