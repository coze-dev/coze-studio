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

package sqlparser

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/infra/sqlparser"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
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
					NewTableName: ptr.Of("new_users"),
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
					NewTableName: ptr.Of("new_users"),
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
					NewTableName: ptr.Of("new_users"),
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
					NewTableName: ptr.Of("new_users"),
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
					NewTableName: ptr.Of("new_users"),
					ColumnMap: map[string]string{
						"id": "user_id",
					},
				},
				"orders": {
					NewTableName: ptr.Of("new_orders"),
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
					NewTableName: ptr.Of("new_users"),
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
					NewTableName: ptr.Of("new_users"),
					ColumnMap: map[string]string{
						"id": "user_id",
					},
				},
				"orders": {
					NewTableName: ptr.Of("new_orders"),
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
					NewTableName: ptr.Of("new_users"),
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
					NewTableName: ptr.Of("new_users"),
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
					NewTableName: ptr.Of("new_users"),
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
					NewTableName: ptr.Of("new_users"),
					ColumnMap: map[string]string{
						"id":   "user_id",
						"name": "user_name",
					},
				},
			},
			want:    "",
			wantErr: true,
		},
		{
			name: "alias error",
			sql:  "INSERT INTO database (name, age) VALUES ('Nick', 25);",
			mappings: map[string]sqlparser.TableColumn{
				"database": {
					NewTableName: ptr.Of("database_new"),
				},
			},
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

func TestImpl_AddColumnsToInsertSQL(t *testing.T) {
	tests := []struct {
		name            string
		origSQL         string
		addCols         []sqlparser.ColumnValue
		wantSQL         string
		isParam         bool
		primaryKeyValue *sqlparser.PrimaryKeyValue
	}{
		{
			name:    "add new columns to single row insert",
			origSQL: "INSERT INTO users (id, name) VALUES (1, 'name')",
			addCols: []sqlparser.ColumnValue{
				{
					ColName: "age",
					Value:   18,
				},
			},
			wantSQL: "INSERT INTO users (id,name,age) VALUES (1, 'name',18)",
		},
		{
			name:    "add new columns to multi-row insert",
			origSQL: "INSERT INTO users (id, name) VALUES (1, 'name'), (1, 'name')",
			addCols: []sqlparser.ColumnValue{
				{
					ColName: "age",
					Value:   18,
				},
			},
			primaryKeyValue: &sqlparser.PrimaryKeyValue{
				ColName: "pri_id",
				Values:  []interface{}{1, 2},
			},
			wantSQL: "INSERT INTO users (id,name,age,pri_id) VALUES (1, 'name',18,1), (1, 'name',18,2)",
		},
		{
			name:    "addCols is empty, no change",
			origSQL: "INSERT INTO users (id, name) VALUES (1, 'name')",
			addCols: []sqlparser.ColumnValue{},
			wantSQL: "INSERT INTO users (id, name) VALUES (1, 'name')",
		},
		{
			name:    "column already exists, do not add",
			origSQL: "INSERT INTO users (id, name) VALUES (1, 'name')",
			addCols: []sqlparser.ColumnValue{{
				ColName: "name",
				Value:   "abc",
			}},
			wantSQL: "INSERT INTO users (id, name) VALUES (1, 'name')",
		},
		{
			name:    "add new columns to single row insert",
			origSQL: "INSERT INTO users (id, name) VALUES (? ,?)",
			addCols: []sqlparser.ColumnValue{
				{
					ColName: "age",
				},
			},
			wantSQL: "INSERT INTO users (id,name,age) VALUES (?, ?, ?)",
			isParam: true,
		},
		{
			name:    "add new columns to single row insert",
			origSQL: "INSERT INTO users (id, name) VALUES (? ,?), (?, ?)",
			addCols: []sqlparser.ColumnValue{
				{
					ColName: "age",
				},
			},
			wantSQL: "INSERT INTO users (id,name,age) VALUES (?, ?, ?), (?, ?, ?)",
			isParam: true,
		},
	}

	parser := NewSQLParser()
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, _, err := parser.AddColumnsToInsertSQL(tt.origSQL, tt.addCols, tt.primaryKeyValue, tt.isParam)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			gotNorm := strings.ReplaceAll(got, " ", "")
			wantNorm := strings.ReplaceAll(tt.wantSQL, " ", "")
			if gotNorm != wantNorm {
				t.Errorf("got SQL: %s, want: %s", got, tt.wantSQL)
			}
		})
	}
}

