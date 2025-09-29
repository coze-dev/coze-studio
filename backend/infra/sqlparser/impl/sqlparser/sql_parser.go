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
	"fmt"
	"strings"

	"github.com/pingcap/tidb/pkg/parser"
	"github.com/pingcap/tidb/pkg/parser/ast"
	"github.com/pingcap/tidb/pkg/parser/format"
	"github.com/pingcap/tidb/pkg/parser/mysql"
	"github.com/pingcap/tidb/pkg/parser/opcode"
	_ "github.com/pingcap/tidb/pkg/parser/test_driver"

	"github.com/coze-dev/coze-studio/backend/infra/sqlparser"
)

// Impl implements the SQLParser interface
type Impl struct {
	parser *parser.Parser
}

// NewSQLParser creates a new SQL parser
func NewSQLParser() sqlparser.SQLParser {
	p := parser.New()
	return &Impl{
		parser: p,
	}
}

// ParseAndModifySQL implements the SQLParser interface

func (p *Impl) ParseAndModifySQL(sql string, tableColumns map[string]sqlparser.TableColumn) (string, error) {
	if len(tableColumns) == 0 {
		return sql, nil
	}

	// check tableColumns
	for originalTableName, tableColumn := range tableColumns {
		if originalTableName == "" {
			return "", fmt.Errorf("original TableName must be non-empty")
		}

		// Check if ColumnMap is either empty or all key-value pairs are non-empty
		if tableColumn.ColumnMap != nil {
			for key, value := range tableColumn.ColumnMap {
				if (key == "") != (value == "") {
					return "", fmt.Errorf("ColumnMap key and value must be either both empty or both non-empty")
				}
			}
		}
	}

	// Parse SQL
	stmt, err := p.parser.ParseOneStmt(sql, mysql.UTF8MB4Charset, mysql.UTF8MB4GeneralCICollation)
	if err != nil {
		return "", fmt.Errorf("failed to parse SQL: %v", err)
	}

	// First pass: collect all table aliases
	aliasCollector := NewAliasCollector()
	stmt.Accept(aliasCollector)

	for originalTableName, _ := range tableColumns {
		if _, ok := aliasCollector.tableAliases[originalTableName]; ok {
			return "", fmt.Errorf("alisa table name should not equal with origin table name")
		}
	}

	// Second pass: modify the AST with collected aliases
	modifier := NewSQLModifier(tableColumns, aliasCollector.tableAliases)
	stmt.Accept(modifier)

	// Convert modified AST back to SQL
	var sb strings.Builder
	// Use single quotes for string values & remove charset prefix
	flags := format.RestoreStringSingleQuotes | format.RestoreStringWithoutCharset
	restoreCtx := format.NewRestoreCtx(flags, &sb)
	err = stmt.Restore(restoreCtx)
	if err != nil {
		return "", fmt.Errorf("failed to restore SQL: %v", err)
	}

	return sb.String(), nil
}

// AliasCollector collects table aliases in a first pass
type AliasCollector struct {
	tableAliases map[string]string // key is alias, value is original table name
}

// NewAliasCollector creates a new alias collector
func NewAliasCollector() *AliasCollector {
	return &AliasCollector{
		tableAliases: make(map[string]string),
	}
}

// Enter implements ast.Visitor interface
func (c *AliasCollector) Enter(n ast.Node) (ast.Node, bool) {
	if node, ok := n.(*ast.TableSource); ok {
		if ts, nameOk := node.Source.(*ast.TableName); nameOk {
			if node.AsName.L != "" {
				c.tableAliases[node.AsName.L] = ts.Name.L
			}
		}
	}
	return n, false
}

// Leave implements ast.Visitor interface
func (c *AliasCollector) Leave(n ast.Node) (ast.Node, bool) {
	return n, true
}

// SQLModifier is used to modify SQL AST
type SQLModifier struct {
	tableMap     map[string]string            // key is original table name, value is new table name
	columnMap    map[string]map[string]string // key is table name, value is column name mapping
	tableAliases map[string]string            // key is table alias, value is original table name
}

