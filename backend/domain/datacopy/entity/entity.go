package entity

type CopyDataTask struct {
	ID            int64  // 本次任务的ID
	TaskUniqKey   string // 复制任务的唯一标志
	OriginDataID  int64
	TargetDataID  int64
	OriginSpaceID int64
	TargetSpaceID int64
	OriginUserID  int64
	TargetUserID  int64
	OriginAppID   int64
	TargetAppID   int64
	DataType      DataType
	StartTime     int64 // 任务开始时间ms
	FinishTime    int64 // 任务结束时间ms
	ExtInfo       string
	ErrorMsg      string // 复制失败的错误信息
}
type DataCopyTaskStatus int

const (
	DataCopyTaskStatusCreate     DataCopyTaskStatus = 1
	DataCopyTaskStatusInProgress DataCopyTaskStatus = 2
	DataCopyTaskStatusSuccess    DataCopyTaskStatus = 3
	DataCopyTaskStatusFail       DataCopyTaskStatus = 4
)

type DataType int

const (
	DataTypeKnowledge DataType = 1
	DataTypeDatabase  DataType = 2
	DataTypeVariable  DataType = 3
)
