package entity

type TableStatus int64

const (
	TableStatus_Online TableStatus = 1
	TableStatus_Delete TableStatus = 2
	TableStatus_Draft  TableStatus = 3
)

type DatabaseRWMode int64

const (
	BotTableRWMode_LimitedReadWrite   DatabaseRWMode = 1
	BotTableRWMode_ReadOnly           DatabaseRWMode = 2
	BotTableRWMode_UnlimitedReadWrite DatabaseRWMode = 3
	BotTableRWMode_RWModeMax          DatabaseRWMode = 4
)

type FieldItemType int64

const (
	FieldItemType_Text    FieldItemType = 1
	FieldItemType_Number  FieldItemType = 2
	FieldItemType_Date    FieldItemType = 3
	FieldItemType_Float   FieldItemType = 4
	FieldItemType_Boolean FieldItemType = 5
)

type TableType int64

const (
	TableType_DraftTable  TableType = 1
	TableType_OnlineTable TableType = 2
)

type OperateType int64

const (
	OperateType_Custom OperateType = 0
	OperateType_Insert OperateType = 1
	OperateType_Update OperateType = 2
	OperateType_Delete OperateType = 3
	OperateType_Select OperateType = 4
)

type SortDirection int64

const (
	SortDirection_ASC  SortDirection = 1
	SortDirection_Desc SortDirection = 2
)

type Operation int64

const (
	Operation_EQUAL         Operation = 1
	Operation_NOT_EQUAL     Operation = 2
	Operation_GREATER_THAN  Operation = 3
	Operation_LESS_THAN     Operation = 4
	Operation_GREATER_EQUAL Operation = 5
	Operation_LESS_EQUAL    Operation = 6
	Operation_IN            Operation = 7
	Operation_NOT_IN        Operation = 8
	Operation_IS_NULL       Operation = 9
	Operation_IS_NOT_NULL   Operation = 10
	Operation_LIKE          Operation = 11
	Operation_NOT_LIKE      Operation = 12
)

type Logic int64

const (
	Logic_And Logic = 1
	Logic_Or  Logic = 2
)