// NewSQLModifier creates a new SQL modifier with pre-collected aliases
func NewSQLModifier(tableColumns map[string]sqlparser.TableColumn, tableAliases map[string]string) *SQLModifier {
	modifier := &SQLModifier{
		tableMap:     make(map[string]string),
		columnMap:    make(map[string]map[string]string),
		tableAliases: tableAliases,
	}

	// Initialize table and column name mappings
	for originalTableName, tableColumn := range tableColumns {
		if tableColumn.NewTableName != nil && *tableColumn.NewTableName != "" {
			modifier.tableMap[originalTableName] = *tableColumn.NewTableName
		}
		modifier.columnMap[originalTableName] = tableColumn.ColumnMap
	}

	return modifier
}

// Enter implements ast.Visitor interface
func (m *SQLModifier) Enter(n ast.Node) (ast.Node, bool) {
	switch node := n.(type) {
	case *ast.TableName:
		// Replace table name
		if newTableName, ok := m.tableMap[node.Name.L]; ok {
			// Modify all related fields of table name
			node.Name.L = newTableName
			node.Name.O = newTableName
		}
	case *ast.ColumnName:
		// Replace column name with the appropriate mapping
		if node.Table.L != "" {
			// Get the table name or alias
			tableRef := node.Table.L

			// If this is an alias, look up the original table name for column mapping
			originalTable, isAlias := m.tableAliases[tableRef]

			if isAlias {
				// For aliased tables, apply column mapping using the original table name
				if columnMap, ok := m.columnMap[originalTable]; ok {
					if newColName, colOk := columnMap[node.Name.L]; colOk {
						node.Name.L = newColName
						node.Name.O = newColName
					}
				}
			} else {
				// For direct table references (not aliases)
				if newTableName, ok := m.tableMap[tableRef]; ok {
					node.Table.L = newTableName
					node.Table.O = newTableName
				}

				if columnMap, ok := m.columnMap[tableRef]; ok {
					if newColName, colOk := columnMap[node.Name.L]; colOk {
						node.Name.L = newColName
						node.Name.O = newColName
					}
				}
			}
		} else {
			// Handle columns without table qualifiers
			for _, columnMap := range m.columnMap {
				if newColName, ok := columnMap[node.Name.L]; ok {
					node.Name.L = newColName
					node.Name.O = newColName
					break
				}
			}
		}
	}
	return n, false
}

// Leave implements ast.Visitor interface
func (m *SQLModifier) Leave(n ast.Node) (ast.Node, bool) {
	return n, true
}

// GetSQLOperation implements the SQLParser interface
func (p *Impl) GetSQLOperation(sql string) (sqlparser.OperationType, error) {
	if sql == "" {
		return sqlparser.OperationTypeUnknown, fmt.Errorf("empty SQL statement")
	}

	// Parse SQL statement
	stmt, err := p.parser.ParseOneStmt(sql, mysql.UTF8MB4Charset, mysql.UTF8MB4GeneralCICollation)
	if err != nil {
		return sqlparser.OperationTypeUnknown, fmt.Errorf("failed to parse SQL: %v", err)
	}

	// Identify the statement type
	switch stmt.(type) {
	case *ast.SelectStmt:
		return sqlparser.OperationTypeSelect, nil
	case *ast.InsertStmt:
		return sqlparser.OperationTypeInsert, nil
	case *ast.UpdateStmt:
		return sqlparser.OperationTypeUpdate, nil
	case *ast.DeleteStmt:
		return sqlparser.OperationTypeDelete, nil
	case *ast.CreateTableStmt:
		return sqlparser.OperationTypeCreate, nil
	case *ast.AlterTableStmt:
		return sqlparser.OperationTypeAlter, nil
	case *ast.DropTableStmt:
		return sqlparser.OperationTypeDrop, nil
	case *ast.TruncateTableStmt:
		return sqlparser.OperationTypeTruncate, nil
	default:
		// Handle other statement types if needed
		return sqlparser.OperationTypeUnknown, nil
	}
}

