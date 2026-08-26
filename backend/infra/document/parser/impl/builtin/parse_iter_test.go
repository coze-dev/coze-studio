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
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/coze-dev/coze-studio/backend/infra/document"
	contract "github.com/coze-dev/coze-studio/backend/infra/document/parser"
)

type sliceRowIterator struct {
	rows [][]string
	idx  int
}

func (s *sliceRowIterator) NextRow() (row []string, end bool, err error) {
	if s.idx >= len(s.rows) {
		return nil, true, nil
	}
	r := s.rows[s.idx]
	s.idx++
	return r, false, nil
}

// TestParseByRowIteratorRowsCount verifies that ParsingStrategy.RowsCount
// limits how many data rows are actually parsed.
func TestParseByRowIteratorRowsCount(t *testing.T) {
	iter := &sliceRowIterator{
		rows: [][]string{
			{"name", "age"},
			{"a", "1"},
			{"b", "2"},
			{"c", "3"},
			{"d", "4"},
			{"e", "5"},
			{"f", "6"},
			{"g", "7"},
		},
	}
	cfg := &contract.Config{
		ParsingStrategy: &contract.ParsingStrategy{
			HeaderLine:    0,
			DataStartLine: 1,
			RowsCount:     3,
			Columns: []*document.Column{
				{Name: "name", Type: document.TableColumnTypeString, Sequence: 0},
				{Name: "age", Type: document.TableColumnTypeString, Sequence: 1},
			},
		},
	}

	docs, err := parseByRowIterator(iter, cfg)
	require.NoError(t, err)
	require.Len(t, docs, 3, "RowsCount=3 must cap the number of parsed rows")
}

// TestParseByRowIteratorAllRows verifies RowsCount=0 means no limit.
func TestParseByRowIteratorAllRows(t *testing.T) {
	iter := &sliceRowIterator{
		rows: [][]string{
			{"name", "age"},
			{"a", "1"},
			{"b", "2"},
			{"c", "3"},
		},
	}
	cfg := &contract.Config{
		ParsingStrategy: &contract.ParsingStrategy{
			HeaderLine:    0,
			DataStartLine: 1,
			RowsCount:     0,
			Columns: []*document.Column{
				{Name: "name", Type: document.TableColumnTypeString, Sequence: 0},
				{Name: "age", Type: document.TableColumnTypeString, Sequence: 1},
			},
		},
	}

	docs, err := parseByRowIterator(iter, cfg)
	require.NoError(t, err)
	require.Len(t, docs, 3, "RowsCount=0 should parse all rows")
}
