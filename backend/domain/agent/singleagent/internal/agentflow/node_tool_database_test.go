package agentflow

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/memory/database"
)

func TestFormatDatabaseResult(t *testing.T) {
	t.Run("normal case with data", func(t *testing.T) {
		rowsAffected := int64(1)
		resp := &database.ExecuteSQLResponse{
			Records: []map[string]string{
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
		resp := &database.ExecuteSQLResponse{
			Records: []map[string]string{},
		}

		result := formatDatabaseResult(resp)

		assert.Equal(t, "result is empty", result)
	})

	t.Run("result with rows affected only", func(t *testing.T) {
		rowsAffected := int64(5)
		resp := &database.ExecuteSQLResponse{
			Records:      []map[string]string{},
			RowsAffected: &rowsAffected,
		}

		result := formatDatabaseResult(resp)

		assert.Contains(t, result, "Rows affected: 5")
	})

	t.Run("result with null values", func(t *testing.T) {
		resp := &database.ExecuteSQLResponse{
			Records: []map[string]string{
				{"name": "ZhangSan", "age": "", "email": "zhangsan@example.com"},
				{"name": "LiSi", "age": "30", "email": ""},
			},
		}

		result := formatDatabaseResult(resp)

		assert.Contains(t, result, "|  | zhangsan@example.com | ZhangSan |")
		assert.Contains(t, result, "| 30 |  | LiSi |")
	})
}