// AddColumnsToInsertSQL takes an original insert SQL and columns to add (with values), returns the modified SQL.
// addCols: a slice of ColumnValue, where each element represents a column and its value to be inserted for every row.
// primaryKeyValue: a PrimaryKeyValue struct that contains the primary key column name and its values for every row, only supported for single primary key.
// If isParam is true, placeholders (?) will be added as values, otherwise the actual values from addCols will be used.
func (p *Impl) AddColumnsToInsertSQL(origSQL string, addCols []sqlparser.ColumnValue, primaryKeyValue *sqlparser.PrimaryKeyValue, isParam bool) (string, map[string]bool, error) {
	if len(addCols) == 0 {
		return origSQL, nil, nil
	}

	stmt, err := parser.New().ParseOneStmt(origSQL, mysql.UTF8MB4Charset, mysql.UTF8MB4GeneralCICollation)
	if err != nil {
		return "", nil, fmt.Errorf("failed to parse SQL: %v", err)
	}
	insertStmt, ok := stmt.(*ast.InsertStmt)
	if !ok {
		return "", nil, fmt.Errorf("not an INSERT statement")
	}

	existingCols := make(map[string]bool)
	for _, col := range insertStmt.Columns {
		existingCols[col.Name.O] = true
	}

	colsToAdd := make([]sqlparser.ColumnValue, 0, len(addCols))
	for _, colVal := range addCols {
		if !existingCols[colVal.ColName] {
			colsToAdd = append(colsToAdd, colVal)
		}
	}
	if len(colsToAdd) == 0 {
		return origSQL, existingCols, nil
	}

	rowCount := len(insertStmt.Lists)
	if rowCount == 0 && insertStmt.Setlist {
		rowCount = 1
	}

	for _, colVal := range colsToAdd {
		insertStmt.Columns = append(insertStmt.Columns, &ast.ColumnName{Name: ast.NewCIStr(colVal.ColName)})
	}

	if primaryKeyValue != nil && !existingCols[primaryKeyValue.ColName] {
		insertStmt.Columns = append(insertStmt.Columns, &ast.ColumnName{Name: ast.NewCIStr(primaryKeyValue.ColName)})
	}

	for i := 0; i < rowCount; i++ {
		paramCount := 0

		for _, colVal := range colsToAdd {
			if isParam {
				valExpr := ast.NewParamMarkerExpr(paramCount)
				insertStmt.Lists[i] = append(insertStmt.Lists[i], valExpr)
				paramCount++
			} else {
				insertStmt.Lists[i] = append(insertStmt.Lists[i], ast.NewValueExpr(colVal.Value, "", ""))
			}
		}

		if primaryKeyValue != nil && !existingCols[primaryKeyValue.ColName] {
			if isParam {
				valExpr := ast.NewParamMarkerExpr(paramCount)
				insertStmt.Lists[i] = append(insertStmt.Lists[i], valExpr)
				paramCount++
			} else {
				insertStmt.Lists[i] = append(insertStmt.Lists[i], ast.NewValueExpr(primaryKeyValue.Values[i], "", ""))
			}
		}
	}

	var sb strings.Builder
	flags := format.RestoreStringSingleQuotes | format.RestoreStringWithoutCharset
	restoreCtx := format.NewRestoreCtx(flags, &sb)
	err = insertStmt.Restore(restoreCtx)
	if err != nil {
		return "", nil, fmt.Errorf("failed to restore modified INSERT SQL: %v", err)
	}

	return sb.String(), existingCols, nil
}