func TestImpl_GetTableName(t *testing.T) {
	parser := NewSQLParser().(*Impl)
	tests := []struct {
		name    string
		sql     string
		want    string
		wantErr bool
	}{
		{
			name:    "select single table",
			sql:     "SELECT * FROM users WHERE id = 1",
			want:    "users",
			wantErr: false,
		},
		{
			name:    "insert single table",
			sql:     "INSERT INTO users (id, name) VALUES (1, 'a')",
			want:    "users",
			wantErr: false,
		},
		{
			name:    "update single table",
			sql:     "UPDATE users SET name = 'b' WHERE id = 2",
			want:    "users",
			wantErr: false,
		},
		{
			name:    "delete single table",
			sql:     "DELETE FROM users WHERE id = 3",
			want:    "users",
			wantErr: false,
		},
		{
			name:    "select join (unsupported)",
			sql:     "SELECT * FROM users u JOIN orders o ON u.id = o.user_id",
			want:    "users",
			wantErr: false,
		},
		{
			name:    "empty sql",
			sql:     "",
			want:    "",
			wantErr: true,
		},
		{
			name:    "invalid sql",
			sql:     "SELECTS * FROM users",
			want:    "",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tbl, err := parser.GetTableName(tt.sql)
			if tt.wantErr {
				if err == nil {
					t.Errorf("expected error, got nil")
				}
			} else {
				if err != nil {
					t.Errorf("unexpected error: %v", err)
				}
				if tbl != tt.want {
					t.Errorf("got table: %s, want: %s", tbl, tt.want)
				}
			}
		})
	}
}

func TestGetInsertDataNums(t *testing.T) {
	parser := NewSQLParser().(*Impl)

	tests := []struct {
		name    string
		sql     string
		want    int
		wantErr bool
	}{
		{
			name: "single row insert",
			sql:  "INSERT INTO users (name, age) VALUES ('Alice', 25);",
			want: 1,
		},
		{
			name: "multi-row insert",
			sql:  "INSERT INTO users (name, age) VALUES ('Alice', 25), ('Bob', 30);",
			want: 2,
		},
		{
			name: "multi-row insert",
			sql:  "INSERT INTO users (name, age) VALUES (?, ?), (?, ?), (?, ?), (?, ?);",
			want: 4,
		},
		{
			name:    "not an insert statement",
			sql:     "SELECT * FROM users;",
			wantErr: true,
		},
		{
			name:    "invalid sql",
			sql:     "INSERTT INTO users (name, age) VALUES ('Alice', 25);",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := parser.GetInsertDataNums(tt.sql)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, got)
			}
		})
	}
}

