package entity

type TableRWMode int64

const (
	TableRWModeLimitedReadWrite   TableRWMode = 1
	TableRWModeReadOnly           TableRWMode = 2
	TableRWModeUnlimitedReadWrite TableRWMode = 3
	TableRWModeRWModeMax          TableRWMode = 4
)

type DatabaseFieldType int64

const (
	FieldItemTypeText    DatabaseFieldType = 1
	FieldItemTypeNumber  DatabaseFieldType = 2
	FieldItemTypeDate    DatabaseFieldType = 3
	FieldItemTypeFloat   DatabaseFieldType = 4
	FieldItemTypeBoolean DatabaseFieldType = 5
)
