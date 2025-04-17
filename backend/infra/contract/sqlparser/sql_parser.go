package sqlparser

// TableColumn represents table and column name mapping
type TableColumn struct {
	NewTableName *string           // if nil, not replace table name
	ColumnMap    map[string]string // Column name mapping: key is original column name, value is new column name
}

// SQLParser defines the interface for parsing and modifying SQL statements
type SQLParser interface {
	// ParseAndModifySQL parses SQL and replaces table/column names according to the provided message
	ParseAndModifySQL(sql string, tableColumns map[string]TableColumn) (string, error) // tableColumns Original table name -> new TableInfo
}