func TestAppendSQLFilter(t *testing.T) {
	parser := NewSQLParser().(*Impl)
	tests := []struct {
		name        string
		sql         string
		condition   string
		connector   string
		want        string
		wantErr     bool
		errContains string
	}{
		// tset - SELECT
		{
			name:      "SELECT - add AND to existing WHERE",
			sql:       "SELECT * FROM users WHERE age > 18",
			condition: "status = 'active'",
			connector: "AND",
			want:      " select * from `users` where `age`>18 and `status`='active'",
		},
		{
			name:      "SELECT - add OR to existing WHERE",
			sql:       "SELECT * FROM products WHERE price < 100",
			condition: "category = 'electronics'",
			connector: "OR",
			want:      "select * from `products` where `price`<100 or `category`='electronics'",
		},
		{
			name:      "SELECT - add AND to multiple conditions",
			sql:       "SELECT * FROM orders WHERE total > 50 AND status = 'completed'",
			condition: "customer_id = 123",
			connector: "AND",
			want:      "select * from `orders` where `total`>50 and `status`='completed' and `customer_id`=123",
		},
		{
			name:      "SELECT - add condition without WHERE",
			sql:       "SELECT id, name FROM customers",
			condition: "is_verified = 1",
			connector: "AND",
			want:      "select `id`,`name` from `customers` where `is_verified`=1",
		},

		// tset - UPDATE
		{
			name:      "UPDATE - add AND condition",
			sql:       "UPDATE users SET last_login = NOW() WHERE id = 42",
			condition: "is_active = true",
			connector: "AND",
			want:      "update `users` set `last_login`=now() where `id`=42 and `is_active`=true",
		},
		{
			name:      "UPDATE - add OR condition without WHERE",
			sql:       "UPDATE products SET discount = 0.1",
			condition: "inventory > 100",
			connector: "OR",
			want:      "update `products` set `discount`=0.1 where `inventory`>100",
		},

		// tset - DELETE
		{
			name:      "DELETE - add AND condition",
			sql:       "DELETE FROM logs WHERE created_at < '2023-01-01'",
			condition: "severity = 'DEBUG'",
			connector: "AND",
			want:      "delete from `logs` where `created_at`<'2023-01-01' and `severity`='debug'",
		},
		{
			name:      "DELETE - add OR condition",
			sql:       "DELETE FROM sessions WHERE expires_at < NOW()",
			condition: "invalid = true",
			connector: "OR",
			want:      "delete from `sessions` where `expires_at`<now() or `invalid`=true",
		},

		// tset - complex expr
		{
			name:      "Complex condition with parentheses",
			sql:       "SELECT * FROM orders WHERE `status` = 'shipped'",
			condition: "(total > 100 OR priority = 1)",
			connector: "AND",
			want:      "select * from `orders` where `status`='shipped' and (`total`>100 or `priority`=1)",
		},
		{
			name:      "Add condition to existing parentheses",
			sql:       "SELECT * FROM users WHERE (age > 18 OR parent_consent = true) AND country = 'US'",
			condition: "is_verified = 1",
			connector: "AND",
			want:      "select * from `users` where (`age`>18 or `parent_consent`=true) and `country`='us' and `is_verified`=1",
		},

		// tset - JOIN
		{
			name:      "SELECT with JOIN",
			sql:       "SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id WHERE u.country = 'US'",
			condition: "o.status = 'completed'",
			connector: "AND",
			want:      "select `u`.`name`,`o`.`total` from `users` as `u` join `orders` as `o` on `u`.`id`=`o`.`user_id` where `u`.`country`='us' and `o`.`status`='completed'",
		},
		{
			name:      "SELECT with multiple joins",
			sql:       "SELECT p.name, c.category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.price < 50",
			condition: "c.parent_id = 1",
			connector: "AND",
			want:      "select `p`.`name`,`c`.`category_name` from `products` as `p` join `categories` as `c` on `p`.`category_id`=`c`.`id` where `p`.`price`<50 and `c`.`parent_id`=1",
		},

		// test - case sensitive
		{
			name:        "Mixed case connector",
			sql:         "SELECT * FROM users WHERE age > 18",
			condition:   "status = 'active'",
			connector:   "aNd",
			want:        "",
			wantErr:     true,
			errContains: "invalid filter operator",
		},
		{
			name:      "Mixed case condition",
			sql:       "SELECT * FROM products",
			condition: "CaTegorY = 'ELECTRONICS'",
			connector: "AND",
			want:      "select * from `products` where `category`='electronics'",
		},

		// test - error case
		{
			name:        "Empty SQL",
			sql:         "",
			condition:   "id = 1",
			connector:   "AND",
			wantErr:     true,
			errContains: "empty SQL statement",
		},
		{
			name:        "Empty condition",
			sql:         "SELECT * FROM users",
			condition:   "",
			connector:   "AND",
			wantErr:     true,
			errContains: "empty filter condition",
		},
		{
			name:        "Invalid connector",
			sql:         "SELECT * FROM users",
			condition:   "is_active = true",
			connector:   "",
			wantErr:     true,
			errContains: "invalid filter operator",
		},
		{
			name:        "Unsupported statement type",
			sql:         "CREATE TABLE users (id INT, name VARCHAR(255))",
			condition:   "id > 0",
			connector:   "AND",
			wantErr:     true,
			errContains: "only support SELECT/UPDATE/DELETE",
		},
		{
			name:        "Malformed SQL",
			sql:         "SELECTZ * FRON users",
			condition:   "id = 1",
			connector:   "AND",
			wantErr:     true,
			errContains: "failed to parse SQL",
		},
		{
			name:        "Malformed condition",
			sql:         "SELECT * FROM users",
			condition:   "id ==",
			connector:   "AND",
			wantErr:     true,
			errContains: "parse filter condition failed",
		},
	}

	// run case
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := parser.AppendSQLFilter(tt.sql, sqlparser.SQLFilterOp(tt.connector), tt.condition)

			if tt.wantErr {
				if err == nil {
					t.Fatal("Expected error, got nil")
				}
				if tt.errContains != "" && !strings.Contains(err.Error(), tt.errContains) {
					t.Errorf("Expected error to contain %q, got %q", tt.errContains, err.Error())
				}
				return
			}

			if err != nil {
				t.Fatalf("Unexpected error: %v", err)
			}

			normalizedResult := strings.ToLower(strings.Join(strings.Fields(result), " "))
			normalizedWant := strings.ToLower(strings.Join(strings.Fields(tt.want), " "))
			if !strings.EqualFold(normalizedResult, normalizedWant) {
				t.Errorf("Result mismatch:\nWant: %s\nGot:  %s", normalizedWant, normalizedResult)
			}
		})
	}

}

