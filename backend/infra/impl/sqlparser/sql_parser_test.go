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

func stringPtr(dt string) *string {
	return &dt
}
