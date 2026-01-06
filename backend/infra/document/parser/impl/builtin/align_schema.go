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
	"github.com/coze-dev/coze-studio/backend/infra/document"
)

func alignTableSliceValue(schema []*document.Column, row []*document.ColumnData) (err error) {
	for i, col := range row {
		var newCol *document.ColumnData
		newCol, err = assertValAs(schema[i].Type, col.GetStringValue())
		if err != nil {
			return err
		}

		newCol.ColumnID = col.ColumnID
		newCol.ColumnName = col.ColumnName
		row[i] = newCol
	}

	return nil
}
