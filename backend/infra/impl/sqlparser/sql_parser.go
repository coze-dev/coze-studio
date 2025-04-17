package sqlparser

import (
	"fmt"
	"strings"

	"github.com/pingcap/tidb/pkg/parser"
	"github.com/pingcap/tidb/pkg/parser/ast"
	"github.com/pingcap/tidb/pkg/parser/format"
	"github.com/pingcap/tidb/pkg/parser/mysql"
	_ "github.com/pingcap/tidb/pkg/parser/test_driver"

	"code.byted.org/flow/opencoze/backend/infra/contract/sqlparser"
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
