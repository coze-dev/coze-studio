package entity

type Column struct {
	Name          string // 保证唯一性
	DataType      DataType
	Length        *int
	NotNull       bool
	DefaultValue  *string
	AutoIncrement bool // 表示该列是否为自动递增
	Comment       *string
}

type Index struct {
	Name    string
	Type    IndexType
	Columns []string
}

type TableOption struct {
	Collate       *string
	AutoIncrement *int64 // 设置表的自动递增初始值
	Comment       *string
}

type Table struct {
	Name      string // 保证唯一性
	Columns   []*Column
	Indexes   []*Index
	Options   *TableOption
	CreatedAt int64
	UpdatedAt int64
}

type ResultSet struct {
	Columns      []string
	Rows         []map[string]interface{}
	AffectedRows int64
}
