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

package agentflow

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/domain/memory/database/service"
)

func TestFormatDatabaseResult(t *testing.T) {
	t.Run("normal case with data", func(t *testing.T) {
		rowsAffected := int64(1)
		resp := &service.ExecuteSQLResponse{
			Records: []map[string]any{
				{"name": "ZhangSan", "age": "25"},
				{"name": "LiSi", "age": "30"},
			},
			RowsAffected: &rowsAffected,
		}

		result := formatDatabaseResult(resp)

		assert.Contains(t, result, "name")
		assert.Contains(t, result, "age")
		assert.Contains(t, result, "ZhangSan")
		assert.Contains(t, result, "25")
		assert.Contains(t, result, "LiSi")
		assert.Contains(t, result, "30")
		assert.Contains(t, result, "Rows affected: 1")

		assert.Contains(t, result, "| age | name |")
	})

	t.Run("empty result", func(t *testing.T) {
		resp := &service.ExecuteSQLResponse{
			Records: []map[string]any{},
		}

		result := formatDatabaseResult(resp)

		assert.Equal(t, "result is empty", result)
	})

	t.Run("result with rows affected only", func(t *testing.T) {
		rowsAffected := int64(5)
		resp := &service.ExecuteSQLResponse{
			Records:      []map[string]any{},
			RowsAffected: &rowsAffected,
		}

		result := formatDatabaseResult(resp)

		assert.Contains(t, result, "Rows affected: 5")
	})

	t.Run("result with null values", func(t *testing.T) {
		resp := &service.ExecuteSQLResponse{
			Records: []map[string]any{
				{"name": "ZhangSan", "age": "", "email": "zhangsan@example.com"},
				{"name": "LiSi", "age": "30", "email": ""},
			},
		}

		result := formatDatabaseResult(resp)

		assert.Contains(t, result, "|  | zhangsan@example.com | ZhangSan |")
		assert.Contains(t, result, "| 30 |  | LiSi |")
	})
}
