package entity

type DataType string

const (
	TypeInt       DataType = "INT"
	TypeVarchar   DataType = "VARCHAR"
	TypeText      DataType = "TEXT"
	TypeBoolean   DataType = "BOOLEAN"
	TypeJson      DataType = "JSON"
	TypeTimestamp DataType = "TIMESTAMP"
)

type IndexType string

const (
	PrimaryKey IndexType = "PRIMARY KEY"
	UniqueKey  IndexType = "UNIQUE KEY"
	NormalKey  IndexType = "KEY"
	FullText   IndexType = "FULLTEXT"
)

// AlterTableAction 定义修改表的动作类型
type AlterTableAction string

const (
	AddColumn    AlterTableAction = "ADD COLUMN"
	DropColumn   AlterTableAction = "DROP COLUMN"
	ModifyColumn AlterTableAction = "MODIFY COLUMN"
	RenameColumn AlterTableAction = "RENAME COLUMN"
	AddIndex     AlterTableAction = "ADD INDEX"
)

type LogicalOperator string

const (
	AND LogicalOperator = "AND"
	OR  LogicalOperator = "OR"
)

type Operator string

const (
	OperatorEqual        Operator = "="
	OperatorNotEqual     Operator = "!="
	OperatorGreater      Operator = ">"
	OperatorGreaterEqual Operator = ">="
	OperatorLess         Operator = "<"
	OperatorLessEqual    Operator = "<="

	OperatorLike    Operator = "LIKE"
	OperatorNotLike Operator = "NOT LIKE"

	OperatorIn    Operator = "IN"
	OperatorNotIn Operator = "NOT IN"

	OperatorIsNull    Operator = "IS NULL"
	OperatorIsNotNull Operator = "IS NOT NULL"
)

type SortDirection string

const (
	SortDirectionAsc  SortDirection = "ASC"  // 升序
	SortDirectionDesc SortDirection = "DESC" // 降序
)