// GetTableName extracts the table name from a SQL statement. Only supports single-table select/insert/update/delete.
func (p *Impl) GetTableName(sql string) (string, error) {
	if sql == "" {
		return "", fmt.Errorf("empty SQL statement")
	}
	stmt, err := p.parser.ParseOneStmt(sql, mysql.UTF8MB4Charset, mysql.UTF8MB4GeneralCICollation)
	if err != nil {
		return "", fmt.Errorf("failed to parse SQL: %v", err)
	}

	switch s := stmt.(type) {
	case *ast.SelectStmt:
		if s.From == nil || s.From.TableRefs == nil {
			return "", fmt.Errorf("no table found in SELECT")
		}
		tableSrc, ok := s.From.TableRefs.Left.(*ast.TableSource)
		if !ok {
			return "", fmt.Errorf("unsupported SELECT FROM structure")
		}
		tableName, ok := tableSrc.Source.(*ast.TableName)
		if !ok {
			return "", fmt.Errorf("unsupported SELECT FROM structure (not a table)")
		}
		return tableName.Name.O, nil
	case *ast.InsertStmt:
		if s.Table == nil || s.Table.TableRefs == nil {
			return "", fmt.Errorf("no table found in INSERT")
		}
		tableSrc, ok := s.Table.TableRefs.Left.(*ast.TableSource)
		if !ok {
			return "", fmt.Errorf("unsupported INSERT INTO structure")
		}
		tableName, ok := tableSrc.Source.(*ast.TableName)
		if !ok {
			return "", fmt.Errorf("unsupported INSERT INTO structure (not a table)")
		}
		return tableName.Name.O, nil
	case *ast.UpdateStmt:
		if s.TableRefs == nil {
			return "", fmt.Errorf("no table found in UPDATE")
		}
		tableSrc, ok := s.TableRefs.TableRefs.Left.(*ast.TableSource)
		if !ok {
			return "", fmt.Errorf("unsupported UPDATE structure")
		}
		tableName, ok := tableSrc.Source.(*ast.TableName)
		if !ok {
			return "", fmt.Errorf("unsupported UPDATE structure (not a table)")
		}
		return tableName.Name.O, nil
	case *ast.DeleteStmt:
		if s.TableRefs == nil {
			return "", fmt.Errorf("no table found in DELETE")
		}
		tableSrc, ok := s.TableRefs.TableRefs.Left.(*ast.TableSource)
		if !ok {
			return "", fmt.Errorf("unsupported DELETE structure")
		}
		tableName, ok := tableSrc.Source.(*ast.TableName)
		if !ok {
			return "", fmt.Errorf("unsupported DELETE structure (not a table)")
		}
		return tableName.Name.O, nil
	default:
		return "", fmt.Errorf("unsupported SQL statement type for table name extraction")
	}
}

func (p *Impl) GetInsertDataNums(sql string) (int, error) {
	stmt, err := p.parser.ParseOneStmt(sql, mysql.UTF8MB4Charset, mysql.UTF8MB4GeneralCICollation)
	if err != nil {
		return 0, err
	}

	insert, ok := stmt.(*ast.InsertStmt)
	if !ok {
		return 0, fmt.Errorf("not an insert statement")
	}

	return len(insert.Lists), nil
}
func (p *Impl) AppendSQLFilter(sql string, op sqlparser.SQLFilterOp, filter string) (string, error) {
	if sql == "" {
		return "", fmt.Errorf("empty SQL statement")
	}
	if op == "" || (op != sqlparser.SQLFilterOpAnd && op != sqlparser.SQLFilterOpOr) {
		return "", fmt.Errorf("invalid filter operator: %s", op)
	}
	if filter == "" {
		return "", fmt.Errorf("empty filter condition")
	}
	stmtNode, err := p.parser.ParseOneStmt(sql, mysql.UTF8MB4Charset, mysql.UTF8MB4GeneralCICollation)
	if err != nil {
		return "", fmt.Errorf("failed to parse SQL: %v", err)
	}
	// extract WHERE clause
	var originalWhere ast.ExprNode
	switch stmt := stmtNode.(type) {
	case *ast.SelectStmt:
		originalWhere = stmt.Where
	case *ast.UpdateStmt:
		originalWhere = stmt.Where
	case *ast.DeleteStmt:
		originalWhere = stmt.Where
	default:
		return "", fmt.Errorf("append filter condition failed: only support SELECT/UPDATE/DELETE")
	}
	tmpSQL := fmt.Sprintf("SELECT * FROM tmp WHERE %s", filter)
	tmpNode, err := p.parser.ParseOneStmt(tmpSQL, mysql.UTF8MB4Charset, mysql.UTF8MB4GeneralCICollation)
	if err != nil {
		return "", fmt.Errorf("parse filter condition failed: %v", err)
	}
	newExpr := tmpNode.(*ast.SelectStmt).Where
	mergedExpr := mergeExpr(originalWhere, newExpr, op)
	// update AST
	switch stmt := stmtNode.(type) {
	case *ast.SelectStmt:
		stmt.Where = mergedExpr
	case *ast.UpdateStmt:
		stmt.Where = mergedExpr
	case *ast.DeleteStmt:
		stmt.Where = mergedExpr
	}

	// regenerate SQL
	var sb strings.Builder
	flags := format.RestoreStringSingleQuotes | format.RestoreStringWithoutCharset | format.RestoreNameBackQuotes
	restoreCtx := format.NewRestoreCtx(flags, &sb)
	if err := stmtNode.Restore(restoreCtx); err != nil {
		return "", fmt.Errorf("gen SQL failed: %v", err)
	}
	return sb.String(), nil
}

