package sqlparser

// TableColumn represents table and column name mapping
type TableColumn struct {
	NewTableName *string           // if nil, not replace table name
	ColumnMap    map[string]string // Column name mapping: key is original column name, value is new column name
}

type ColumnValue struct {
	ColName string
	Value   interface{}
}

type PrimaryKeyValue struct {
	ColName string
	Values  []interface{}
}

// OperationType represents the type of SQL operation
type OperationType string

// SQL operation types
const (
	OperationTypeSelect   OperationType = "SELECT"
	OperationTypeInsert   OperationType = "INSERT"
	OperationTypeUpdate   OperationType = "UPDATE"
	OperationTypeDelete   OperationType = "DELETE"
	OperationTypeCreate   OperationType = "CREATE"
	OperationTypeAlter    OperationType = "ALTER"
	OperationTypeDrop     OperationType = "DROP"
	OperationTypeTruncate OperationType = "TRUNCATE"
	OperationTypeUnknown  OperationType = "UNKNOWN"
)

// SQLParser defines the interface for parsing and modifying SQL statements
type SQLParser interface {
	// ParseAndModifySQL parses SQL and replaces table/column names according to the provided message
	ParseAndModifySQL(sql string, tableColumns map[string]TableColumn) (string, error) // tableColumns Original table name -> new TableInfo

	// GetSQLOperation identifies the operation type in the SQL statement
	GetSQLOperation(sql string) (OperationType, error)

	// AddColumnsToInsertSQL adds columns to the INSERT SQL statement.
	AddColumnsToInsertSQL(origSQL string, addCols []ColumnValue, colVals *PrimaryKeyValue, isParam bool) (string, map[string]bool, error)

	// GetTableName extracts the table name from a SQL statement. Only supports single-table select/insert/update/delete. If it has multiple tables, return first table name.
	GetTableName(sql string) (string, error)

	// GetInsertDataNums extracts the number of rows to be inserted from a SQL statement. Only supports single-table insert.
	GetInsertDataNums(sql string) (int, error)
}
