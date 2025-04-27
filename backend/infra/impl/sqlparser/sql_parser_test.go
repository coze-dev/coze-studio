package sqlparser

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/infra/contract/sqlparser"
)

func TestSQLParser_ParseAndModifySQL(t *testing.T) {
	tests := []struct {
		name     string
		sql      string
		mappings map[string]sqlparser.TableColumn
		want     string
		wantErr  bool
	}{
		{
			name: "sql parser error",
			sql:  "SELECTS id, name FROM users WHERE age > 18",
			mappings: map[string]sqlparser.TableColumn{
				"users": {
					NewTableName: stringPtr("new_users"),
					ColumnMap: map[string]string{
						"id":   "user_id",
						"name": "user_name",
						"age":  "user_age",
					},
				},
			},
			want:    "",
			wantErr: true,
		},
		{
			name: "no new table name",
			sql:  "SELECT id, name FROM users WHERE age > 18",
			mappings: map[string]sqlparser.TableColumn{
				"users": {
					ColumnMap: map[string]string{
						"id":   "user_id",
						"name": "user_name",
						"age":  "user_age",
					},
				},
			},
			want:    "SELECT user_id,user_name FROM users WHERE user_age>18",
			wantErr: false,
		},
		{
			name: "input parameters error",
			sql:  "SELECT id, name FROM users WHERE age > 18",
			mappings: map[string]sqlparser.TableColumn{
				"users": {
					NewTableName: stringPtr("new_users"),
					ColumnMap: map[string]string{
						"id": "",
						"":   "user_name",
					},
				},
			},
			want:    "",
			wantErr: true,
		},
		{
			name: "select",
			sql:  "SELECT id, name FROM users WHERE age > ?",
			mappings: map[string]sqlparser.TableColumn{
				"users": {
					NewTableName: stringPtr("new_users"),
					ColumnMap: map[string]string{
						"id":   "user_id",
						"name": "user_name",
						"age":  "user_age",
					},
				},
			},
			want:    "SELECT user_id,user_name FROM new_users WHERE user_age>?",
			wantErr: false,
		},
		{
			name: "select",
			sql:  "SELECT id, name FROM users WHERE age > 20",
			mappings: map[string]sqlparser.TableColumn{
				"users": {
					NewTableName: stringPtr("new_users"),
					ColumnMap: map[string]string{
						"id":   "user_id",
						"name": "user_name",
						"age":  "user_age",
					},
				},
			},
			want:    "SELECT user_id,user_name FROM new_users WHERE user_age>20",
			wantErr: false,
		},
		{
			name: "alias",
			sql:  "SELECT u.id, u.name, o.order_id FROM users as u JOIN orders as o ON u.id = o.user_id",
			mappings: map[string]sqlparser.TableColumn{
				"users": {
					NewTableName: stringPtr("new_users"),
					ColumnMap: map[string]string{
						"id": "user_id",
					},
				},
				"orders": {
					NewTableName: stringPtr("new_orders"),
					ColumnMap: map[string]string{
						"order_id": "id",
						"user_id":  "customer_id",
					},
				},
			},
			want:    "SELECT u.user_id,u.name,o.id FROM new_users AS u JOIN new_orders AS o ON u.user_id=o.customer_id",
			wantErr: false,
		},
		{
			name: "alias",
			sql:  "SELECT u.id, u.name, o.order_id FROM users as u JOIN orders as o ON u.id = o.user_id",
			mappings: map[string]sqlparser.TableColumn{
				"users": {
					NewTableName: stringPtr("new_users"),
					ColumnMap: map[string]string{
						"id": "user_id",
					},
				},
			},
			want:    "SELECT u.user_id,u.name,o.order_id FROM new_users AS u JOIN orders AS o ON u.user_id=o.user_id",
			wantErr: false,
		},
		{
			name: "join query",
			sql:  "SELECT users.id, users.name, orders.order_id FROM users JOIN orders ON users.id = orders.user_id",
			mappings: map[string]sqlparser.TableColumn{
				"users": {
					NewTableName: stringPtr("new_users"),
					ColumnMap: map[string]string{
						"id": "user_id",
					},
				},
				"orders": {
					NewTableName: stringPtr("new_orders"),
					ColumnMap: map[string]string{
						"order_id": "id",
						"user_id":  "customer_id",
					},
				},
			},
			want:    "SELECT new_users.user_id,new_users.name,new_orders.id FROM new_users JOIN new_orders ON new_users.user_id=new_orders.customer_id",
			wantErr: false,
		},
		{
			name: "insert statement",
			sql:  "INSERT INTO users (id, name, age) VALUES (1, 'John', ?)",
			mappings: map[string]sqlparser.TableColumn{
				"users": {
					NewTableName: stringPtr("new_users"),
					ColumnMap: map[string]string{
						"id":   "user_id",
						"name": "user_name",
						"age":  "user_age",
					},
				},
			},
			want:    "INSERT INTO new_users (user_id,user_name,user_age) VALUES (1,'John',?)",
			wantErr: false,
		},
		{
			name: "update statement",
			sql:  "UPDATE users SET name = 'John', age = 25 WHERE id = 1",
			mappings: map[string]sqlparser.TableColumn{
				"users": {
					NewTableName: stringPtr("new_users"),
					ColumnMap: map[string]string{
						"id":   "user_id",
						"name": "user_name",
						"age":  "user_age",
					},
				},
			},
			want:    "UPDATE new_users SET user_name='John', user_age=25 WHERE user_id=1",
			wantErr: false,
		},
		{
			name: "only change table name",
			sql:  "UPDATE users SET name = 'John', age = 25 WHERE id = 1",
			mappings: map[string]sqlparser.TableColumn{
				"users": {
					NewTableName: stringPtr("new_users"),
				},
			},
			want:    "UPDATE new_users SET name='John', age=25 WHERE id=1",
			wantErr: false,
		},
		{
			name: "alias error",
			sql:  "SELECT u.id, u.name, o.order_id FROM (SELECT id, name FROM u) AS uu JOIN orders AS u ON uu.id = o.user_id;",
			mappings: map[string]sqlparser.TableColumn{
				"u": {
					NewTableName: stringPtr("new_users"),
					ColumnMap: map[string]string{
						"id":   "user_id",
						"name": "user_name",
					},
				},
			},
			want:    "",
			wantErr: true,
		},
	}

	parser := NewSQLParser()
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := parser.ParseAndModifySQL(tt.sql, tt.mappings)
			assert.Equal(t, tt.wantErr, err != nil)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestSQLParser_GetSQLOperation(t *testing.T) {
	tests := []struct {
		name    string
		sql     string
		want    sqlparser.OperationType
		wantErr bool
	}{
		{
			name:    "empty sql",
			sql:     "",
			want:    sqlparser.OperationTypeUnknown,
			wantErr: true,
		},
		{
			name:    "invalid sql",
			sql:     "SELECTS * FROM users",
			want:    sqlparser.OperationTypeUnknown,
			wantErr: true,
		},
		{
			name:    "select statement",
			sql:     "SELECT id, name FROM users WHERE age > 18",
			want:    sqlparser.OperationTypeSelect,
			wantErr: false,
		},
		{
			name:    "insert statement",
			sql:     "INSERT INTO users (id, name, age) VALUES (1, 'John', 25)",
			want:    sqlparser.OperationTypeInsert,
			wantErr: false,
		},
		{
			name:    "update statement",
			sql:     "UPDATE users SET name = 'John', age = 25 WHERE id = 1",
			want:    sqlparser.OperationTypeUpdate,
			wantErr: false,
		},
		{
			name:    "delete statement",
			sql:     "DELETE FROM users WHERE id = 1",
			want:    sqlparser.OperationTypeDelete,
			wantErr: false,
		},
		{
			name:    "create table statement",
			sql:     "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(255), age INT)",
			want:    sqlparser.OperationTypeCreate,
			wantErr: false,
		},
		{
			name:    "alter table statement",
			sql:     "ALTER TABLE users ADD COLUMN email VARCHAR(255)",
			want:    sqlparser.OperationTypeAlter,
			wantErr: false,
		},
		{
			name:    "drop table statement",
			sql:     "DROP TABLE users",
			want:    sqlparser.OperationTypeDrop,
			wantErr: false,
		},
		{
			name:    "truncate table statement",
			sql:     "TRUNCATE TABLE users",
			want:    sqlparser.OperationTypeTruncate,
			wantErr: false,
		},
		{
			name:    "complex select statement",
			sql:     "SELECT u.id, u.name FROM users u JOIN orders o ON u.id = o.user_id WHERE u.age > 18 ORDER BY u.name",
			want:    sqlparser.OperationTypeSelect,
			wantErr: false,
		},
		{
			name:    "complex statement",
			sql:     "UPDATE employees SET s = s * 1.15 WHERE d = ( SELECT id FROM departments WHERE name = 't')",
			want:    sqlparser.OperationTypeUpdate,
			wantErr: false,
		},
	}

	parser := NewSQLParser()
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := parser.GetSQLOperation(tt.sql)
			assert.Equal(t, tt.wantErr, err != nil)
			assert.Equal(t, tt.want, got)
		})
	}
}

func stringPtr(dt string) *string {
	return &dt
}
