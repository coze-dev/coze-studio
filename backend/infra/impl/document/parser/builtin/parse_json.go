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

	contract "github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
)

func parseJSON(config *contract.Config) parseFn {
	return func(ctx context.Context, reader io.Reader, opts ...parser.Option) (docs []*schema.Document, err error) {
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
		if config.ParsingStrategy.IsAppend {
			for _, col := range config.ParsingStrategy.Columns {
				header = append(header, col.Name)
			}
		} else {
			for k := range rawSlices[0] {
				// Init takes the random order of keys in the first json item
				header = append(header, k)
			}
		}

		iter := &jsonIterator{
			header: header,
			rows:   rawSlices,
			i:      0,
		}

		return parseByRowIterator(iter, config, opts...)
	}
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
			row = append(row, "")
		} else {
			row = append(row, val)
		}
	}

	return row, false, nil
}