func mergeExpr(left, right ast.ExprNode, op sqlparser.SQLFilterOp) ast.ExprNode {
	if left == nil {
		return right
	}
	if right == nil {
		return left
	}

	switch op {
	case sqlparser.SQLFilterOpAnd:
		return &ast.BinaryOperationExpr{
			Op: opcode.LogicAnd,
			L:  left,
			R:  right,
		}
	case sqlparser.SQLFilterOpOr:
		return &ast.BinaryOperationExpr{
			Op: opcode.LogicOr,
			L:  left,
			R:  right,
		}
	default:
		return nil
	}
}

func (p *Impl) AddSelectFieldsToSelectSQL(origSQL string, cols []string) (string, error) {
	if origSQL == "" {
		return "", fmt.Errorf("empty SQL statement")
	}
	stmtNode, err := p.parser.ParseOneStmt(origSQL, mysql.UTF8MB4Charset, mysql.UTF8MB4GeneralCICollation)
	if err != nil {
		return "", fmt.Errorf("failed to parse SQL: %v", err)
	}
	stmt, ok := stmtNode.(*ast.SelectStmt)
	if !ok {
		return "", fmt.Errorf("not a select statement")
	}
	if containsAggregate(stmt) || isSelectAll(stmt) {
		return origSQL, nil
	}
	for _, col := range cols {
		stmt.Fields.Fields = append(stmt.Fields.Fields, &ast.SelectField{
			Expr: &ast.ColumnNameExpr{
				Name: &ast.ColumnName{
					Name: ast.CIStr{O: col, L: strings.ToLower(col)},
				},
			},
		})
	}
	var sb strings.Builder
	restoreCtx := format.NewRestoreCtx(format.DefaultRestoreFlags, &sb)
	if err := stmt.Restore(restoreCtx); err != nil {
		return "", err
	}

	return sb.String(), nil
}

type aggregateVisitor struct {
	hasAggregate bool
}

func (v *aggregateVisitor) Enter(n ast.Node) (node ast.Node, skipChildren bool) {
	switch n.(type) {
	case *ast.AggregateFuncExpr:
		v.hasAggregate = true
		return n, true
	}
	return n, false
}

func (v *aggregateVisitor) Leave(n ast.Node) (node ast.Node, ok bool) {
	return n, true
}

func containsAggregate(stmt *ast.SelectStmt) bool {
	visitor := &aggregateVisitor{}
	stmt.Accept(visitor)
	return visitor.hasAggregate
}
func isSelectAll(stmt *ast.SelectStmt) bool {
	for _, field := range stmt.Fields.Fields {
		if field.WildCard != nil {
			return true
		}
		if columnExpr, ok := field.Expr.(*ast.ColumnNameExpr); ok {
			if columnExpr.Name.Name.L == "*" {
				return true
			}
		}
	}
	return false
}
