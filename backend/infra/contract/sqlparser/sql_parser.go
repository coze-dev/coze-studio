package sqlparser

// TableColumn represents table and column name mapping
type TableColumn struct {
	NewTableName *string           // if nil, not replace table name
	ColumnMap    map[string]string // Column name mapping: key is original column name, value is new column name
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

	AddColumnsToInsertSQL(origSQL string, addCols map[string]interface{}) (string, error)
}