func TestAddSliceIdColumn(t *testing.T) {
	parser := NewSQLParser().(*Impl)

	tests := []struct {
		name     string
		input    string
		expected string
		wantErr  bool
	}{
		{
			name:     "simple select",
			input:    "SELECT name, age FROM users",
			expected: "SELECT `name`,`age`,`pk_id` FROM `users`",
		},
		{
			name:     "select star",
			input:    "SELECT * FROM users",
			expected: "SELECT * FROM users",
		},
		{
			name:     "count function",
			input:    "SELECT COUNT(*) FROM users",
			expected: "SELECT COUNT(*) FROM users",
		},
		{
			name:     "complex aggregate",
			input:    "SELECT AVG(age), MAX(score) FROM users",
			expected: "SELECT AVG(age), MAX(score) FROM users",
		},
		{
			name:     "with alias",
			input:    "SELECT u.name, u.age FROM users u",
			expected: "SELECT `u`.`name`,`u`.`age`,`pk_id` FROM `users` AS `u`",
		},
		{
			name:     "sql is empty",
			input:    "",
			expected: "",
			wantErr:  true,
		},
		{
			name:     "sql is not select",
			input:    "INSERT INTO users (name, age) VALUES ('Alice', 30)",
			expected: "",
			wantErr:  true,
		},
		{
			name:     "sql is wrong",
			input:    "SELECT * users WHERE name = 'Alice'",
			expected: "",
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := parser.AddSelectFieldsToSelectSQL(tt.input, []string{"pk_id"})
			if (err != nil) != tt.wantErr {
				t.Errorf("addSliceIdColumn() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !strings.EqualFold(strings.TrimSpace(got), strings.TrimSpace(tt.expected)) {
				t.Errorf("addSliceIdColumn() = %v, want %v", got, tt.expected)
			}
		})
	}
}
